# VPC-App (Vem Pro Culto) - Contexto

## Objetivo
Frontend em Next.js para o sistema Vem Pro Culto. Gerencia o fluxo de usuários, visualização de cultos e atividades.

## Integrações
- **Autenticação**: `authentication-ms` (Porta padrão 8080).
  - Fluxo: Login gera `accessToken`. Registro envia dados extras via `otherFields`.
- **Negócio**: `vpc-api` (Porta padrão 8084).
  - Todas as requisições devem incluir `Authorization: Bearer <token>`.

## Tecnologias
- Next.js 16+ (App Router)
- Tailwind CSS
- Lucide React (Ícones)
- Shadcn UI (Componentes)
- React Hook Form + Zod

## Estrutura
- `lib/auth-context.tsx`: Gerenciamento de estado de autenticação e tokens.
- `lib/api.ts`: Cliente de API para consumo do `vpc-api`.
- `components/`: Componentes reutilizáveis de UI.
