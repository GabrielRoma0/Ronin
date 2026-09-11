"use server";

import Anthropic from "@anthropic-ai/sdk";
import { TODAS_CATEGORIAS } from "@/lib/import/categorizacao";
import type { Categoria } from "@/data/categorias";

export interface LinhaExtraida {
  data?: string;
  descricao?: string;
  valor?: number;
  categoria?: Categoria;
}

export interface ExtracaoExtratoPdf {
  sucesso: boolean;
  erro?: string;
  linhas?: LinhaExtraida[];
}

const FERRAMENTA = {
  name: "registrar_extrato",
  description: "Registra cada movimentação (linha) encontrada no extrato bancário em PDF.",
  input_schema: {
    type: "object" as const,
    properties: {
      encontrou_extrato: {
        type: "boolean",
        description: "false se o arquivo não parece ser um extrato bancário legível.",
      },
      linhas: {
        type: "array",
        description:
          "Uma entrada por movimentação individual (não pelos subtotais 'Total de entradas'/'Total de saídas' nem pelo 'Saldo do dia' — só as linhas de transação de verdade).",
        items: {
          type: "object",
          properties: {
            data: { type: "string", description: "Data da movimentação, formato AAAA-MM-DD." },
            descricao: {
              type: "string",
              description: "Descrição/contraparte da movimentação, como aparece no extrato (resumida).",
            },
            valor: {
              type: "number",
              description: "Valor em reais, positivo se foi dinheiro entrando na conta, negativo se saindo.",
            },
            categoria_sugerida: {
              type: "string",
              enum: TODAS_CATEGORIAS as unknown as string[],
              description:
                "Só preencha se estiver razoavelmente confiante pelo nome do estabelecimento/contraparte (ex.: um atacadista de alimentos é Compras de Mercadorias). Repasses de pessoa física sem contexto claro, deixe sem essa categoria — melhor não sugerir do que sugerir errado.",
            },
          },
          required: ["data", "descricao", "valor"],
        },
      },
    },
    required: ["encontrou_extrato", "linhas"],
  },
};

/**
 * Segunda chamada de IA real do app (a primeira é a foto de nota) — extratos
 * de banco em PDF têm um layout totalmente diferente por instituição, então
 * regex específico por banco não escala. Manda o PDF inteiro pra Claude (a
 * API já processa PDF nativamente, sem lib de parsing própria) e força saída
 * estruturada via tool_choice. Cai na mesma tela de conferência humana antes
 * de gravar — a IA aqui só faz um primeiro palpite, principalmente pra
 * categoria, que fica sem sugestão sempre que a contraparte for ambígua
 * (repasse pra pessoa física, por exemplo) em vez de arriscar um chute.
 */
export async function extrairLinhasDeExtratoPdf(pdfBase64: string): Promise<ExtracaoExtratoPdf> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { sucesso: false, erro: "Leitura automática por IA não configurada (falta ANTHROPIC_API_KEY)." };
  }

  try {
    const client = new Anthropic();
    const resposta = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 8192,
      tools: [FERRAMENTA],
      tool_choice: { type: "tool", name: "registrar_extrato" },
      messages: [
        {
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } },
            {
              type: "text",
              text: "Esse é um extrato bancário de uma empresa. Extraia cada movimentação individual (não os subtotais) chamando registrar_extrato. Se o arquivo não for um extrato legível, chame com encontrou_extrato=false e linhas=[].",
            },
          ],
        },
      ],
    });

    const usoFerramenta = resposta.content.find((bloco) => bloco.type === "tool_use");
    if (!usoFerramenta || usoFerramenta.type !== "tool_use") {
      return { sucesso: false, erro: "A IA não retornou uma resposta estruturada — tente de novo." };
    }

    const dados = usoFerramenta.input as {
      encontrou_extrato: boolean;
      linhas: { data?: string; descricao?: string; valor?: number; categoria_sugerida?: string }[];
    };

    if (!dados.encontrou_extrato || dados.linhas.length === 0) {
      return { sucesso: false, erro: "Não foi possível identificar movimentações nesse PDF." };
    }

    return {
      sucesso: true,
      linhas: dados.linhas.map((l) => ({
        data: l.data,
        descricao: l.descricao,
        valor: l.valor,
        categoria: l.categoria_sugerida as Categoria | undefined,
      })),
    };
  } catch (erro) {
    return {
      sucesso: false,
      erro: erro instanceof Error ? erro.message : "Falha ao consultar a IA de leitura de extrato.",
    };
  }
}
