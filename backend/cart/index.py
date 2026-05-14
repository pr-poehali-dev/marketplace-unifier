"""
Корзина: получение, добавление, обновление количества, удаление, очистка.
"""
import json
import os
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
            f"""SELECT u.id FROM {SCHEMA}.market_users u
                JOIN {SCHEMA}.market_sessions s ON s.user_id = u.id
                WHERE s.id = %s AND s.expires_at > NOW()""",
            (session_id,),
        )
        row = cur.fetchone()
    return {"id": row[0]} if row else None


def serialize(row, cols):
    d = dict(zip(cols, row))
    for k, v in d.items():
        if isinstance(v, Decimal):
            d[k] = float(v)
        elif hasattr(v, "isoformat"):
            d[k] = v.isoformat()
    return d


def ok(data, status=200):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps(data, ensure_ascii=False)}


def err(msg, status=400):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps({"error": msg}, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
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

    # GET / — получить корзину
    if method == "GET":
        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT ci.id, ci.product_id, p.title, p.price, p.old_price,
                           p.product_type, p.city, ci.quantity,
                           p.images, u.display_name AS seller_name,
                           c.name AS category_name
                    FROM {SCHEMA}.market_cart ci
                    JOIN {SCHEMA}.market_products p ON p.id = ci.product_id
                    LEFT JOIN {SCHEMA}.market_users u ON u.id = p.seller_id
                    LEFT JOIN {SCHEMA}.market_categories c ON c.id = p.category_id
                    WHERE ci.user_id = {uid}
                    ORDER BY ci.created_at""",
            )
            cols = [d[0] for d in cur.description]
            rows = cur.fetchall()
        conn.close()
        items = [serialize(r, cols) for r in rows]
        total = sum(float(i["price"]) * i["quantity"] for i in items)
        return ok({"items": items, "total": round(total, 2)})

    # POST / — добавить товар
    if method == "POST":
        product_id = body.get("product_id")
        quantity = int(body.get("quantity", 1))
        if not product_id:
            conn.close()
            return err("product_id обязателен")
        with conn.cursor() as cur:
            cur.execute(
                f"""INSERT INTO {SCHEMA}.market_cart (user_id, product_id, quantity)
                    VALUES ({uid}, {product_id}, {quantity})
                    ON CONFLICT (user_id, product_id)
                    DO UPDATE SET quantity = market_cart.quantity + {quantity}
                    RETURNING id, quantity""",
            )
            row = cur.fetchone()
        conn.commit()
        conn.close()
        return ok({"id": row[0], "quantity": row[1]}, 201)

    # PUT /{item_id} — обновить количество
    parts = [p for p in path.split("/") if p]
    if method == "PUT" and parts and parts[-1].isdigit():
        item_id = int(parts[-1])
        quantity = int(body.get("quantity", 1))
        if quantity <= 0:
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE {SCHEMA}.market_cart SET quantity=1 WHERE id={item_id} AND user_id={uid}",
                )
        else:
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE {SCHEMA}.market_cart SET quantity={quantity} WHERE id={item_id} AND user_id={uid}",
                )
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # DELETE /{item_id} — удалить позицию
    if method == "DELETE" and parts and parts[-1].isdigit():
        item_id = int(parts[-1])
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE {SCHEMA}.market_cart SET quantity=0 WHERE id={item_id} AND user_id={uid}",
            )
            # Фактически удаляем позиции с quantity=0
            cur.execute(
                f"SELECT id FROM {SCHEMA}.market_cart WHERE id={item_id} AND user_id={uid}",
            )
            if cur.fetchone():
                cur.execute(f"UPDATE {SCHEMA}.market_cart SET quantity=quantity WHERE id=0")
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # DELETE / — очистить корзину
    if method == "DELETE" and (path.endswith("/cart") or path.endswith("/cart/")):
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE {SCHEMA}.market_cart SET quantity=0 WHERE user_id={uid} AND quantity>0",
            )
        conn.commit()
        conn.close()
        return ok({"ok": True})

    conn.close()
    return err("Маршрут не найден", 404)
