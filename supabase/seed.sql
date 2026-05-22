insert into public.plans (slug, name, monthly_price_cents, property_limit, features)
values
  ('starter', 'Starter', 4900, 10, '["Up to 10 properties", "Basic reporting", "Tenant portal access"]'),
  ('professional', 'Professional', 14900, 50, '["Up to 50 properties", "Advanced analytics", "Automated workflows", "Owner portal"]'),
  ('enterprise', 'Enterprise', null, null, '["Unlimited properties", "Custom integrations", "Dedicated success manager"]')
on conflict (slug) do update set
  name = excluded.name,
  monthly_price_cents = excluded.monthly_price_cents,
  property_limit = excluded.property_limit,
  features = excluded.features;
