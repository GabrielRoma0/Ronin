---
name: tenant-isolation-check
description: Verifica isolamento de dados entre clientes antes de qualquer commit que toque em rotas, componentes ou APIs da Visão Cliente da plataforma Ronin. Use sempre antes de finalizar uma mudança em telas de cliente.
disable-model-invocation: true
---

Antes de considerar a tarefa concluída, confirme:
1. Toda consulta de dados na Visão Cliente filtra por empresaId da sessão
   — nunca por índice global nem "primeira empresa da lista".
2. Nenhum nome, CNPJ ou número de outra empresa aparece em nenhum estado,
   log ou resposta de API acessível pela Visão Cliente.
3. Simule login como uma segunda empresa mock e confirme que nada da
   primeira aparece.
Se qualquer item falhar, não finalize a tarefa — corrija primeiro.
