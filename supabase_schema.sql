-- Run this in the Supabase SQL Editor to create the restaurants table

create table restaurants (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  location text not null,
  tags text[] default '{}',
  rating smallint default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id)
);

-- Enable Row Level Security
alter table restaurants enable row level security;

-- Create policies

-- 1. Anyone can read the restaurants (for the roulette)
create policy "Anyone can select restaurants" 
on restaurants
for select
using (true);

-- 2. Only authenticated users can insert
create policy "Authenticated users can insert restaurants"
on restaurants
for insert
with check (auth.role() = 'authenticated');

-- 3. Only authenticated users can update
create policy "Authenticated users can update restaurants"
on restaurants
for update
using (auth.role() = 'authenticated');

-- 4. Only authenticated users can delete
create policy "Authenticated users can delete restaurants"
on restaurants
for delete
using (auth.role() = 'authenticated');

-- Turn on realtime for the restaurants table
alter publication supabase_realtime add table restaurants;
