-- Supabase → SQL Editor ga to'liq qo'yib, bir marta "Run" bosing.

-- 1) Sozlamalar/baza (yetkazuvchilar, reja, moliya va h.k.) har foydalanuvchiga alohida
create table if not exists public.app_state (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  key        text not null,
  value      text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.app_state enable row level security;
drop policy if exists "app_state: faqat o'zining qatorlari" on public.app_state;
create policy "app_state: faqat o'zining qatorlari" on public.app_state
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 2) Excel fayllar uchun yopiq (private) bucket
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', false)
on conflict (id) do nothing;

drop policy if exists "uploads: o'qish" on storage.objects;
drop policy if exists "uploads: yozish" on storage.objects;
drop policy if exists "uploads: yangilash" on storage.objects;
drop policy if exists "uploads: o'chirish" on storage.objects;
create policy "uploads: o'qish" on storage.objects for select to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "uploads: yozish" on storage.objects for insert to authenticated
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "uploads: yangilash" on storage.objects for update to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "uploads: o'chirish" on storage.objects for delete to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);
