# Pipeline de Lançamento de Produtos — allu

Aplicação de gestão do processo stage-gate de lançamento de novos produtos da allu. Cada produto candidato percorre 6 fases separadas por 6 gates de decisão (Go / Kill / Recycle / Hold).

## Stack

- **Next.js 14** (App Router + TypeScript)
- **Tailwind CSS** — design Linear dark
- **Supabase** — banco PostgreSQL + auth magic link
- **Prisma** — ORM e migrations
- **Vercel** — deploy

## Setup local

### 1. Clone e instale

```bash
git clone https://github.com/arthurfreitas-stack/pipeline-lancamento-produtos.git
cd pipeline-lancamento-produtos
npm install
```

### 2. Configure variáveis de ambiente

```bash
cp .env.example .env
```

Preencha `.env` com as credenciais do seu projeto Supabase:
- Acesse [supabase.com](https://supabase.com) → crie um projeto
- **Project Settings > API** → copie `Project URL` e `anon public key`
- **Project Settings > Database** → copie a connection string (Transaction mode e Session mode)

### 3. Rode as migrations

```bash
npx prisma migrate dev --name init
```

### 4. Inicie o servidor

```bash
npm run dev
```

Acesse: http://localhost:3000

## Deploy no Vercel

1. Conecte o repositório no [vercel.com](https://vercel.com)
2. Adicione as variáveis de ambiente (mesmo conteúdo do `.env`)
3. Configure em Vercel: **Settings > Build & Output Settings > Build Command**:
   ```
   npx prisma migrate deploy && next build
   ```

## Processo Stage-Gate

| Fase | Código | Descrição | Gate |
|---|---|---|---|
| 0 | F0 | Descoberta & Sizing | Vale investigar a fundo? |
| 1 | F1 | Fit de Assinatura | Faz sentido assinar? |
| 2 | F2 | Modelagem do Produto | A unit economics fecha? |
| 3 | F3 | Operacionalização & Cadastro | Está pronto para vender? |
| 4 | F4 | Go-to-Market | Os primeiros sinais sustentam escalar? |
| 5 | F5 | Validação & Decisão | Validar ou Invalidar? |
| 6 | F6 | Rampagem & Gestão de Share | Fase contínua |

**Decisões de gate:** ✅ Go · ❌ Kill · 🔁 Recycle · ⏸ Hold
