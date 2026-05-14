INSERT INTO t_p84730444_marketplace_unifier.market_users (email, password_hash, display_name, permission_level, account_status)
VALUES ('admin@market.ru', 'PLACEHOLDER_HASH', 'Администратор', 'superadmin', 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO t_p84730444_marketplace_unifier.market_categories (name, slug, icon_name, sort_order) VALUES
  ('Электроника', 'electronics', 'Laptop', 1),
  ('Одежда', 'clothing', 'Shirt', 2),
  ('Авто', 'auto', 'Car', 3),
  ('Услуги', 'services', 'Briefcase', 4),
  ('Недвижимость', 'real-estate', 'Home', 5),
  ('Спорт', 'sport', 'Dumbbell', 6),
  ('Детское', 'kids', 'Baby', 7),
  ('Красота', 'beauty', 'Sparkles', 8)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO t_p84730444_marketplace_unifier.market_settings (setting_key, setting_value) VALUES
  ('site_name', 'Маркет'),
  ('commission_goods', '10'),
  ('commission_services', '8'),
  ('notification_email', 'admin@market.ru'),
  ('payout_details', '')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO t_p84730444_marketplace_unifier.market_promos (promo_code, discount_type, discount_value, usage_limit, used_count, expires_at) VALUES
  ('SUMMER25', 'percent', 25, 100, 47, '2026-08-31 23:59:59+00'),
  ('NEW500', 'amount', 500, 50, 50, '2026-06-01 23:59:59+00'),
  ('VIP15', 'percent', 15, 200, 123, '2026-12-31 23:59:59+00')
ON CONFLICT (promo_code) DO NOTHING;
