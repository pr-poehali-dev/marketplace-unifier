"""
Аутентификация: регистрация, вход, выход, получение профиля.
"""
import json
import os
import hashlib
import secrets
import psycopg2
from datetime import datetime, timezone

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p84730444_marketplace_unifier")
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def make_session(conn, user_id: int) -> str:
    session_id = secrets.token_hex(32)
    with conn.cursor() as cur:
        cur.execute(
            f"INSERT INTO {SCHEMA}.market_sessions (id, user_id) VALUES (%s, %s)",
            (session_id, user_id),
        )
    conn.commit()
    return session_id


def get_user_by_session(conn, session_id: str):
    with conn.cursor() as cur:
        cur.execute(
            f"""SELECT u.id, u.email, u.display_name, u.phone, u.city, u.bio,
                       u.avatar_url, u.permission_level, u.account_status,
                       u.balance, u.avg_rating, u.reviews_count,
                       u.sales_count, u.purchases_count, u.created_at
                FROM {SCHEMA}.market_users u
                JOIN {SCHEMA}.market_sessions s ON s.user_id = u.id
                WHERE s.id = %s AND s.expires_at > NOW()""",
            (session_id,),
        )
        row = cur.fetchone()
    if not row:
        return None
    cols = ["id", "email", "display_name", "phone", "city", "bio", "avatar_url",
            "permission_level", "account_status", "balance", "avg_rating",
            "reviews_count", "sales_count", "purchases_count", "created_at"]
    user = dict(zip(cols, row))
    if user.get("created_at"):
        user["created_at"] = user["created_at"].isoformat()
    return user


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

    # POST /register
    if method == "POST" and path.endswith("/register"):
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""
        name = (body.get("name") or "").strip()
        if not email or not password or not name:
            conn.close()
            return err("Заполните все поля")
        if len(password) < 6:
            conn.close()
            return err("Пароль минимум 6 символов")
        with conn.cursor() as cur:
            cur.execute(f"SELECT id FROM {SCHEMA}.market_users WHERE email=%s", (email,))
            if cur.fetchone():
                conn.close()
                return err("Email уже зарегистрирован")
            cur.execute(
                f"""INSERT INTO {SCHEMA}.market_users (email, password_hash, display_name)
                    VALUES (%s, %s, %s) RETURNING id""",
                (email, hash_password(password), name),
            )
            user_id = cur.fetchone()[0]
        conn.commit()
        sid = make_session(conn, user_id)
        conn.close()
        return ok({"session_id": sid, "user_id": user_id, "name": name})

    # POST /login
    if method == "POST" and path.endswith("/login"):
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""
        if not email or not password:
            conn.close()
            return err("Введите email и пароль")
        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT id, display_name, permission_level, account_status
                    FROM {SCHEMA}.market_users
                    WHERE email=%s AND password_hash=%s""",
                (email, hash_password(password)),
            )
            row = cur.fetchone()
        if not row:
            conn.close()
            return err("Неверный email или пароль", 401)
        user_id, name, perm, status = row
        if status == "blocked":
            conn.close()
            return err("Аккаунт заблокирован", 403)
        sid = make_session(conn, user_id)
        conn.close()
        return ok({"session_id": sid, "user_id": user_id, "name": name, "permission_level": perm})

    # POST /logout
    if method == "POST" and path.endswith("/logout"):
        if session_id:
            with conn.cursor() as cur:
                cur.execute(f"UPDATE {SCHEMA}.market_sessions SET expires_at=NOW() WHERE id=%s", (session_id,))
            conn.commit()
        conn.close()
        return ok({"ok": True})

    # GET /me
    if method == "GET" and path.endswith("/me"):
        user = get_user_by_session(conn, session_id)
        conn.close()
        if not user:
            return err("Не авторизован", 401)
        return ok(user)

    # PUT /me — обновить профиль
    if method == "PUT" and path.endswith("/me"):
        user = get_user_by_session(conn, session_id)
        if not user:
            conn.close()
            return err("Не авторизован", 401)
        name = body.get("name", user["display_name"])
        phone = body.get("phone", user.get("phone"))
        city = body.get("city", user.get("city"))
        bio = body.get("bio", user.get("bio"))
        with conn.cursor() as cur:
            cur.execute(
                f"""UPDATE {SCHEMA}.market_users
                    SET display_name=%s, phone=%s, city=%s, bio=%s, updated_at=NOW()
                    WHERE id=%s""",
                (name, phone, city, bio, user["id"]),
            )
        conn.commit()
        conn.close()
        return ok({"ok": True})

    conn.close()
    return err("Маршрут не найден", 404)
