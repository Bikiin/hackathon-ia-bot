# hackathon-ia-bot

Chatbot RAG sobre Next.js + Postgres con pgvector.

## Stack

- Next.js 14 (App Router)
- AI SDK 7 via Vercel AI Gateway
- Drizzle ORM + Postgres (Neon) con la extension `pgvector`

## Arranque

```bash
pnpm install
cp .env.example .env      # rellena DATABASE_URL
pnpm db:push              # crea las tablas resources y embeddings
pnpm dev
```

## Variables de entorno

| Variable | Donde | Nota |
|---|---|---|
| `DATABASE_URL` | local y Vercel | Postgres de Neon (connection string con pooling) |
| `AI_GATEWAY_API_KEY` | solo local | en Vercel el Gateway se autentica solo via OIDC |

## Scripts

| Comando | Que hace |
|---|---|
| `pnpm dev` | servidor de desarrollo |
| `pnpm db:push` | sincroniza el esquema con la base de datos |
| `pnpm db:studio` | explorador de la base de datos |
