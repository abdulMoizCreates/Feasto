create table if not exists public.customer_cart_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  menu_item_id bigint not null check (menu_item_id > 0),
  name text not null,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, menu_item_id)
);

create table if not exists public.customer_wishlist_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  menu_item_id bigint not null check (menu_item_id > 0),
  created_at timestamptz not null default now(),
  primary key (user_id, menu_item_id)
);

create table if not exists public.customer_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  delivery_address text not null check (length(trim(delivery_address)) > 0),
  payment_method text not null check (payment_method in ('card', 'cash')),
  items jsonb not null check (
    case
      when jsonb_typeof(items) = 'array' then jsonb_array_length(items) > 0
      else false
    end
  ),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  delivery_fee numeric(10, 2) not null default 4.99 check (delivery_fee >= 0),
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'placed',
  created_at timestamptz not null default now()
);

create index if not exists customer_orders_user_created_idx
  on public.customer_orders (user_id, created_at desc);

alter table public.customer_cart_items enable row level security;
alter table public.customer_wishlist_items enable row level security;
alter table public.customer_orders enable row level security;

grant select, insert, update, delete on public.customer_cart_items to authenticated;
grant select, insert, update, delete on public.customer_wishlist_items to authenticated;
grant select, insert on public.customer_orders to authenticated;

create policy "Customers manage their own cart"
  on public.customer_cart_items for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Customers manage their own wishlist"
  on public.customer_wishlist_items for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Customers read their own orders"
  on public.customer_orders for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Customers create their own orders"
  on public.customer_orders for insert to authenticated
  with check ((select auth.uid()) = user_id);

create or replace function public.place_customer_order(
  p_delivery_address text,
  p_payment_method text
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_items jsonb;
  v_subtotal numeric(10, 2);
  v_order_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to place an order.';
  end if;

  if length(trim(coalesce(p_delivery_address, ''))) = 0 then
    raise exception 'A delivery address is required.';
  end if;

  if coalesce(p_payment_method, '') not in ('card', 'cash') then
    raise exception 'Choose a supported payment method.';
  end if;

  select
    jsonb_agg(
      jsonb_build_object(
        'id', menu_item_id,
        'name', name,
        'price', unit_price,
        'quantity', quantity
      ) order by menu_item_id
    ),
    coalesce(sum(unit_price * quantity), 0)
  into v_items, v_subtotal
  from public.customer_cart_items
  where user_id = v_user_id;

  if v_items is null or jsonb_array_length(v_items) = 0 then
    raise exception 'Your cart is empty.';
  end if;

  insert into public.customer_orders (
    user_id,
    delivery_address,
    payment_method,
    items,
    subtotal,
    delivery_fee,
    total
  )
  values (
    v_user_id,
    trim(p_delivery_address),
    p_payment_method,
    v_items,
    v_subtotal,
    4.99,
    v_subtotal + 4.99
  )
  returning id into v_order_id;

  delete from public.customer_cart_items
  where user_id = v_user_id;

  return v_order_id;
end;
$$;

revoke all on function public.place_customer_order(text, text) from public;
grant execute on function public.place_customer_order(text, text) to authenticated;
