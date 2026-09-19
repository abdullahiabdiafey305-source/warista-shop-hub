
-- ROLES
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users read own roles" on public.user_roles
for select to authenticated using (auth.uid() = user_id);

-- Claim admin: first signed-in user with no existing admin becomes admin
create or replace function public.claim_admin()
returns boolean language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then return false; end if;
  if exists (select 1 from public.user_roles where role = 'admin') then
    return exists (select 1 from public.user_roles where role = 'admin' and user_id = uid);
  end if;
  insert into public.user_roles(user_id, role) values (uid, 'admin') on conflict do nothing;
  return true;
end;
$$;
grant execute on function public.claim_admin() to authenticated;

-- PRODUCTS
create table public.products (
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
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public read products" on public.products for select to anon, authenticated using (true);
create policy "admin manage products" on public.products for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index on public.product_images(product_id);
grant select on public.product_images to anon;
grant select, insert, update, delete on public.product_images to authenticated;
grant all on public.product_images to service_role;
alter table public.product_images enable row level security;
create policy "public read product images" on public.product_images for select to anon, authenticated using (true);
create policy "admin manage product images" on public.product_images for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ORDERS
create table public.orders (
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
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "admin manage orders" on public.orders for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- CONTACT MESSAGES
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);
grant insert on public.contact_messages to anon;
grant select, insert, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
create policy "anyone can send message" on public.contact_messages for insert to anon, authenticated with check (true);
create policy "admin read messages" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete messages" on public.contact_messages for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- SETTINGS (single row)
create table public.settings (
  id int primary key default 1 check (id = 1),
  paypal_link text default 'https://paypal.me/waristaelectronics',
  cashapp_tag text default '$Warista',
  zelle_info text default 'alimandera@gmail.com',
  business_name text default 'Warista Electronics',
  business_address text default 'Fargo, North Dakota',
  business_email text default 'alimandera@gmail.com',
  business_phone text default '',
  business_hours text default 'Mon-Sat, 9am - 7pm CT',
  updated_at timestamptz not null default now()
);
grant select on public.settings to anon;
grant select, update, insert on public.settings to authenticated;
grant all on public.settings to service_role;
alter table public.settings enable row level security;
create policy "public read settings" on public.settings for select to anon, authenticated using (true);
create policy "admin update settings" on public.settings for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.settings(id) values (1);

-- SEED PRODUCTS
insert into public.products (id, brand, model, storage, color, condition, price, description, battery_health, stock_status, featured) values
('11111111-1111-4111-8111-000000000001','iPhone','iPhone 15 Pro Max','256GB','Natural Titanium','New',1049.00,'Brand new, factory sealed iPhone 15 Pro Max. Unlocked for all carriers. Includes USB-C cable and original Apple documentation. 1-year Apple warranty.',null,'Active',true),
('11111111-1111-4111-8111-000000000002','iPhone','iPhone 14 Pro','128GB','Deep Purple','Used - Like New',699.00,'Excellent condition iPhone 14 Pro with no scratches on screen or frame. Fully unlocked. Comes with a new charging cable and a free tempered glass screen protector.',92,'Active',true),
('11111111-1111-4111-8111-000000000003','iPhone','iPhone 13 Pro Max','256GB','Sierra Blue','Used - Good',579.00,'Great daily driver. Light micro-scratches on the back glass, screen is flawless. Unlocked. Includes charging cable.',88,'Active',true),
('11111111-1111-4111-8111-000000000004','iPhone','iPhone 12','64GB','Black','Used - Good',319.00,'Solid budget iPhone. Minor wear on the aluminum edges, screen in great shape. Unlocked and ready to activate. Charging cable included.',85,'Active',false),
('11111111-1111-4111-8111-000000000005','iPhone','iPhone SE (2022)','64GB','Midnight','New',279.00,'New in box iPhone SE 3rd generation with A15 Bionic chip and Touch ID. Unlocked, includes USB-C to Lightning cable.',null,'Active',false),
('11111111-1111-4111-8111-000000000006','Samsung','Galaxy S24 Ultra','512GB','Titanium Gray','New',1199.00,'Brand new, sealed Galaxy S24 Ultra with built-in S Pen and 200MP camera. Factory unlocked. Full Samsung warranty.',null,'Active',true),
('11111111-1111-4111-8111-000000000007','Samsung','Galaxy S23','256GB','Phantom Black','Used - Like New',549.00,'Near-mint Galaxy S23. No visible wear, original screen. Unlocked for all US carriers. Includes charging cable and case.',94,'Active',true),
('11111111-1111-4111-8111-000000000008','Samsung','Galaxy S22+','128GB','Green','Used - Good',399.00,'Well cared for Galaxy S22 Plus. Small scuff on the bottom corner, display is clean with no burn-in. Unlocked.',87,'Active',false),
('11111111-1111-4111-8111-000000000009','Samsung','Galaxy Z Flip 5','256GB','Lavender','Used - Fair',449.00,'Functional foldable with visible wear on the hinge area and light crease on the inner display (normal for foldables). Fully working, unlocked. Priced to move.',83,'Active',false),
('11111111-1111-4111-8111-000000000010','Samsung','Galaxy A54 5G','128GB','Awesome Violet','New',349.00,'New sealed Galaxy A54 5G. Great value with a 120Hz display and all-day battery. Factory unlocked.',null,'Active',false);

insert into public.product_images (product_id, url, position) values
('11111111-1111-4111-8111-000000000001','/images/seed/iphone-15-pro-max.jpg',0),
('11111111-1111-4111-8111-000000000002','/images/seed/iphone-14-pro.jpg',0),
('11111111-1111-4111-8111-000000000003','/images/seed/iphone-13-pro-max.jpg',0),
('11111111-1111-4111-8111-000000000004','/images/seed/iphone-12.jpg',0),
('11111111-1111-4111-8111-000000000005','/images/seed/iphone-se.jpg',0),
('11111111-1111-4111-8111-000000000006','/images/seed/galaxy-s24-ultra.jpg',0),
('11111111-1111-4111-8111-000000000007','/images/seed/galaxy-s23.jpg',0),
('11111111-1111-4111-8111-000000000008','/images/seed/galaxy-s22-plus.jpg',0),
('11111111-1111-4111-8111-000000000009','/images/seed/galaxy-z-flip-5.jpg',0),
('11111111-1111-4111-8111-000000000010','/images/seed/galaxy-a54.jpg',0);
