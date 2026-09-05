# CLAUDE.md — Ronin (demo)

## O que é este projeto
Demo de uma plataforma multi-cliente de acompanhamento financeiro (P&L) para
a empresa Ronin. Objetivo: mostrar internamente e para a diretoria como a
plataforma substituiria o processo manual em Excel + WhatsApp. Esta é uma
DEMO — não conecta a bancos, IA ou WhatsApp reais.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind (apenas classes utilitárias core, sem plugin de compilação)
- Dados 100% mockados em `/data/seed.ts` (sem banco de dados nesta fase)
- Gráficos: Recharts

## Estrutura de dados (mock)
- `Empresa`: id, nome, cnpj, contas[]
- `Conta`: banco ("Itaú" | "Santander"), titular, cnpj
- `Periodo`: mes/ano, receitas[], despesas[], outrosMovimentos[], saldoFinal
- `Lancamento`: data, descricao, categoria, valor, conta

Todos os dados de demonstração vivem em `/data/seed.ts` e são baseados no
relatório real de fechamento de Agosto/2026 da Santo Galo Marmitas.

## Regra inegociável: isolamento por tenant
- Toda página/rota da Visão Cliente deve filtrar por `empresaId` da sessão
  mockada — nunca por índice global ou "primeira empresa da lista".
- Nunca renderizar, em nenhuma tela da Visão Cliente, nome, CNPJ ou número de
  outra empresa. Isso é o problema #1 que esta plataforma resolve em relação
  ao Excel atual — trate como bug crítico, não como detalhe.
- Ao adicionar uma segunda empresa mock no futuro, o primeiro teste manual
  antes de qualquer PR é: logar como cliente A e confirmar que nenhuma rota,
  nenhum estado global e nenhuma chamada de API expõe dados da empresa B.

## Convenções de código
- Componentes em português para nomes de domínio (ex.: `ResumoConsolidado`,
  `LancamentosItau`), nomes técnicos genéricos em inglês (`Table`, `Card`).
- Moeda sempre formatada com `Intl.NumberFormat('pt-BR', { style: 'currency',
  currency: 'BRL' })`.
- Valores negativos em vermelho (`text-red-600`), positivos em verde
  (`text-emerald-600`), nunca só pela cor — sempre com sinal (-R$) também.
- Nenhuma chamada de rede real (fetch externo) nesta fase — tudo client-side
  a partir do seed.

## Como rodar
`npm install && npm run dev` — não requer variáveis de ambiente nem serviços
externos.

## Fora de escopo nesta demo (não implementar sem pedir confirmação)
- Autenticação real / hashing de senha
- Integração com Open Finance, banco de dados externo ou API de IA real
- Envio real de mensagens via WhatsApp Business API
- Qualquer dado de empresa que não seja a Santo Galo Marmitas
