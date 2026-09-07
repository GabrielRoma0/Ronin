# Demonstração — Controle Financeiro Multi-Cliente

Demo web de uma plataforma de acompanhamento financeiro (P&L) multi-cliente,
com dados 100% mockados e genéricos de uma única empresa fictícia.

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. Não é necessário banco de dados, variável de
ambiente ou serviço externo.

Na tela de login, escolha um dos dois perfis:

- **Entrar como Admin (Empresa Administradora)** — vê a carteira de empresas
  clientes.
- **Entrar como Cliente (Empresa Demonstração)** — vê somente os próprios
  dados financeiros.
