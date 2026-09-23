# spec.md — PRD do MVP
## Sistema Interno de Requisição e Controle de Insumos de TI

**Versão:** 1.0 (MVP) · **Stack:** HTML + CSS + JS + Supabase · **Hospedagem:** GitHub Pages

---

## 1. Visão

A empresa perde dinheiro por falta de rastreabilidade de insumos internos (resmas de papel,
toners, mouses, teclados). O MVP entrega um sistema web interno em que **toda retirada de
material fica registrada** (quem, o quê, quando, quanto), com baixa automática de estoque.

**Princípio do MVP:** qualquer usuário autenticado pode requisitar; o sistema cria
responsabilização via registro. Nada além disso.

## 2. Fora de escopo (fase 2)

- Aprovação de requisições por gestor
- Alertas automáticos (e-mail) de estoque mínimo
- Relatórios/dashboards analíticos
- Integração com compras/fornecedores
- App mobile

## 3. Personas

| Persona | Descrição |
|---|---|
| Funcionário | Solicita e retira material; consulta saldo e seu próprio histórico |
| Gestor de TI | Cadastra itens, repõe/ajusta estoque, audita movimentações de todos |

## 4. Regras de negócio

- **RN1:** Toda retirada exige usuário autenticado.
- **RN2:** Requisição acima do saldo é bloqueada (erro claro, sem baixa parcial).
- **RN3:** Saldo nunca fica negativo (constraint no banco + `FOR UPDATE` na RPC).
- **RN4:** Movimentações são imutáveis — sem UPDATE/DELETE (append-only, via trigger).
- **RN5:** Toda mudança de estoque gera uma linha em `movimentacoes` (na mesma transação).
- **RN6:** Baixa de estoque só ocorre via função Postgres (`retirar_item`), nunca via UPDATE direto.
- **RN7:** Papel (`funcionario`/`gestor`) é definido no cadastro do usuário pelo gestor.

## 5. User stories e critérios de aceite

### US-01 — Login
> Como funcionário, quero entrar com e-mail e senha para que minhas requisições fiquem vinculadas a mim.

```gherkin
Cenário: Login com sucesso
  Dado que sou um usuário cadastrado
  Quando informo e-mail e senha válidos
  Então sou redirecionado para a lista de itens

Cenário: Login inválido
  Dado que estou na tela de login
  Quando informo credenciais inválidas
  Então vejo mensagem de erro e permaneço na tela de login
```

### US-02 — Consultar itens e saldo
> Como funcionário, quero ver os itens disponíveis e seus saldos para decidir o que requisitar.

```gherkin
Cenário: Listagem de itens ativos
  Dado que estou autenticado
  Quando acesso a tela inicial
  Então vejo todos os itens ativos com nome, categoria e saldo
  E itens abaixo do estoque mínimo exibem um aviso visual "baixo"
```

### US-03 — Requisitar material
> Como funcionário, quero requisitar uma quantidade de um item para retirá-lo.

```gherkin
Cenário: Retirada com sucesso
  Dado que estou autenticado
  E o item "Resma A4" tem saldo 10
  Quando requisito 2 unidades
  Então o saldo passa a 8
  E uma movimentação do tipo "retirada" é registrada com meu usuário e a data/hora

Cenário: Quantidade inválida
  Dado que estou na tela de requisição
  Quando informo quantidade menor ou igual a zero
  Então o sistema rejeita e exibe "Quantidade deve ser maior que zero"
```

### US-04 — Bloqueio por saldo insuficiente
> Como sistema, não devo permitir saldo negativo.

```gherkin
Cenário: Saldo insuficiente
  Dado que o item "Toner HP 107A" tem saldo 1
  Quando requisito 3 unidades
  Então a operação é rejeitada com "Saldo insuficiente. Disponível: 1"
  E o saldo permanece 1
  E nenhuma movimentação é registrada
```

### US-05 — Meu histórico
> Como funcionário, quero ver minhas requisições para conferir o que retirei.

```gherkin
Cenário: Histórico pessoal
  Dado que estou autenticado
  Quando acesso "Minhas requisições"
  Então vejo apenas as movimentações do tipo "retirada" do meu usuário, em ordem decrescente de data
```

### US-06 — Cadastrar item (gestor)
> Como gestor de TI, quero cadastrar itens com estoque inicial.

```gherkin
Cenário: Cadastro com estoque inicial
  Dado que estou autenticado como gestor
  Quando cadastro o item "Mouse USB" com saldo inicial 5
  Então o item aparece na listagem com saldo 5
  E uma movimentação do tipo "reposicao" de 5 unidades é registrada
```

### US-07 — Repor estoque (gestor)
> Como gestor de TI, quero registrar reposições para manter o saldo real.

```gherkin
Cenário: Reposição
  Dado que o item "Teclado" tem saldo 2
  Quando repuser 10 unidades
  Então o saldo passa a 12
  E uma movimentação do tipo "reposicao" é registrada
```

### US-08 — Ajuste de inventário (gestor)
> Como gestor de TI, quero corrigir o saldo após conferência física.

```gherkin
Cenário: Ajuste após contagem física
  Dado que o item "Resma A4" tem saldo 8 no sistema
  Quando ajusto o saldo para 6
  Então uma movimentação do tipo "ajuste" de 2 unidades é registrada
  E o saldo passa a 6
```

### US-09 — Extrato por item (gestor)
> Como gestor de TI, quero ver todas as movimentações de um item para auditar divergências.

```gherkin
Cenário: Extrato completo
  Dado que estou autenticado como gestor
  Quando acesso o extrato de um item
  Então vejo todas as movimentações (retirada, reposicao, ajuste) com usuário, data e quantidade
```

### US-10 — Imutabilidade do log
> Como sistema, movimentações nunca podem ser alteradas ou apagadas.

```gherkin
Cenário: Tentativa de exclusão
  Dado que existem movimentações registradas
  Quando qualquer usuário (inclusive gestor) tenta atualizar ou excluir uma movimentação
  Então o banco rejeita com "Movimentações são imutáveis (append-only)"
```

## 6. Métricas de sucesso (30 dias de piloto)

- ≥ 90% das retiradas registradas no sistema
- Zero solicitações em duplicidade sem histórico
- Nenhum saldo negativo registrado

## 7. Decisões registradas

| Decisão | Justificativa |
|---|---|
| Lógica de baixa no Postgres (RPC), não no JS | Client é público no GitHub Pages; anon key exposta — RLS + security definer é a defesa real |
| Movimentações append-only via trigger | RN4 sem depender de disciplina de código |
| Sem tela de cadastro público | Gestor cria usuários no painel do Supabase (MVP interno) |
| Aviso visual de estoque mínimo, sem bloqueio | Alertas automáticos ficam para fase 2 |
| Saldo = solicitado, não físico | Conferência física ocasional pelo gestor via US-08 |
