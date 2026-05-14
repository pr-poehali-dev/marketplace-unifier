"""
Заказы: создание, просмотр, смена статуса, сообщения чата по заказу.
"""
import json
import os
import random
import string
import psycopg2
from decimal import Decimal

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p84730444_marketplace_unifier")
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_user(conn, session_id):
    if not session_id:
        return None
    with conn.cursor() as cur:
        cur.execute(
            f"""SELECT u.id, u.display_name, u.permission_level
                FROM {SCHEMA}.market_users u
                JOIN {SCHEMA}.market_sessions s ON s.user_id = u.id
                WHERE s.id = %s AND s.expires_at > NOW()""",
            (session_id,),
        )
        row = cur.fetchone()
    return {"id": row[0], "name": row[1], "permission_level": row[2]} if row else None


def serialize(row, cols):
    d = dict(zip(cols, row))
    for k, v in d.items():
        if isinstance(v, Decimal):
            d[k] = float(v)
        elif hasattr(v, "isoformat"):
            d[k] = v.isoformat()
    return d


def gen_order_number():
    return "ORD-" + "".join(random.choices(string.digits, k=6))


def ok(data, status=200):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps(data, ensure_ascii=False)}


def err(msg, status=400):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps({"error": msg}, ensure_ascii=False)}


def check_promo(conn, promo_code: str, price: float):
    with conn.cursor() as cur:
        cur.execute(
            f"""SELECT id, discount_type, discount_value
                FROM {SCHEMA}.market_promos
                WHERE promo_code=%s AND is_active=true
                  AND (expires_at IS NULL OR expires_at > NOW())
                  AND used_count < usage_limit""",
            (promo_code.upper(),),
        )
        row = cur.fetchone()
    if not row:
        return 0, None
    pid, dtype, dval = row
    discount = float(dval) / 100 * price if dtype == "percent" else float(dval)
    return min(discount, price), pid


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    qs = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    session_id = event.get("headers", {}).get("X-Session-Id", "")
    conn = get_conn()
    user = get_user(conn, session_id)

    if not user:
        conn.close()
        return err("Не авторизован", 401)

    uid = user["id"]
    is_admin = user["permission_level"] in ("admin", "superadmin")
    parts = [p for p in path.split("/") if p]

    # GET / — список заказов
    if method == "GET" and len(parts) <= 1:
        view = qs.get("view", "buyer")
        status_f = qs.get("status", "")
        cond = f"o.buyer_id = {uid}" if view == "buyer" else f"o.seller_id = {uid}"
        if is_admin:
            cond = "1=1"
        if status_f:
            cond += f" AND o.order_status = '{status_f}'"
        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT o.id, o.order_number, o.buyer_id, b.display_name AS buyer_name,
                           o.seller_id, s.display_name AS seller_name,
                           o.product_id, p.title AS product_title,
                           o.quantity, o.price, o.commission_amount,
                           o.order_status, o.tracking_number, o.promo_code,
                           o.discount_amount, o.created_at, o.updated_at
                    FROM {SCHEMA}.market_orders o
                    JOIN {SCHEMA}.market_users b ON b.id = o.buyer_id
                    JOIN {SCHEMA}.market_users s ON s.id = o.seller_id
                    JOIN {SCHEMA}.market_products p ON p.id = o.product_id
                    WHERE {cond}
                    ORDER BY o.created_at DESC""",
            )
            cols = [d[0] for d in cur.description]
            rows = cur.fetchall()
        conn.close()
        return ok([serialize(r, cols) for r in rows])

    # POST / — создать заказ из корзины
    if method == "POST" and len(parts) <= 1:
        items = body.get("items", [])
        promo_code = body.get("promo_code", "")
        address = body.get("address", "")
        delivery_method = body.get("delivery_method", "courier")
        if not items:
            conn.close()
            return err("Корзина пуста")

        created_orders = []
        for item in items:
            product_id = item.get("product_id")
            quantity = int(item.get("quantity", 1))
            with conn.cursor() as cur:
                cur.execute(
                    f"""SELECT seller_id, price, moderation_status
                        FROM {SCHEMA}.market_products WHERE id={product_id}""",
                )
                prow = cur.fetchone()
            if not prow or prow[2] != "active":
                continue
            seller_id, price, _ = prow
            price = float(price)

            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT setting_value FROM {SCHEMA}.market_settings WHERE setting_key='commission_goods'",
                )
                cr = cur.fetchone()
            commission_pct = float(cr[0]) if cr else 10.0

            total_price = price * quantity
            discount, promo_id = check_promo(conn, promo_code, total_price) if promo_code else (0, None)
            commission = round((total_price - discount) * commission_pct / 100, 2)

            order_num = gen_order_number()
            with conn.cursor() as cur:
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.market_orders
                        (order_number, buyer_id, seller_id, product_id, quantity,
                         price, commission_pct, commission_amount, order_status,
                         delivery_method, delivery_address, promo_code, discount_amount)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending', %s, %s, %s, %s)
                        RETURNING id, order_number""",
                    (order_num, uid, seller_id, product_id, quantity, total_price,
                     commission_pct, commission, delivery_method, address,
                     promo_code or None, discount),
                )
                oid, onum = cur.fetchone()
            if promo_id:
                with conn.cursor() as cur:
                    cur.execute(
                        f"UPDATE {SCHEMA}.market_promos SET used_count=used_count+1 WHERE id={promo_id}",
                    )
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE {SCHEMA}.market_users SET purchases_count=purchases_count+1 WHERE id={uid}",
                )
            created_orders.append({"id": oid, "order_number": onum})

        conn.commit()
        conn.close()
        return ok({"orders": created_orders}, 201)

    # GET /{id}
    if method == "GET" and len(parts) >= 1 and parts[-1].isdigit():
        order_id = int(parts[-1])
        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT o.id, o.order_number, o.buyer_id, b.display_name AS buyer_name,
                           o.seller_id, s.display_name AS seller_name,
                           o.product_id, p.title AS product_title, p.images,
                           o.quantity, o.price, o.commission_amount,
                           o.order_status, o.tracking_number, o.promo_code,
                           o.discount_amount, o.delivery_method, o.delivery_address,
                           o.buyer_note, o.created_at, o.updated_at
                    FROM {SCHEMA}.market_orders o
                    JOIN {SCHEMA}.market_users b ON b.id = o.buyer_id
                    JOIN {SCHEMA}.market_users s ON s.id = o.seller_id
                    JOIN {SCHEMA}.market_products p ON p.id = o.product_id
                    WHERE o.id = {order_id}
                      AND (o.buyer_id = {uid} OR o.seller_id = {uid} OR {str(is_admin).lower()})""",
            )
            cols = [d[0] for d in cur.description]
            row = cur.fetchone()
        conn.close()
        if not row:
            return err("Заказ не найден", 404)
        return ok(serialize(row, cols))

    # PUT /{id}/status — сменить статус
    if method == "PUT" and len(parts) >= 2 and parts[-1] == "status":
        order_id = int(parts[-2])
        new_status = body.get("status", "")
        allowed = ["pending", "in_progress", "delivered", "cancelled"]
        if new_status not in allowed:
            conn.close()
            return err("Неверный статус")
        with conn.cursor() as cur:
            cur.execute(
                f"""UPDATE {SCHEMA}.market_orders
                    SET order_status=%s, updated_at=NOW()
                    WHERE id={order_id}
                      AND (seller_id={uid} OR buyer_id={uid} OR {str(is_admin).lower()})""",
                (new_status,),
            )
            affected = cur.rowcount
        conn.commit()
        conn.close()
        if affected == 0:
            return err("Нет доступа", 403)
        return ok({"ok": True})

    # GET /{id}/messages — чат по заказу
    if method == "GET" and len(parts) >= 2 and parts[-1] == "messages":
        order_id = int(parts[-2])
        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT m.id, m.sender_id, u.display_name AS sender_name,
                           m.body, m.is_read, m.created_at
                    FROM {SCHEMA}.market_messages m
                    JOIN {SCHEMA}.market_users u ON u.id = m.sender_id
                    WHERE m.order_id = {order_id}
                    ORDER BY m.created_at""",
            )
            cols = [d[0] for d in cur.description]
            rows = cur.fetchall()
            # Помечаем прочитанными
            cur.execute(
                f"UPDATE {SCHEMA}.market_messages SET is_read=true WHERE order_id={order_id} AND sender_id != {uid}",
            )
        conn.commit()
        conn.close()
        return ok([serialize(r, cols) for r in rows])

    # POST /{id}/messages — отправить сообщение
    if method == "POST" and len(parts) >= 2 and parts[-1] == "messages":
        order_id = int(parts[-2])
        text = (body.get("text") or "").strip()
        if not text:
            conn.close()
            return err("Сообщение пустое")
        with conn.cursor() as cur:
            cur.execute(
                f"""INSERT INTO {SCHEMA}.market_messages (order_id, sender_id, body)
                    VALUES ({order_id}, {uid}, %s) RETURNING id, created_at""",
                (text,),
            )
            mid, ts = cur.fetchone()
        conn.commit()
        conn.close()
        return ok({"id": mid, "created_at": ts.isoformat()}, 201)

    conn.close()
    return err("Маршрут не найден", 404)
