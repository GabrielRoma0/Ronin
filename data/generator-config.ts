import type { Banco, Categoria } from "./categorias";

/**
 * Alocação por conta de cada categoria do fechamento de Agosto/2026.
 *
 * `totalCents` já vem com o sinal correto (negativo para despesas e saídas
 * em "Outros Movimentos"). Os dois `totalCents` de uma categoria somam
 * exatamente o valor consolidado informado pela Ronin — a distribuição
 * entre Itaú e Santander é uma alocação plausível (a própria bagunça de
 * dois bancos é o problema que a Ronin resolve), não um dado real informado.
 *
 * `count` é quantos lançamentos individuais essa fatia vira na aba de
 * Lançamentos daquela conta.
 */
export interface AlocacaoConta {
  conta: Banco;
  totalCents: number;
  count: number;
  descricoes: string[];
}

export interface AlocacaoCategoria {
  categoria: Categoria;
  contas: AlocacaoConta[];
}

export const ALOCACOES: AlocacaoCategoria[] = [
  // ---- Receitas ----
  {
    categoria: "Vendas",
    contas: [
      {
        conta: "Itaú",
        totalCents: 5_196_396,
        count: 4,
        descricoes: [
          "Venda balcão - Pix",
          "Venda WhatsApp - Pix cliente recorrente",
          "Venda marmitas - cartão de débito",
          "Venda encomenda - Pix",
        ],
      },
      {
        conta: "Santander",
        totalCents: 9_650_451,
        count: 4,
        descricoes: [
          "Recebimento vendas - máquina de cartão",
          "Venda corporativa - boleto",
          "Repasse plataforma de entrega",
          "Venda evento - transferência",
        ],
      },
    ],
  },
  {
    categoria: "Receitas Financeiras",
    contas: [
      { conta: "Itaú", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Santander",
        totalCents: 26,
        count: 1,
        descricoes: ["Rendimento conta corrente"],
      },
    ],
  },
  {
    categoria: "Outras Receitas",
    contas: [
      { conta: "Itaú", totalCents: 0, count: 0, descricoes: [] },
      { conta: "Santander", totalCents: 0, count: 0, descricoes: [] },
    ],
  },

  // ---- Despesas ----
  {
    categoria: "Compras de Mercadorias",
    contas: [
      {
        conta: "Itaú",
        totalCents: -1_505_007,
        count: 3,
        descricoes: [
          "Compra de hortifruti - feira",
          "Compra de temperos e embalagens",
          "Compra de carnes - açougue local",
        ],
      },
      {
        conta: "Santander",
        totalCents: -6_020_026,
        count: 3,
        descricoes: [
          "Compra de carnes - Distribuidora ABC",
          "Compra de hortifruti - CEASA",
          "Compra de embalagens descartáveis - fornecedor",
        ],
      },
    ],
  },
  {
    categoria: "Pessoal",
    contas: [
      { conta: "Itaú", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Santander",
        totalCents: -3_397_607,
        count: 2,
        descricoes: [
          "Pagamento salário - auxiliar de cozinha",
          "Pagamento salário - entregador",
        ],
      },
    ],
  },
  {
    categoria: "Impostos e Taxas",
    contas: [
      { conta: "Itaú", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Santander",
        totalCents: -845_222,
        count: 2,
        descricoes: ["DAS - Simples Nacional", "GPS - INSS"],
      },
    ],
  },
  {
    categoria: "Despesas Financeiras e Bancárias",
    contas: [
      {
        conta: "Itaú",
        totalCents: -51_876,
        count: 1,
        descricoes: ["Tarifa de manutenção de conta"],
      },
      {
        conta: "Santander",
        totalCents: -121_043,
        count: 1,
        descricoes: ["Tarifa da maquininha de cartão"],
      },
    ],
  },
  {
    categoria: "Materiais e Suprimentos",
    contas: [
      {
        conta: "Itaú",
        totalCents: -510_778,
        count: 2,
        descricoes: ["Compra de utensílios de cozinha", "Compra de material de limpeza"],
      },
      {
        conta: "Santander",
        totalCents: -766_166,
        count: 2,
        descricoes: ["Compra de embalagens para entrega", "Compra de descartáveis em atacado"],
      },
    ],
  },
  {
    categoria: "Serviços Profissionais e Assinaturas",
    contas: [
      { conta: "Itaú", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Santander",
        totalCents: -130_727,
        count: 1,
        descricoes: ["Mensalidade escritório de contabilidade"],
      },
    ],
  },
  {
    categoria: "Manutenção e Reparos",
    contas: [
      {
        conta: "Itaú",
        totalCents: -30_000,
        count: 1,
        descricoes: ["Conserto de fogão industrial"],
      },
      { conta: "Santander", totalCents: 0, count: 0, descricoes: [] },
    ],
  },
  {
    categoria: "Combustível e Transporte",
    contas: [
      {
        conta: "Itaú",
        totalCents: -46_674,
        count: 2,
        descricoes: ["Abastecimento moto de entrega", "Aplicativo de transporte - compras"],
      },
      { conta: "Santander", totalCents: 0, count: 0, descricoes: [] },
    ],
  },
  {
    categoria: "Seguros",
    contas: [
      { conta: "Itaú", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Santander",
        totalCents: -32_488,
        count: 1,
        descricoes: ["Seguro empresarial mensal"],
      },
    ],
  },
  {
    categoria: "Telefonia e Internet",
    contas: [
      { conta: "Itaú", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Santander",
        totalCents: -6_999,
        count: 1,
        descricoes: ["Conta de internet e telefone"],
      },
    ],
  },
  {
    categoria: "Aluguel",
    contas: [
      { conta: "Itaú", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Santander",
        totalCents: -341_252,
        count: 1,
        descricoes: ["Aluguel do ponto comercial"],
      },
    ],
  },
  {
    categoria: "Alimentação",
    contas: [
      {
        conta: "Itaú",
        totalCents: -16_590,
        count: 2,
        descricoes: ["Almoço da equipe", "Lanche - reunião com fornecedor"],
      },
      { conta: "Santander", totalCents: 0, count: 0, descricoes: [] },
    ],
  },
  {
    categoria: "Marketing",
    contas: [
      {
        conta: "Itaú",
        totalCents: -21_900,
        count: 1,
        descricoes: ["Impulsionamento de posts - Instagram"],
      },
      { conta: "Santander", totalCents: 0, count: 0, descricoes: [] },
    ],
  },
  {
    categoria: "Frete",
    contas: [
      {
        conta: "Itaú",
        totalCents: -6_846,
        count: 1,
        descricoes: ["Frete de fornecedor - embalagens"],
      },
      { conta: "Santander", totalCents: 0, count: 0, descricoes: [] },
    ],
  },
  {
    categoria: "Outras Despesas",
    contas: [
      {
        conta: "Itaú",
        totalCents: -24_528,
        count: 1,
        descricoes: ["Despesa diversa - pequenos itens"],
      },
      {
        conta: "Santander",
        totalCents: -24_528,
        count: 1,
        descricoes: ["Despesa diversa - materiais de escritório"],
      },
    ],
  },

  // ---- Outros Movimentos (não entram no cálculo de receita/despesa) ----
  {
    categoria: "Distribuição de Lucros",
    contas: [
      { conta: "Itaú", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Santander",
        totalCents: -1_152_599,
        count: 1,
        descricoes: ["Distribuição de lucros aos sócios"],
      },
    ],
  },
  {
    categoria: "Despesas do Sócio",
    contas: [
      {
        conta: "Itaú",
        totalCents: -5_000,
        count: 1,
        descricoes: ["Retirada pessoal do sócio"],
      },
      { conta: "Santander", totalCents: 0, count: 0, descricoes: [] },
    ],
  },
  {
    categoria: "Empréstimos Concedidos",
    contas: [
      { conta: "Itaú", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Santander",
        totalCents: -2_000_000,
        count: 1,
        descricoes: ["Empréstimo concedido a terceiro"],
      },
    ],
  },
  {
    categoria: "Empréstimos Recebidos",
    contas: [
      { conta: "Itaú", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Santander",
        totalCents: 1_500_000,
        count: 1,
        descricoes: ["Empréstimo recebido - capital de giro"],
      },
    ],
  },
  {
    categoria: "Aquisição de Equipamentos",
    contas: [
      {
        conta: "Itaú",
        totalCents: -57_557,
        count: 1,
        descricoes: ["Compra de liquidificador industrial"],
      },
      { conta: "Santander", totalCents: 0, count: 0, descricoes: [] },
    ],
  },
  {
    categoria: "Transferência entre Contas",
    contas: [
      {
        conta: "Itaú",
        totalCents: -125_700,
        count: 1,
        descricoes: ["Transferência para conta Santander"],
      },
      { conta: "Santander", totalCents: 0, count: 0, descricoes: [] },
    ],
  },
  {
    categoria: "Estorno de Valores",
    contas: [
      { conta: "Itaú", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Santander",
        totalCents: 409_570,
        count: 1,
        descricoes: ["Estorno de cobrança indevida"],
      },
    ],
  },
  {
    categoria: "Estorno de Vendas",
    contas: [
      {
        conta: "Itaú",
        totalCents: -11_245,
        count: 1,
        descricoes: ["Estorno de venda - cliente"],
      },
      { conta: "Santander", totalCents: 0, count: 0, descricoes: [] },
    ],
  },
];

/** Saldo em conta ao final do período (Agosto/2026), em centavos. */
export const SALDO_FINAL_CENTS: Record<Banco, number> = {
  "Itaú": 185_032,
  "Santander": 395_647,
};

export const SALDO_FINAL_CONSOLIDADO_CENTS = 580_679;

export const SEED_RNG = 20260801;
export const ANO_REFERENCIA = 2026;
export const MES_REFERENCIA = 8; // Agosto
export const DIAS_NO_MES_REFERENCIA = 31;
