"""
Товары и услуги: каталог, карточка, создание, обновление, удаление, поиск.
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


def get_session_user(conn, session_id: str):
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
    if not row:
        return None
    return {"id": row[0], "display_name": row[1], "permission_level": row[2]}


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
    qs = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    session_id = event.get("headers", {}).get("X-Session-Id", "")
    conn = get_conn()

    # Нормализуем path — убираем function-id prefix, оставляем только хвост
    path_parts = [p for p in path.split("/") if p]
    # path_parts[0] — function id, далее — реальный путь
    sub = "/" + "/".join(path_parts[1:]) if len(path_parts) > 1 else "/"

    # GET /  — список товаров с фильтрами
    if method == "GET" and sub == "/":
        search = qs.get("search", "")
        category = qs.get("category", "")
        product_type = qs.get("type", "")
        price_min = qs.get("price_min", "0")
        price_max = qs.get("price_max", "9999999")
        sort = qs.get("sort", "popular")
        limit = min(int(qs.get("limit", "50")), 100)
        offset = int(qs.get("offset", "0"))
        status_filter = qs.get("status", "active")

        conditions = [f"p.moderation_status = '{status_filter}'"]
        if search:
            conditions.append(f"p.title ILIKE '%{search.replace(chr(39), '')}%'")
        if category:
            conditions.append(f"c.slug = '{category.replace(chr(39), '')}'")
        if product_type in ("product", "service"):
            conditions.append(f"p.product_type = '{product_type}'")
        try:
            conditions.append(f"p.price BETWEEN {float(price_min)} AND {float(price_max)}")
        except Exception:
            pass

        where = " AND ".join(conditions)
        order = {
            "popular": "p.views DESC",
            "rating": "p.avg_rating DESC",
            "price_asc": "p.price ASC",
            "price_desc": "p.price DESC",
            "newest": "p.created_at DESC",
        }.get(sort, "p.views DESC")

        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT p.id, p.seller_id, u.display_name AS seller_name,
                           p.category_id, c.name AS category_name, c.slug AS category_slug,
                           p.title, p.price, p.old_price, p.product_type, p.city,
                           p.moderation_status, p.views, p.avg_rating, p.reviews_count,
                           p.images, p.is_new, p.is_sale, p.created_at
                    FROM {SCHEMA}.market_products p
                    LEFT JOIN {SCHEMA}.market_users u ON u.id = p.seller_id
                    LEFT JOIN {SCHEMA}.market_categories c ON c.id = p.category_id
                    WHERE {where}
                    ORDER BY {order}
                    LIMIT {limit} OFFSET {offset}""",
            )
            cols = [d[0] for d in cur.description]
            rows = cur.fetchall()
            cur.execute(
                f"""SELECT COUNT(*) FROM {SCHEMA}.market_products p
                    LEFT JOIN {SCHEMA}.market_categories c ON c.id = p.category_id
                    WHERE {where}"""
            )
            total = cur.fetchone()[0]

        items = [serialize(r, cols) for r in rows]
        conn.close()
        return ok({"items": items, "total": total, "limit": limit, "offset": offset})

    # GET /categories
    if method == "GET" and sub == "/categories":
        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT c.id, c.name, c.slug, c.icon_name, c.sort_order,
                           COUNT(p.id) AS product_count
                    FROM {SCHEMA}.market_categories c
                    LEFT JOIN {SCHEMA}.market_products p
                      ON p.category_id = c.id AND p.moderation_status = 'active'
                    GROUP BY c.id
                    ORDER BY c.sort_order""",
            )
            cols = [d[0] for d in cur.description]
            rows = cur.fetchall()
        conn.close()
        return ok([serialize(r, cols) for r in rows])

    # GET /{id}
    if method == "GET" and sub.lstrip("/").isdigit():
        product_id = int(sub.lstrip("/"))
        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT p.id, p.seller_id, u.display_name AS seller_name,
                           u.avg_rating AS seller_rating, u.reviews_count AS seller_reviews,
                           p.category_id, c.name AS category_name,
                           p.title, p.description, p.price, p.old_price,
                           p.product_type, p.city, p.moderation_status,
                           p.views, p.avg_rating, p.reviews_count,
                           p.images, p.is_new, p.is_sale, p.created_at
                    FROM {SCHEMA}.market_products p
                    LEFT JOIN {SCHEMA}.market_users u ON u.id = p.seller_id
                    LEFT JOIN {SCHEMA}.market_categories c ON c.id = p.category_id
                    WHERE p.id = {product_id}""",
            )
            cols = [d[0] for d in cur.description]
            row = cur.fetchone()
            # Increment views
            cur.execute(
                f"UPDATE {SCHEMA}.market_products SET views=views+1 WHERE id={product_id}",
            )
        conn.commit()
        conn.close()
        if not row:
            return err("Товар не найден", 404)
        return ok(serialize(row, cols))

    # POST / — создать товар (требует авторизации)
    if method == "POST" and sub == "/":
        user = get_session_user(conn, session_id)
        if not user:
            conn.close()
            return err("Не авторизован", 401)
        title = (body.get("title") or "").strip()
        price = body.get("price")
        if not title or price is None:
            conn.close()
            return err("Укажите название и цену")
        with conn.cursor() as cur:
            cur.execute(
                f"""INSERT INTO {SCHEMA}.market_products
                    (seller_id, category_id, title, description, price, old_price,
                     product_type, city, moderation_status, images, is_new, is_sale)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending', %s, %s, %s)
                    RETURNING id""",
                (
                    user["id"],
                    body.get("category_id"),
                    title,
                    body.get("description", ""),
                    float(price),
                    float(body["old_price"]) if body.get("old_price") else None,
                    body.get("product_type", "product"),
                    body.get("city", ""),
                    json.dumps(body.get("images", [])),
                    bool(body.get("is_new", False)),
                    bool(body.get("is_sale", False)),
                ),
            )
            product_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return ok({"id": product_id, "status": "pending"}, 201)

    # PUT /{id} — обновить
    if method == "PUT" and sub.lstrip("/").isdigit():
        user = get_session_user(conn, session_id)
        if not user:
            conn.close()
            return err("Не авторизован", 401)
        product_id = int(sub.lstrip("/"))
        with conn.cursor() as cur:
            cur.execute(f"SELECT seller_id FROM {SCHEMA}.market_products WHERE id=%s", (product_id,))
            row = cur.fetchone()
        if not row:
            conn.close()
            return err("Не найдено", 404)
        if row[0] != user["id"] and user["permission_level"] not in ("admin", "superadmin"):
            conn.close()
            return err("Нет доступа", 403)
        with conn.cursor() as cur:
            if body.get("moderation_status") and user["permission_level"] in ("admin", "superadmin"):
                cur.execute(
                    f"UPDATE {SCHEMA}.market_products SET moderation_status=%s, updated_at=NOW() WHERE id=%s",
                    (body["moderation_status"], product_id),
                )
            else:
                cur.execute(
                    f"""UPDATE {SCHEMA}.market_products
                        SET title=%s, description=%s, price=%s, city=%s, updated_at=NOW()
                        WHERE id=%s""",
                    (
                        body.get("title"),
                        body.get("description"),
                        body.get("price"),
                        body.get("city"),
                        product_id,
                    ),
                )
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # GET /my — мои объявления
    if method == "GET" and sub == "/my":
        user = get_session_user(conn, session_id)
        if not user:
            conn.close()
            return err("Не авторизован", 401)
        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT p.id, p.title, p.price, p.product_type, p.city,
                           p.moderation_status, p.views, p.avg_rating, p.created_at,
                           c.name AS category_name, p.images
                    FROM {SCHEMA}.market_products p
                    LEFT JOIN {SCHEMA}.market_categories c ON c.id = p.category_id
                    WHERE p.seller_id = {user['id']}
                    ORDER BY p.created_at DESC""",
            )
            cols = [d[0] for d in cur.description]
            rows = cur.fetchall()
        conn.close()
        return ok([serialize(r, cols) for r in rows])

    conn.close()
    return err("Маршрут не найден", 404)