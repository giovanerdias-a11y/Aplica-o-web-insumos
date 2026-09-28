# tasks.md — Backlog do MVP

Legenda: 🔴 crítico · 🟡 importante · 🟢 nice to have

## Fase 0 — Fundação (Semana 1)

- [ ] 🔴 Criar projeto Supabase e rodar `migrations.sql` no SQL Editor
- [ ] 🔴 Criar usuário gestor no Authentication e promover via `update public.perfis ...`
- [ ] 🔴 Testar RPCs pelo SQL Editor: `retirar_item` (saldo ok / insuficiente / qtd inválida)
- [ ] 🔴 Testar trigger de imutabilidade (tentar `delete from movimentacoes` — deve falhar)
- [ ] 🔴 Criar repo GitHub + estrutura de pastas do `plan.md`
- [ ] 🟡 GitHub Actions: workflow de deploy no Pages ativo

## Fase 1 — Fluxo do funcionário (Semana 2)

- [ ] 🔴 `supabaseClient.js` com URL + anon key (via `js/config.js` não versionado ou variável de ambiente do Actions)
- [ ] 🔴 Tela de login (US-01), sessão persistida, redirect se não autenticado
- [ ] 🔴 Lista de itens com saldo + badge "baixo" quando `saldo <= estoque_minimo` (US-02)
- [ ] 🔴 Formulário de requisição → `rpc retirar_item` com tratamento de erro (US-03, US-04)
- [ ] 🟡 Tela "Minhas requisições" (US-05)
- [ ] 🟢 Feedback visual de sucesso com saldo restante

## Fase 2 — Fluxo do gestor (Semana 3)

- [ ] 🔴 Guarda de rota/tela por `is_gestor()` (ocultar painel, mas RPCs já validam no servidor)
- [ ] 🔴 Cadastro de item → `rpc criar_item` (US-06)
- [ ] 🔴 Reposição → `rpc repor_item` (US-07)
- [ ] 🔴 Ajuste de inventário → `rpc ajustar_item` (US-08)
- [ ] 🟡 Extrato por item com usuário e data (US-09)
- [ ] 🟢 Marcar item como inativo (edição de cadastro — exige nova RPC `atualizar_item`)

## Fase 3 — Piloto (Semana 4)

- [ ] 🔴 Checklist de segurança do `plan.md` (seção 5) 100% verde
- [ ] 🔴 Teste com 2 usuários reais (funcionário × gestor) cobrindo US-01 a US-10
- [ ] 🔴 Deploy no GitHub Pages + Site URL configurada no Supabase
- [ ] 🟡 Treinar o gestor em 30 min (cadastrar item, repor, ajustar, extrato)
- [ ] 🟡 Instrumentar métricas do `spec.md` (mesmo que planilha manual)
- [ ] 🟢 Revisão pós-piloto: decidir o que entra na fase 2

## Débito conhecido (não esquecer)

- Edição de dados cadastrais do item exige RPC `atualizar_item` (UPDATE direto está bloqueado pela RLS)
- Troca de papel (funcionario ↔ gestor) hoje é SQL manual — tela fica para fase 2
- Sem recuperação de senha autônoma: gestor recria usuário no painel do Supabase
