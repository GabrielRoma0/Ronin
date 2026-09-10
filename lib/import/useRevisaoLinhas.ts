import { useState } from "react";
import type { LinhaImportada } from "./csv";
import type { Categoria } from "@/data/categorias";

/** Estado compartilhado pela tela de conferência do CSV e da nota fiscal. */
export function useRevisaoLinhas() {
  const [linhas, setLinhas] = useState<LinhaImportada[]>([]);

  function atualizarLinha(
    chave: string,
    campo: "data" | "descricao" | "categoria" | "valor",
    valor: string,
  ) {
    setLinhas((atual) =>
      atual.map((linha) => {
        if (linha.chave !== chave) return linha;
        switch (campo) {
          case "valor": {
            const numero = Number(valor.replace(",", "."));
            return { ...linha, valor: Number.isFinite(numero) ? numero : linha.valor };
          }
          case "categoria":
            return { ...linha, categoria: (valor as Categoria) || null };
          case "data":
            return { ...linha, data: valor };
          case "descricao":
            return { ...linha, descricao: valor };
        }
      }),
    );
  }

  function removerLinha(chave: string) {
    setLinhas((atual) => atual.filter((linha) => linha.chave !== chave));
  }

  const linhasProntas = linhas.filter((l) => !l.comErro && l.categoria && l.data);
  const linhasPendentes = linhas.length - linhasProntas.length;

  return { linhas, setLinhas, atualizarLinha, removerLinha, linhasProntas, linhasPendentes };
}
