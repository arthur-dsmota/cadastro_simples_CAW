-- Execute uma vez no SQL Editor de um projeto novo.
create table public.contatos (
 id uuid primary key default gen_random_uuid(),
 usuario_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 nome text not null check (length(trim(nome)) between 1 and 120),
 email text not null check (length(email) between 3 and 254),
 telefone text not null check (length(telefone) between 8 and 25),
 criado_em timestamptz not null default now()
);
-- A autorização é aplicada no banco, não apenas na interface.
alter table public.contatos enable row level security;
revoke all on public.contatos from anon;
grant select, insert, update on public.contatos to authenticated;
create policy "Consultar próprios contatos" on public.contatos for select to authenticated using (usuario_id = (select auth.uid()));
create policy "Cadastrar próprios contatos" on public.contatos for insert to authenticated with check (usuario_id = (select auth.uid()));
create policy "Alterar próprios contatos" on public.contatos for update to authenticated using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));
create index contatos_usuario_idx on public.contatos(usuario_id);
