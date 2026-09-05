# Ronin — Demonstração

Demo web da plataforma Ronin de acompanhamento financeiro (P&L) multi-cliente,
com dados 100% mockados de uma única empresa (Santo Galo Marmitas).

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. Não é necessário banco de dados, variável de
ambiente ou serviço externo.

Na tela de login, escolha um dos dois perfis:

- **Entrar como Ronin (Admin)** — vê a carteira de empresas clientes.
- **Entrar como Santo Galo Marmitas (Cliente)** — vê somente os próprios
  dados financeiros.
