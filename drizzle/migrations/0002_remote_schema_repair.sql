-- Run this in the Supabase SQL editor when auth/user_roles exists but the commerce tables are missing.
-- It is safe to run more than once.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (brand in ('iPhone','Samsung')),
  model text not null,
  storage text,
  color text,
  condition text not null check (condition in ('New','Used - Like New','Used - Good','Used - Fair')),
  price numeric(10,2) not null default 0,
  description text default '',
  battery_health int,
  stock_status text not null default 'Active' check (stock_status in ('Active','Reserved','Sold')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
alter table public.products enable row level security;
drop policy if exists "public read products" on public.products;
drop policy if exists "admin manage products" on public.products;
create policy "public read products" on public.products for select to anon, authenticated using (true);
create policy "admin manage products" on public.products for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on public.product_images(product_id);
grant select on public.product_images to anon, authenticated;
grant insert, update, delete on public.product_images to authenticated;
alter table public.product_images enable row level security;
drop policy if exists "public read product images" on public.product_images;
drop policy if exists "admin manage product images" on public.product_images;
create policy "public read product images" on public.product_images for select to anon, authenticated using (true);
create policy "admin manage product images" on public.product_images for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  shipping_address text not null,
  payment_method text not null check (payment_method in ('PayPal','CashApp','Zelle')),
  notes text default '',
  status text not null default 'Pending Payment' check (status in ('Pending Payment','Paid','Shipped','Completed','Cancelled')),
  created_at timestamptz not null default now()
);

grant select, update, delete on public.orders to authenticated;
alter table public.orders enable row level security;
drop policy if exists "admin manage orders" on public.orders;
create policy "admin manage orders" on public.orders for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages add column if not exists read_at timestamptz;

grant insert on public.contact_messages to anon, authenticated;
grant select, delete on public.contact_messages to authenticated;
alter table public.contact_messages enable row level security;
drop policy if exists "anyone can send message" on public.contact_messages;
drop policy if exists "admin read messages" on public.contact_messages;
drop policy if exists "admin delete messages" on public.contact_messages;
create policy "anyone can send message" on public.contact_messages for insert to anon, authenticated with check (true);
create policy "admin read messages" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin delete messages" on public.contact_messages for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  paypal_link text default 'https://paypal.me/waristaelectronics',
  cashapp_tag text default '$Warista',
  zelle_info text default 'alimandera@gmail.com',
  business_name text default 'Warista Electronics',
  business_address text default 'Fargo, North Dakota',
  business_email text default 'alimandera@gmail.com',
  business_phone text default '+1 (701) 318-2784',
  business_hours text default 'Mon-Sat, 9am - 7pm CT',
  whatsapp_catalog_url text default '',
  updated_at timestamptz not null default now()
);

alter table public.settings add column if not exists whatsapp_catalog_url text default '';

insert into public.settings (id) values (1) on conflict (id) do nothing;
grant select on public.settings to anon, authenticated;
grant update, insert on public.settings to authenticated;
alter table public.settings enable row level security;
drop policy if exists "public read settings" on public.settings;
drop policy if exists "admin update settings" on public.settings;
create policy "public read settings" on public.settings for select to anon, authenticated using (true);
create policy "admin update settings" on public.settings for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read product image objects" on storage.objects;
drop policy if exists "admin read product image objects" on storage.objects;
drop policy if exists "admin upload product image objects" on storage.objects;
drop policy if exists "admin update product image objects" on storage.objects;
drop policy if exists "admin delete product image objects" on storage.objects;
create policy "public read product image objects" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "admin upload product image objects" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "admin update product image objects" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "admin delete product image objects" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

-- Seed only when the repair is applied to an empty products table.
insert into public.products (id, brand, model, storage, color, condition, price, description, battery_health, stock_status, featured)
values
('11111111-1111-4111-8111-000000000001','iPhone','iPhone 15 Pro Max','256GB','Natural Titanium','New',1049.00,'Brand new, factory sealed iPhone 15 Pro Max. Unlocked for all carriers.',null,'Active',true),
('11111111-1111-4111-8111-000000000002','iPhone','iPhone 14 Pro','128GB','Deep Purple','Used - Like New',699.00,'Excellent condition iPhone 14 Pro. Fully unlocked.',92,'Active',true),
('11111111-1111-4111-8111-000000000006','Samsung','Galaxy S24 Ultra','512GB','Titanium Gray','New',1199.00,'Brand new, sealed Galaxy S24 Ultra. Factory unlocked.',null,'Active',true)
on conflict (id) do nothing;

insert into public.product_images (product_id, url, position)
values
('11111111-1111-4111-8111-000000000001','/images/seed/iphone-15-pro-max.jpg',0),
('11111111-1111-4111-8111-000000000002','/images/seed/iphone-14-pro.jpg',0),
('11111111-1111-4111-8111-000000000006','/images/seed/galaxy-s24-ultra.jpg',0)
on conflict do nothing;