const URLS = {
  auth: "https://functions.poehali.dev/bf9f48c7-b321-442a-9788-a263d2a9f66d",
  orders: "https://functions.poehali.dev/608d0138-1db0-42e4-879a-2cc2e668e72e",
  cart: "https://functions.poehali.dev/8a43135d-fa0b-4548-9e5b-31d1b86322b1",
  products: "https://functions.poehali.dev/118a55f6-f35f-4514-bad2-fdf724316cad",
  admin: "https://functions.poehali.dev/bc52a8f1-637b-47cd-92c5-f86afb05d338",
};

const SESSION_KEY = "market_session";

export function getSession(): string {
  return localStorage.getItem(SESSION_KEY) || "";
}

export function setSession(id: string) {
  localStorage.setItem(SESSION_KEY, id);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

async function request(
  service: keyof typeof URLS,
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = URLS[service] + path;
  const session = getSession();
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session ? { "X-Session-Id": session } : {}),
      ...(options.headers || {}),
    },
  });
}

async function json<T>(
  service: keyof typeof URLS,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await request(service, path, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка запроса");
  return data as T;
}

// ── AUTH ──────────────────────────────────────────────────
export const auth = {
  register: (email: string, password: string, name: string) =>
    json<{ session_id: string; user_id: number; name: string }>(
      "auth", "/register",
      { method: "POST", body: JSON.stringify({ email, password, name }) }
    ),

  login: (email: string, password: string) =>
    json<{ session_id: string; user_id: number; name: string; permission_level: string }>(
      "auth", "/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  logout: () =>
    json<{ ok: boolean }>("auth", "/logout", { method: "POST" }),

  me: () =>
    json<{
      id: number; email: string; display_name: string; phone?: string;
      city?: string; bio?: string; permission_level: string;
      account_status: string; balance: number; avg_rating: number;
      reviews_count: number; sales_count: number; purchases_count: number;
    }>("auth", "/me"),

  updateMe: (data: Record<string, string>) =>
    json<{ ok: boolean }>("auth", "/me", { method: "PUT", body: JSON.stringify(data) }),
};

// ── PRODUCTS ──────────────────────────────────────────────
export type ApiProduct = {
  id: number; title: string; price: number; old_price?: number;
  seller_id: number; seller_name: string; category_name: string;
  category_slug: string; product_type: "product" | "service";
  city: string; moderation_status: string; views: number;
  avg_rating: number; reviews_count: number; images: string[];
  is_new: boolean; is_sale: boolean; created_at: string;
};

export const products = {
  list: (params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return json<{ items: ApiProduct[]; total: number }>("products", "/" + (qs ? `?${qs}` : ""));
  },

  categories: () =>
    json<{ id: number; name: string; slug: string; icon_name: string; product_count: number }[]>(
      "products", "/categories"
    ),

  get: (id: number) => json<ApiProduct>("products", `/${id}`),

  create: (data: Record<string, unknown>) =>
    json<{ id: number; status: string }>(
      "products", "/",
      { method: "POST", body: JSON.stringify(data) }
    ),

  update: (id: number, data: Record<string, unknown>) =>
    json<{ ok: boolean }>("products", `/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  my: () => json<ApiProduct[]>("products", "/my"),
};

// ── CART ──────────────────────────────────────────────────
export type CartItem = {
  id: number; product_id: number; title: string; price: number;
  old_price?: number; quantity: number; images: string[];
  seller_name: string; category_name: string; city: string;
};

export const cart = {
  get: () => json<{ items: CartItem[]; total: number }>("cart", "/"),
  add: (product_id: number, quantity = 1) =>
    json<{ id: number; quantity: number }>(
      "cart", "/",
      { method: "POST", body: JSON.stringify({ product_id, quantity }) }
    ),
  update: (item_id: number, quantity: number) =>
    json<{ ok: boolean }>("cart", `/${item_id}`, { method: "PUT", body: JSON.stringify({ quantity }) }),
  remove: (item_id: number) =>
    json<{ ok: boolean }>("cart", `/${item_id}`, { method: "DELETE" }),
  clear: () => json<{ ok: boolean }>("cart", "/", { method: "DELETE" }),
};

// ── ORDERS ────────────────────────────────────────────────
export type ApiOrder = {
  id: number; order_number: string; buyer_id: number; buyer_name: string;
  seller_id: number; seller_name: string; product_id: number; product_title: string;
  quantity: number; price: number; commission_amount: number;
  order_status: string; tracking_number?: string; promo_code?: string;
  discount_amount: number; created_at: string;
};

export const orders = {
  list: (view: "buyer" | "seller" = "buyer", status?: string) => {
    let qs = `?view=${view}`;
    if (status) qs += `&status=${status}`;
    return json<ApiOrder[]>("orders", "/" + qs);
  },
  get: (id: number) => json<ApiOrder>("orders", `/${id}`),
  create: (data: { items: { product_id: number; quantity: number }[]; promo_code?: string; address?: string }) =>
    json<{ orders: { id: number; order_number: string }[] }>(
      "orders", "/",
      { method: "POST", body: JSON.stringify(data) }
    ),
  updateStatus: (id: number, status: string) =>
    json<{ ok: boolean }>("orders", `/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  messages: (id: number) =>
    json<{ id: number; sender_id: number; sender_name: string; body: string; is_read: boolean; created_at: string }[]>(
      "orders", `/${id}/messages`
    ),
  sendMessage: (id: number, text: string) =>
    json<{ id: number; created_at: string }>("orders", `/${id}/messages`, {
      method: "POST", body: JSON.stringify({ text }),
    }),
};

// ── ADMIN ─────────────────────────────────────────────────
export const adminApi = {
  login: (email: string, password: string) =>
    json<{ session_id: string; name: string; permission_level: string }>(
      "admin", "/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
    ),
  dashboard: () => json<Record<string, unknown>>("admin", "/dashboard"),
  users: () => json<unknown[]>("admin", "/users"),
  updateUserStatus: (id: number, status: string) =>
    json<{ ok: boolean }>("admin", `/users/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  moderation: () => json<unknown[]>("admin", "/moderation"),
  moderateProduct: (id: number, status: string, reason?: string) =>
    json<{ ok: boolean }>("admin", `/moderation/${id}`, { method: "PUT", body: JSON.stringify({ status, reason }) }),
  promos: () => json<unknown[]>("admin", "/promos"),
  createPromo: (data: Record<string, unknown>) =>
    json<{ id: number }>("admin", "/promos", { method: "POST", body: JSON.stringify(data) }),
  settings: () => json<Record<string, string>>("admin", "/settings"),
  updateSettings: (data: Record<string, string>) =>
    json<{ ok: boolean }>("admin", "/settings", { method: "PUT", body: JSON.stringify(data) }),
  logs: () => json<unknown[]>("admin", "/logs"),
  orders: () => json<unknown[]>("admin", "/orders"),
};
