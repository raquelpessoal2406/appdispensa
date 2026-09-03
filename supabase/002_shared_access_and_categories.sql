-- Migração 2: dados partilhados entre as duas contas + categorias no inventário
-- Corre isto uma vez em: Supabase Dashboard > SQL Editor > New query > Run
-- (depois de teres corrido o supabase/schema.sql original)

-- ---------- 1. Passa de "só o dono vê" para "qualquer conta autenticada vê e edita" ----------
-- Só existe uma "casa"/conta partilhada, por isso deixa de fazer sentido isolar por user_id.

do $$
declare
  t text;
begin
  foreach t in array array['zones', 'items', 'recipes', 'weekly_plan', 'shopping_manual_items', 'shopping_checked_ingredients']
  loop
    execute format('drop policy if exists "select own rows" on %I', t);
    execute format('drop policy if exists "insert own rows" on %I', t);
    execute format('drop policy if exists "update own rows" on %I', t);
    execute format('drop policy if exists "delete own rows" on %I', t);
    execute format('
      create policy "select shared" on %I for select to authenticated using (true);
      create policy "insert shared" on %I for insert to authenticated with check (true);
      create policy "update shared" on %I for update to authenticated using (true) with check (true);
      create policy "delete shared" on %I for delete to authenticated using (true);
    ', t, t, t, t);
  end loop;
end $$;

-- Já não faz sentido semear zonas novas por cada conta que inicia sessão pela primeira vez.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- ---------- 2. Limpa duplicados criados enquanto cada conta tinha os seus próprios dados ----------

-- Zonas: mantém só uma entrada por nome (a mais antiga)
delete from zones where id not in (
  select distinct on (name) id from zones order by name, created_at
);

-- Plano semanal: mantém só uma linha por dia (agora é um plano só, partilhado)
delete from weekly_plan where id not in (
  select distinct on (date) id from weekly_plan order by date, id
);
alter table weekly_plan drop constraint if exists weekly_plan_user_id_date_key;
alter table weekly_plan add constraint weekly_plan_date_key unique (date);

-- Ingredientes "comprados" da lista de compras: mantém só uma linha por ingrediente
delete from shopping_checked_ingredients where id not in (
  select distinct on (ingredient_name) id from shopping_checked_ingredients order by ingredient_name, id
);
alter table shopping_checked_ingredients drop constraint if exists shopping_checked_ingredients_user_id_ingredient_name_key;
alter table shopping_checked_ingredients add constraint shopping_checked_ingredients_ingredient_name_key unique (ingredient_name);

-- ---------- 3. Categorias no inventário (ex: dentro do Frigorífico: Fruta, Lanches, Carne, Molhos) ----------

alter table items add column if not exists category text;
