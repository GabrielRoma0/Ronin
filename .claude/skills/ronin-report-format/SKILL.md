---
name: ronin-report-format
description: Regras de formatação e regras de negócio dos relatórios financeiros da Ronin (grupos de receita/despesa, isolamento por cliente, tom do texto gerado por IA). Use sempre que mexer em relatórios, dashboards ou dados de clientes da plataforma.
---

## Estrutura obrigatória do relatório
- 5 abas: Resumo Consolidado, Resumo Itaú, Lançamentos Itaú, Resumo Santander,
  Lançamentos Santander.
- Indicadores do período: Total de Receitas, Total de Despesas, Resultado
  Operacional, Distribuição de Lucros, Resultado Final.
- Receitas por grupo: Vendas, Receitas Financeiras, Outras Receitas.
- Despesas por grupo: Compras de Mercadorias, Pessoal, Impostos e Taxas,
  Despesas Financeiras e Bancárias, Materiais e Suprimentos, Serviços
  Profissionais e Assinaturas, Manutenção e Reparos, Combustível e
  Transporte, Seguros, Telefonia e Internet, Aluguel, Alimentação,
  Marketing, Frete, Outras Despesas.
- "Outros Movimentos" (não entram no cálculo de receita/despesa):
  Distribuição de Lucros, Despesas do Sócio, Empréstimos Concedidos/
  Recebidos, Aquisição de Equipamentos, Transferência entre Contas,
  Estorno de Valores, Estorno de Vendas.
- Moeda sempre em Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).
- Negativos em vermelho, positivos em verde, sempre com o sinal (-R$) também,
  nunca só pela cor.

## Tom do texto de "análise de IA"
Direto, sem jargão financeiro, deixando explícito no rótulo que é uma
análise automática (não prometer capacidades que a demo não tem).
