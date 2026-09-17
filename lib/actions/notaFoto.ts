"use server";

import Anthropic from "@anthropic-ai/sdk";
import { CATEGORIAS_DESPESA, type CategoriaDespesa } from "@/data/categorias";

export interface ExtracaoNotaFoto {
  sucesso: boolean;
  erro?: string;
  data?: string;
  descricao?: string;
  valor?: number;
  categoria?: CategoriaDespesa;
}

export type MediaTypeImagem = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

const FERRAMENTA = {
  name: "registrar_nota",
  description: "Registra os dados extraídos da foto de uma nota/cupom fiscal de despesa.",
  input_schema: {
    type: "object" as const,
    properties: {
      encontrou_nota: {
        type: "boolean",
        description: "false se a imagem não parece ser uma nota/cupom fiscal legível.",
      },
      data: {
        type: "string",
        description: "Data da compra no formato AAAA-MM-DD, lida da própria nota.",
      },
      descricao: {
        type: "string",
        description: "Resumo curto (fornecedor e/ou item principal) do que foi comprado.",
      },
      valor_total: {
        type: "number",
        description: "Valor total pago, em reais, sempre positivo.",
      },
      categoria: {
        type: "string",
        enum: CATEGORIAS_DESPESA as unknown as string[],
        description: "Categoria de despesa que melhor descreve a compra.",
      },
    },
    required: ["encontrou_nota"],
  },
};

/**
 * Único ponto do app que chama uma IA de verdade (as outras seções com
 * "IA" no nome são texto gerado por template — ver AIReportCard). Roda só
 * no servidor: a chave da Anthropic nunca é exposta ao navegador. A saída
 * cai sempre na mesma tela de conferência humana das outras importações —
 * isto aqui só faz um primeiro palpite, nunca grava nada sozinho.
 */
export async function extrairNotaDeFoto(
  imagemBase64: string,
  mediaType: MediaTypeImagem,
): Promise<ExtracaoNotaFoto> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { sucesso: false, erro: "Leitura automática por IA não configurada (falta ANTHROPIC_API_KEY)." };
  }

  try {
    // Sem isso, o SDK usa o timeout padrão de 10 minutos — tempo demais pra
    // um formulário síncrono onde a única indicação de progresso é um texto
    // "Lendo nota(s) com IA…" ao lado do input de arquivo.
    const client = new Anthropic({ timeout: 30_000 });
    const resposta = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      tools: [FERRAMENTA],
      tool_choice: { type: "tool", name: "registrar_nota" },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imagemBase64 } },
            {
              type: "text",
              text: "Essa é a foto de uma nota ou cupom fiscal de uma despesa de um restaurante. Extraia os dados chamando registrar_nota. Se a imagem não for uma nota/cupom legível, chame com encontrou_nota=false.",
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
      encontrou_nota: boolean;
      data?: string;
      descricao?: string;
      valor_total?: number;
      categoria?: string;
    };

    if (!dados.encontrou_nota) {
      return { sucesso: false, erro: "Não foi possível identificar uma nota/cupom fiscal nessa foto." };
    }

    return {
      sucesso: true,
      data: dados.data,
      descricao: dados.descricao,
      valor: dados.valor_total,
      categoria: dados.categoria as CategoriaDespesa | undefined,
    };
  } catch (erro) {
    return {
      sucesso: false,
      erro: erro instanceof Error ? erro.message : "Falha ao consultar a IA de leitura de notas.",
    };
  }
}
