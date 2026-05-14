CREATE TABLE IF NOT EXISTS t_p84730444_marketplace_unifier.market_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  city VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  permission_level VARCHAR(20) NOT NULL DEFAULT 'user',
  account_status VARCHAR(20) NOT NULL DEFAULT 'active',
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  reviews_count INT NOT NULL DEFAULT 0,
  sales_count INT NOT NULL DEFAULT 0,
  purchases_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p84730444_marketplace_unifier.market_sessions (
  id VARCHAR(128) PRIMARY KEY,
  user_id INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days'
);

CREATE TABLE IF NOT EXISTS t_p84730444_marketplace_unifier.market_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon_name VARCHAR(50),
  parent_id INT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p84730444_marketplace_unifier.market_products (
  id SERIAL PRIMARY KEY,
  seller_id INT NOT NULL,
  category_id INT,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL,
  old_price NUMERIC(12,2),
  product_type VARCHAR(20) NOT NULL DEFAULT 'product',
  city VARCHAR(100),
  moderation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  views INT NOT NULL DEFAULT 0,
  avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  reviews_count INT NOT NULL DEFAULT 0,
  images JSONB NOT NULL DEFAULT '[]',
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_sale BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p84730444_marketplace_unifier.market_cart (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS t_p84730444_marketplace_unifier.market_favorites (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS t_p84730444_marketplace_unifier.market_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  buyer_id INT NOT NULL,
  seller_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price NUMERIC(12,2) NOT NULL,
  commission_pct NUMERIC(5,2) NOT NULL DEFAULT 10,
  commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  order_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  delivery_method VARCHAR(50),
  delivery_address TEXT,
  tracking_number VARCHAR(100),
  promo_code VARCHAR(50),
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  buyer_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p84730444_marketplace_unifier.market_reviews (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  seller_id INT NOT NULL,
  product_id INT NOT NULL,
  score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p84730444_marketplace_unifier.market_messages (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  sender_id INT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p84730444_marketplace_unifier.market_promos (
  id SERIAL PRIMARY KEY,
  promo_code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(10) NOT NULL DEFAULT 'percent',
  discount_value NUMERIC(10,2) NOT NULL,
  usage_limit INT NOT NULL DEFAULT 100,
  used_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p84730444_marketplace_unifier.market_admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL,
  action_desc TEXT NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p84730444_marketplace_unifier.market_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mp_seller ON t_p84730444_marketplace_unifier.market_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_mp_cat ON t_p84730444_marketplace_unifier.market_products(category_id);
CREATE INDEX IF NOT EXISTS idx_mp_status ON t_p84730444_marketplace_unifier.market_products(moderation_status);
CREATE INDEX IF NOT EXISTS idx_mo_buyer ON t_p84730444_marketplace_unifier.market_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_mo_seller ON t_p84730444_marketplace_unifier.market_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_mo_status ON t_p84730444_marketplace_unifier.market_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_mc_user ON t_p84730444_marketplace_unifier.market_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_mm_order ON t_p84730444_marketplace_unifier.market_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_ms_user ON t_p84730444_marketplace_unifier.market_sessions(user_id);
