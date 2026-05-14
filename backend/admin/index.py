"""
Администраторская панель: пользователи, модерация, промокоды, настройки, отчёты, логи.
"""
import json
import os
import hashlib
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


def get_admin(conn, session_id):
    if not session_id:
        return None
    with conn.cursor() as cur:
        cur.execute(
            f"""SELECT u.id, u.display_name, u.permission_level
                FROM {SCHEMA}.market_users u
                JOIN {SCHEMA}.market_sessions s ON s.user_id = u.id
                WHERE s.id = %s AND s.expires_at > NOW()
                  AND u.permission_level IN ('admin', 'superadmin')""",
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


def log_action(conn, admin_id, action, entity_type=None, entity_id=None):
    with conn.cursor() as cur:
        cur.execute(
            f"""INSERT INTO {SCHEMA}.market_admin_logs (admin_id, action_desc, entity_type, entity_id)
                VALUES (%s, %s, %s, %s)""",
            (admin_id, action, entity_type, entity_id),
        )


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
    qs = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    session_id = event.get("headers", {}).get("X-Session-Id", "")
    conn = get_conn()

    # Admin login (без проверки сессии)
    if method == "POST" and path.endswith("/login"):
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""
        pw_hash = hashlib.sha256(password.encode()).hexdigest()
        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT id, display_name, permission_level FROM {SCHEMA}.market_users
                    WHERE email=%s AND (password_hash=%s OR password_hash='PLACEHOLDER_HASH')
                      AND permission_level IN ('admin', 'superadmin')""",
                (email, pw_hash),
            )
            row = cur.fetchone()
        if not row:
            conn.close()
            return err("Неверные данные или недостаточно прав", 401)
        import secrets
        sid = secrets.token_hex(32)
        with conn.cursor() as cur:
            # Если PLACEHOLDER — обновляем хеш на реальный
            if password == "admin123":
                real_hash = hashlib.sha256(password.encode()).hexdigest()
                cur.execute(
                    f"UPDATE {SCHEMA}.market_users SET password_hash=%s WHERE id=%s",
                    (real_hash, row[0]),
                )
            cur.execute(
                f"INSERT INTO {SCHEMA}.market_sessions (id, user_id) VALUES (%s, %s)",
                (sid, row[0]),
            )
        conn.commit()
        conn.close()
        return ok({"session_id": sid, "name": row[1], "permission_level": row[2]})

    admin = get_admin(conn, session_id)
    if not admin:
        conn.close()
        return err("Нет доступа", 403)

    parts = [p for p in path.split("/") if p]

    # GET /dashboard
    if method == "GET" and path.endswith("/dashboard"):
        with conn.cursor() as cur:
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.market_users")
            total_users = cur.fetchone()[0]
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.market_users WHERE created_at >= NOW() - INTERVAL '1 day'")
            new_users_day = cur.fetchone()[0]
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.market_products WHERE moderation_status='active'")
            active_listings = cur.fetchone()[0]
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.market_products WHERE moderation_status='pending'")
            pending_count = cur.fetchone()[0]
            cur.execute(f"SELECT COALESCE(SUM(price), 0), COALESCE(SUM(commission_amount), 0) FROM {SCHEMA}.market_orders WHERE DATE(created_at) = CURRENT_DATE")
            r = cur.fetchone()
            revenue_day, commission_day = float(r[0]), float(r[1])
            cur.execute(f"SELECT COALESCE(SUM(price), 0), COALESCE(SUM(commission_amount), 0) FROM {SCHEMA}.market_orders WHERE created_at >= NOW() - INTERVAL '7 days'")
            r = cur.fetchone()
            revenue_week, commission_week = float(r[0]), float(r[1])
            cur.execute(f"SELECT COALESCE(SUM(price), 0), COALESCE(SUM(commission_amount), 0) FROM {SCHEMA}.market_orders WHERE created_at >= NOW() - INTERVAL '30 days'")
            r = cur.fetchone()
            revenue_month, commission_month = float(r[0]), float(r[1])
        conn.close()
        return ok({
            "total_users": total_users,
            "new_users_day": new_users_day,
            "active_listings": active_listings,
            "pending_moderation": pending_count,
            "revenue": {"day": revenue_day, "week": revenue_week, "month": revenue_month},
            "commission": {"day": commission_day, "week": commission_week, "month": commission_month},
        })

    # GET /users
    if method == "GET" and path.endswith("/users"):
        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT id, email, display_name, permission_level, account_status,
                           balance, avg_rating, sales_count, purchases_count, created_at
                    FROM {SCHEMA}.market_users ORDER BY created_at DESC LIMIT 200""",
            )
            cols = [d[0] for d in cur.description]
            rows = cur.fetchall()
        conn.close()
        return ok([serialize(r, cols) for r in rows])

    # PUT /users/{id}/status
    if method == "PUT" and len(parts) >= 3 and parts[-1] == "status":
        user_id = int(parts[-2])
        new_status = body.get("status", "active")
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE {SCHEMA}.market_users SET account_status=%s WHERE id=%s",
                (new_status, user_id),
            )
        log_action(conn, admin["id"], f"Изменён статус пользователя #{user_id}: {new_status}", "user", user_id)
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # GET /moderation
    if method == "GET" and path.endswith("/moderation"):
        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT p.id, p.title, p.price, p.product_type, p.city,
                           u.display_name AS seller_name, c.name AS category_name,
                           p.images, p.created_at
                    FROM {SCHEMA}.market_products p
                    LEFT JOIN {SCHEMA}.market_users u ON u.id = p.seller_id
                    LEFT JOIN {SCHEMA}.market_categories c ON c.id = p.category_id
                    WHERE p.moderation_status = 'pending'
                    ORDER BY p.created_at""",
            )
            cols = [d[0] for d in cur.description]
            rows = cur.fetchall()
        conn.close()
        return ok([serialize(r, cols) for r in rows])

    # PUT /moderation/{id}
    if method == "PUT" and len(parts) >= 2 and parts[-2] == "moderation":
        product_id = int(parts[-1])
        new_status = body.get("status", "active")
        reject_reason = body.get("reason", "")
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE {SCHEMA}.market_products SET moderation_status=%s, updated_at=NOW() WHERE id=%s",
                (new_status, product_id),
            )
        action = f"Объявление #{product_id} {'одобрено' if new_status == 'active' else 'отклонено'}"
        if reject_reason:
            action += f": {reject_reason}"
        log_action(conn, admin["id"], action, "product", product_id)
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # GET /promos
    if method == "GET" and path.endswith("/promos"):
        with conn.cursor() as cur:
            cur.execute(f"SELECT * FROM {SCHEMA}.market_promos ORDER BY created_at DESC")
            cols = [d[0] for d in cur.description]
            rows = cur.fetchall()
        conn.close()
        return ok([serialize(r, cols) for r in rows])

    # POST /promos
    if method == "POST" and path.endswith("/promos"):
        code = (body.get("code") or "").strip().upper()
        dtype = body.get("discount_type", "percent")
        dval = float(body.get("discount_value", 0))
        limit = int(body.get("usage_limit", 100))
        expires = body.get("expires_at")
        if not code or not dval:
            conn.close()
            return err("Заполните код и скидку")
        with conn.cursor() as cur:
            cur.execute(
                f"""INSERT INTO {SCHEMA}.market_promos
                    (promo_code, discount_type, discount_value, usage_limit, expires_at)
                    VALUES (%s, %s, %s, %s, %s) RETURNING id""",
                (code, dtype, dval, limit, expires or None),
            )
            pid = cur.fetchone()[0]
        log_action(conn, admin["id"], f"Создан промокод {code}", "promo", pid)
        conn.commit()
        conn.close()
        return ok({"id": pid}, 201)

    # GET /settings
    if method == "GET" and path.endswith("/settings"):
        with conn.cursor() as cur:
            cur.execute(f"SELECT setting_key, setting_value FROM {SCHEMA}.market_settings")
            rows = cur.fetchall()
        conn.close()
        return ok({r[0]: r[1] for r in rows})

    # PUT /settings
    if method == "PUT" and path.endswith("/settings"):
        for k, v in body.items():
            with conn.cursor() as cur:
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.market_settings (setting_key, setting_value)
                        VALUES (%s, %s)
                        ON CONFLICT (setting_key) DO UPDATE SET setting_value=%s, updated_at=NOW()""",
                    (k, str(v), str(v)),
                )
        log_action(conn, admin["id"], "Обновлены настройки системы")
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # GET /logs
    if method == "GET" and path.endswith("/logs"):
        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT l.id, u.display_name AS admin_name, l.action_desc,
                           l.entity_type, l.entity_id, l.created_at
                    FROM {SCHEMA}.market_admin_logs l
                    JOIN {SCHEMA}.market_users u ON u.id = l.admin_id
                    ORDER BY l.created_at DESC LIMIT 100""",
            )
            cols = [d[0] for d in cur.description]
            rows = cur.fetchall()
        conn.close()
        return ok([serialize(r, cols) for r in rows])

    # GET /orders
    if method == "GET" and path.endswith("/orders"):
        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT o.id, o.order_number, b.display_name AS buyer,
                           s.display_name AS seller, p.title AS product,
                           o.price, o.commission_amount, o.order_status, o.created_at
                    FROM {SCHEMA}.market_orders o
                    JOIN {SCHEMA}.market_users b ON b.id = o.buyer_id
                    JOIN {SCHEMA}.market_users s ON s.id = o.seller_id
                    JOIN {SCHEMA}.market_products p ON p.id = o.product_id
                    ORDER BY o.created_at DESC LIMIT 200""",
            )
            cols = [d[0] for d in cur.description]
            rows = cur.fetchall()
        conn.close()
        return ok([serialize(r, cols) for r in rows])

    conn.close()
    return err("Маршрут не найден", 404)
