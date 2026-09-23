-- ============================================================
-- migrations.sql — MVP Requisição de Insumos (Supabase / Postgres)
-- Rodar no SQL Editor do Supabase, na ordem.
-- ============================================================

-- ---------- 1. Tabelas ----------

create table public.itens (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null,
  categoria      text not null check (categoria in ('papelaria','impressao','informatica','outros')),
  unidade        text not null default 'un',
  saldo_atual    integer not null default 0 check (saldo_atual >= 0),          -- RN3
  estoque_minimo integer not null default 0,
  ativo          boolean not null default true,
  created_at     timestamptz not null default now()
);

create table public.movimentacoes (
  id         uuid primary key default gen_random_uuid(),
  item_id    uuid not null references public.itens(id),
  usuario_id uuid not null references auth.users(id) default auth.uid(),
  tipo       text not null check (tipo in ('retirada','reposicao','ajuste')),  -- RN5
  quantidade integer not null check (quantidade > 0),
  created_at timestamptz not null default now()
);

create table public.perfis (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  papel      text not null default 'funcionario' check (papel in ('funcionario','gestor')),  -- RN7
  created_at timestamptz not null default now()
);

-- ---------- 2. Perfil automático no cadastro do usuário ----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (user_id, papel)
  values (new.id, coalesce(new.raw_user_meta_data->>'papel', 'funcionario'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 3. Helper de papel ----------

create or replace function public.is_gestor()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.perfis
    where user_id = auth.uid() and papel = 'gestor'
  );
$$;

-- ---------- 4. RPCs (security definer) — único caminho de escrita ----------

-- RN1 + RN2 + RN3 + RN6: retirada com trava de linha e baixa atômica
create or replace function public.retirar_item(p_item uuid, p_qtd integer)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_saldo integer;
begin
  if auth.uid() is null then
    raise exception 'Autenticação necessária.';              -- RN1
  end if;
  if p_qtd <= 0 then
    raise exception 'Quantidade deve ser maior que zero.';
  end if;

  select saldo_atual into v_saldo
  from public.itens
  where id = p_item and ativo
  for update;                                               -- evita corrida

  if not found then
    raise exception 'Item não encontrado ou inativo.';
  end if;
  if v_saldo < p_qtd then
    raise exception 'Saldo insuficiente. Disponível: %', v_saldo;   -- RN2
  end if;

  update public.itens set saldo_atual = saldo_atual - p_qtd where id = p_item;

  insert into public.movimentacoes (item_id, usuario_id, tipo, quantidade)
  values (p_item, auth.uid(), 'retirada', p_qtd);           -- RN5 (mesma transação)

  return json_build_object('ok', true, 'saldo_restante', v_saldo - p_qtd);
end;
$$;

-- Reposição (só gestor)
create or replace function public.repor_item(p_item uuid, p_qtd integer)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_saldo integer;
begin
  if not public.is_gestor() then
    raise exception 'Apenas gestores podem repor estoque.';
  end if;
  if p_qtd <= 0 then
    raise exception 'Quantidade deve ser maior que zero.';
  end if;

  update public.itens set saldo_atual = saldo_atual + p_qtd
  where id = p_item and ativo
  returning saldo_atual into v_saldo;

  if not found then
    raise exception 'Item não encontrado ou inativo.';
  end if;

  insert into public.movimentacoes (item_id, usuario_id, tipo, quantidade)
  values (p_item, auth.uid(), 'reposicao', p_qtd);

  return json_build_object('ok', true, 'saldo_restante', v_saldo);
end;
$$;

-- Ajuste de inventário (só gestor) — US-08
create or replace function public.ajustar_item(p_item uuid, p_novo_saldo integer)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_atual integer;
  v_delta integer;
begin
  if not public.is_gestor() then
    raise exception 'Apenas gestores podem ajustar estoque.';
  end if;
  if p_novo_saldo < 0 then
    raise exception 'Saldo não pode ser negativo.';         -- RN3
  end if;

  select saldo_atual into v_atual
  from public.itens
  where id = p_item and ativo
  for update;

  if not found then
    raise exception 'Item não encontrado ou inativo.';
  end if;

  v_delta := abs(p_novo_saldo - v_atual);
  if v_delta = 0 then
    return json_build_object('ok', true, 'saldo_restante', v_atual, 'alterado', false);
  end if;

  update public.itens set saldo_atual = p_novo_saldo where id = p_item;

  insert into public.movimentacoes (item_id, usuario_id, tipo, quantidade)
  values (p_item, auth.uid(), 'ajuste', v_delta);

  return json_build_object('ok', true, 'saldo_restante', p_novo_saldo, 'alterado', true);
end;
$$;

-- Cadastro de item (só gestor) — US-06
create or replace function public.criar_item(
  p_nome text, p_categoria text, p_unidade text default 'un',
  p_saldo_inicial integer default 0, p_estoque_minimo integer default 0
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  if not public.is_gestor() then
    raise exception 'Apenas gestores podem cadastrar itens.';
  end if;
  if p_saldo_inicial < 0 then
    raise exception 'Saldo inicial não pode ser negativo.';
  end if;

  insert into public.itens (nome, categoria, unidade, saldo_atual, estoque_minimo)
  values (p_nome, p_categoria, coalesce(p_unidade, 'un'), p_saldo_inicial, p_estoque_minimo)
  returning id into v_id;

  if p_saldo_inicial > 0 then
    insert into public.movimentacoes (item_id, usuario_id, tipo, quantidade)
    values (v_id, auth.uid(), 'reposicao', p_saldo_inicial);
  end if;

  return v_id;
end;
$$;

-- ---------- 5. RN4: movimentações imutáveis ----------

create or replace function public.bloqueia_alteracao_mov()
returns trigger
language plpgsql as $$
begin
  raise exception 'Movimentações são imutáveis (append-only).';
end;
$$;

create trigger trg_mov_imutavel
  before update or delete on public.movimentacoes
  for each statement execute function public.bloqueia_alteracao_mov();

-- ---------- 6. RLS ----------

alter table public.itens enable row level security;
alter table public.movimentacoes enable row level security;
alter table public.perfis enable row level security;

-- perfis: cada um lê o próprio; gestor lê todos
create policy perfis_select on public.perfis
  for select to authenticated
  using (user_id = auth.uid() or public.is_gestor());

-- itens: autenticados leem; escrita SÓ via RPC (nenhuma policy de insert/update/delete)
create policy itens_select on public.itens
  for select to authenticated
  using (true);

-- movimentacoes: usuário vê as próprias; gestor vê todas; escrita SÓ via RPC
create policy mov_select on public.movimentacoes
  for select to authenticated
  using (usuario_id = auth.uid() or public.is_gestor());

-- ---------- 7. Conferência rápida pós-instalação ----------

-- 1) Criar o primeiro gestor: no Authentication > Users, crie o usuário e depois rode:
--    update public.perfis set papel = 'gestor' where user_id = '<uid-do-usuario>';
-- 2) Teste: select public.retirar_item('<id-item>', 1);  -- deve falhar sem auth no client,
--    mas via SQL Editor (service role) funciona — valide pelo app com 2 usuários reais.
