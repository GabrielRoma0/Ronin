"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { InsumoReal } from "@/lib/data/cmv";
import type { ItemCardapioReal } from "@/lib/cmvCalculos";
import { custoItem, margemItem, cmvPercentual } from "@/lib/cmvCalculos";
import {
  criarInsumo,
  atualizarCustoInsumo,
  removerInsumo,
  criarItemCardapio,
  atualizarPrecoItemCardapio,
  definirItemCardapioAtivo,
  removerItemCardapio,
  adicionarInsumoAoItem,
  removerInsumoDoItem,
} from "@/lib/actions/cmv";
import { formatBRL, formatPercent } from "@/lib/format";

export function CustoMercadoriaTab({
  empresaId,
  insumos,
  itens,
}: {
  empresaId: string;
  insumos: InsumoReal[];
  itens: ItemCardapioReal[];
}) {
  const router = useRouter();

  // --- Insumos: cadastro ---
  const [nomeInsumo, setNomeInsumo] = useState("");
  const [custoInsumo, setCustoInsumo] = useState("");
  const [salvandoInsumo, setSalvandoInsumo] = useState(false);
  const [erroInsumo, setErroInsumo] = useState<string | null>(null);

  async function handleNovoInsumo(e: React.FormEvent) {
    e.preventDefault();
    const custo = Number(custoInsumo.replace(",", "."));
    setSalvandoInsumo(true);
    setErroInsumo(null);
    const resposta = await criarInsumo(empresaId, nomeInsumo, custo);
    setSalvandoInsumo(false);
    if (resposta.sucesso) {
      setNomeInsumo("");
      setCustoInsumo("");
      router.refresh();
    } else {
      setErroInsumo(resposta.erro ?? "Não foi possível cadastrar.");
    }
  }

  // --- Insumos: editar custo / apagar ---
  const [editandoInsumoId, setEditandoInsumoId] = useState<string | null>(null);
  const [custoEditado, setCustoEditado] = useState("");
  const [confirmandoInsumoId, setConfirmandoInsumoId] = useState<string | null>(null);
  const [salvandoAcaoInsumoId, setSalvandoAcaoInsumoId] = useState<string | null>(null);
  const [erroAcaoInsumo, setErroAcaoInsumo] = useState<string | null>(null);

  function iniciarEdicaoInsumo(i: InsumoReal) {
    setEditandoInsumoId(i.id);
    setCustoEditado(String(i.custoUnitario));
  }

  async function handleSalvarCustoInsumo(id: string) {
    const custo = Number(custoEditado.replace(",", "."));
    setSalvandoAcaoInsumoId(id);
    setErroAcaoInsumo(null);
    const resposta = await atualizarCustoInsumo(id, custo);
    setSalvandoAcaoInsumoId(null);
    if (resposta.sucesso) {
      setEditandoInsumoId(null);
      router.refresh();
    } else {
      setErroAcaoInsumo(resposta.erro ?? "Não foi possível salvar.");
    }
  }

  async function handleRemoverInsumo(id: string) {
    setSalvandoAcaoInsumoId(id);
    setErroAcaoInsumo(null);
    const resposta = await removerInsumo(id);
    setSalvandoAcaoInsumoId(null);
    setConfirmandoInsumoId(null);
    if (resposta.sucesso) {
      router.refresh();
    } else {
      setErroAcaoInsumo(resposta.erro ?? "Não foi possível apagar.");
    }
  }

  // --- Itens do cardápio: cadastro ---
  const [nomeItem, setNomeItem] = useState("");
  const [precoItem, setPrecoItem] = useState("");
  const [salvandoItem, setSalvandoItem] = useState(false);
  const [erroItem, setErroItem] = useState<string | null>(null);

  async function handleNovoItem(e: React.FormEvent) {
    e.preventDefault();
    const preco = Number(precoItem.replace(",", "."));
    setSalvandoItem(true);
    setErroItem(null);
    const resposta = await criarItemCardapio(empresaId, nomeItem, preco);
    setSalvandoItem(false);
    if (resposta.sucesso) {
      setNomeItem("");
      setPrecoItem("");
      router.refresh();
    } else {
      setErroItem(resposta.erro ?? "Não foi possível cadastrar.");
    }
  }

  // --- Itens: editar preço / ativo / apagar ---
  const [editandoItemId, setEditandoItemId] = useState<string | null>(null);
  const [precoEditado, setPrecoEditado] = useState("");
  const [confirmandoItemId, setConfirmandoItemId] = useState<string | null>(null);
  const [salvandoAcaoItemId, setSalvandoAcaoItemId] = useState<string | null>(null);
  const [erroAcaoItem, setErroAcaoItem] = useState<string | null>(null);

  function iniciarEdicaoItem(item: ItemCardapioReal) {
    setEditandoItemId(item.id);
    setPrecoEditado(String(item.precoVenda));
  }

  async function handleSalvarPrecoItem(id: string) {
    const preco = Number(precoEditado.replace(",", "."));
    setSalvandoAcaoItemId(id);
    setErroAcaoItem(null);
    const resposta = await atualizarPrecoItemCardapio(id, preco);
    setSalvandoAcaoItemId(null);
    if (resposta.sucesso) {
      setEditandoItemId(null);
      router.refresh();
    } else {
      setErroAcaoItem(resposta.erro ?? "Não foi possível salvar.");
    }
  }

  async function handleToggleAtivoItem(id: string, ativo: boolean) {
    setSalvandoAcaoItemId(id);
    setErroAcaoItem(null);
    const resposta = await definirItemCardapioAtivo(id, ativo);
    setSalvandoAcaoItemId(null);
    if (resposta.sucesso) {
      router.refresh();
    } else {
      setErroAcaoItem(resposta.erro ?? "Não foi possível atualizar o status.");
    }
  }

  async function handleRemoverItem(id: string) {
    setSalvandoAcaoItemId(id);
    setErroAcaoItem(null);
    const resposta = await removerItemCardapio(id);
    setSalvandoAcaoItemId(null);
    setConfirmandoItemId(null);
    if (resposta.sucesso) {
      if (itemSelecionadoId === id) setItemSelecionadoId(null);
      router.refresh();
    } else {
      setErroAcaoItem(resposta.erro ?? "Não foi possível apagar.");
    }
  }

  // --- Composição do item selecionado ---
  const [itemSelecionadoId, setItemSelecionadoId] = useState<string | null>(null);
  const itemSelecionado = itens.find((i) => i.id === itemSelecionadoId) ?? null;
  const [insumoParaAdicionar, setInsumoParaAdicionar] = useState("");
  const [quantidadeParaAdicionar, setQuantidadeParaAdicionar] = useState("");
  const [salvandoComposicao, setSalvandoComposicao] = useState(false);
  const [removendoComposicaoId, setRemovendoComposicaoId] = useState<string | null>(null);
  const [erroComposicao, setErroComposicao] = useState<string | null>(null);

  const insumoIdEfetivo =
    insumoParaAdicionar && insumos.some((i) => i.id === insumoParaAdicionar)
      ? insumoParaAdicionar
      : (insumos[0]?.id ?? "");

  async function handleAdicionarInsumoAoItem(e: React.FormEvent) {
    e.preventDefault();
    if (!itemSelecionadoId || !insumoIdEfetivo) return;
    const quantidade = Number(quantidadeParaAdicionar.replace(",", "."));
    setSalvandoComposicao(true);
    setErroComposicao(null);
    const resposta = await adicionarInsumoAoItem(itemSelecionadoId, insumoIdEfetivo, quantidade);
    setSalvandoComposicao(false);
    if (resposta.sucesso) {
      setQuantidadeParaAdicionar("");
      router.refresh();
    } else {
      setErroComposicao(resposta.erro ?? "Não foi possível adicionar.");
    }
  }

  async function handleRemoverInsumoDoItem(composicaoId: string) {
    setRemovendoComposicaoId(composicaoId);
    setErroComposicao(null);
    const resposta = await removerInsumoDoItem(composicaoId);
    setRemovendoComposicaoId(null);
    if (resposta.sucesso) {
      router.refresh();
    } else {
      setErroComposicao(resposta.erro ?? "Não foi possível remover.");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink-900">Custo de Mercadoria</h2>
        <p className="mt-1 text-sm text-ink-400">
          Cadastre os insumos (ingredientes) e monte a composição de cada item do cardápio pra ver
          custo, margem e CMV calculados automaticamente — sem precisar redigitar o mesmo
          ingrediente em vários itens.
        </p>
      </div>

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">Insumos</h3>
        <div className="overflow-x-auto rounded-xl border border-ink-200">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-400">
                <th scope="col" className="px-4 py-2.5 font-medium">Nome</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Custo unitário</th>
                <th scope="col" className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {insumos.map((i) => {
                const emEdicao = editandoInsumoId === i.id;
                return (
                  <tr key={i.id} className="border-b border-ink-100 last:border-0">
                    <td className="px-4 py-2.5 text-ink-700">{i.nome}</td>
                    <td className="px-4 py-2.5 text-ink-500">
                      {emEdicao ? (
                        <input
                          type="text"
                          inputMode="decimal"
                          value={custoEditado}
                          onChange={(e) => setCustoEditado(e.target.value)}
                          className="w-24 rounded-md border border-ink-200 bg-white px-2 py-1 text-xs"
                        />
                      ) : (
                        formatBRL(i.custoUnitario)
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end gap-3">
                        {emEdicao ? (
                          <>
                            <button
                              type="button"
                              disabled={salvandoAcaoInsumoId === i.id}
                              onClick={() => handleSalvarCustoInsumo(i.id)}
                              aria-label={`Salvar custo unitário de ${i.nome}`}
                              title={`Salvar custo unitário de ${i.nome}`}
                              className="rounded text-xs font-medium text-brass-700 hover:underline disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                            >
                              salvar
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditandoInsumoId(null)}
                              aria-label={`Cancelar edição de ${i.nome}`}
                              title={`Cancelar edição de ${i.nome}`}
                              className="rounded text-xs text-ink-400 hover:text-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                            >
                              cancelar
                            </button>
                          </>
                        ) : confirmandoInsumoId === i.id ? (
                          <>
                            <button
                              type="button"
                              disabled={salvandoAcaoInsumoId === i.id}
                              onClick={() => handleRemoverInsumo(i.id)}
                              aria-label={`Confirmar exclusão definitiva do insumo ${i.nome}`}
                              title={`Confirmar exclusão definitiva do insumo ${i.nome}`}
                              className="rounded text-xs font-medium text-red-600 hover:underline disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                            >
                              {salvandoAcaoInsumoId === i.id ? "Apagando…" : "Confirmar?"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmandoInsumoId(null)}
                              aria-label={`Cancelar exclusão de ${i.nome}`}
                              title={`Cancelar exclusão de ${i.nome}`}
                              className="rounded text-xs text-ink-400 hover:text-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                            >
                              cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => iniciarEdicaoInsumo(i)}
                              aria-label={`Editar custo unitário de ${i.nome}`}
                              title={`Editar custo unitário de ${i.nome}`}
                              className="rounded text-xs text-ink-400 hover:text-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                            >
                              editar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmandoInsumoId(i.id)}
                              aria-label={`Apagar insumo ${i.nome}`}
                              title={`Apagar insumo ${i.nome}`}
                              className="rounded text-xs text-ink-300 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                            >
                              apagar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {insumos.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-ink-300">
                    Nenhum insumo cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {erroAcaoInsumo && <p className="mt-2 text-sm text-red-600">{erroAcaoInsumo}</p>}

        <form
          onSubmit={handleNovoInsumo}
          className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-ink-200 bg-paper-50 p-4"
        >
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
            Nome do insumo
            <input
              type="text"
              required
              placeholder="ex.: Pão, Carne, Queijo"
              value={nomeInsumo}
              onChange={(e) => setNomeInsumo(e.target.value)}
              className="w-48 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
            Custo unitário (R$)
            <input
              type="text"
              required
              inputMode="decimal"
              placeholder="0,00"
              value={custoInsumo}
              onChange={(e) => setCustoInsumo(e.target.value)}
              className="w-32 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
            />
          </label>
          <button
            type="submit"
            disabled={salvandoInsumo}
            className="rounded-lg border border-ink-700 bg-ink-700 px-4 py-2 text-sm font-medium text-paper-100 transition-colors hover:bg-ink-800 disabled:opacity-50"
          >
            {salvandoInsumo ? "Salvando…" : "Cadastrar insumo"}
          </button>
          {erroInsumo && <p className="text-sm text-red-600">{erroInsumo}</p>}
        </form>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">Itens do cardápio</h3>
        <div className="overflow-x-auto rounded-xl border border-ink-200">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-400">
                <th scope="col" className="px-4 py-2.5 font-medium">Item</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Preço de venda</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Custo (ficha técnica)</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Margem</th>
                <th scope="col" className="px-4 py-2.5 font-medium">CMV</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
                <th scope="col" className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => {
                const emEdicao = editandoItemId === item.id;
                const custo = custoItem(item);
                const margem = margemItem(item);
                const cmv = cmvPercentual(item);
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-ink-100 last:border-0 ${itemSelecionadoId === item.id ? "bg-brass-50/60" : ""}`}
                  >
                    <td className="px-4 py-2.5 text-ink-700">{item.nome}</td>
                    <td className="px-4 py-2.5 text-ink-500">
                      {emEdicao ? (
                        <input
                          type="text"
                          inputMode="decimal"
                          value={precoEditado}
                          onChange={(e) => setPrecoEditado(e.target.value)}
                          className="w-24 rounded-md border border-ink-200 bg-white px-2 py-1 text-xs"
                        />
                      ) : (
                        formatBRL(item.precoVenda)
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-ink-500">{formatBRL(custo)}</td>
                    <td className={`px-4 py-2.5 ${margem < 0 ? "text-red-600" : "text-emerald-700"}`}>
                      {formatBRL(margem)}
                    </td>
                    <td className="px-4 py-2.5 text-ink-500">
                      {cmv != null ? formatPercent(cmv) : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                          item.ativo
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-ink-200 bg-paper-50 text-ink-400"
                        }`}
                      >
                        {item.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex flex-wrap justify-end gap-3">
                        {emEdicao ? (
                          <>
                            <button
                              type="button"
                              disabled={salvandoAcaoItemId === item.id}
                              onClick={() => handleSalvarPrecoItem(item.id)}
                              aria-label={`Salvar preço de venda de ${item.nome}`}
                              title={`Salvar preço de venda de ${item.nome}`}
                              className="rounded text-xs font-medium text-brass-700 hover:underline disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                            >
                              salvar
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditandoItemId(null)}
                              aria-label={`Cancelar edição de ${item.nome}`}
                              title={`Cancelar edição de ${item.nome}`}
                              className="rounded text-xs text-ink-400 hover:text-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                            >
                              cancelar
                            </button>
                          </>
                        ) : confirmandoItemId === item.id ? (
                          <>
                            <button
                              type="button"
                              disabled={salvandoAcaoItemId === item.id}
                              onClick={() => handleRemoverItem(item.id)}
                              aria-label={`Confirmar exclusão definitiva do item ${item.nome}`}
                              title={`Confirmar exclusão definitiva do item ${item.nome}`}
                              className="rounded text-xs font-medium text-red-600 hover:underline disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                            >
                              {salvandoAcaoItemId === item.id ? "Apagando…" : "Confirmar?"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmandoItemId(null)}
                              aria-label={`Cancelar exclusão de ${item.nome}`}
                              title={`Cancelar exclusão de ${item.nome}`}
                              className="rounded text-xs text-ink-400 hover:text-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                            >
                              cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setItemSelecionadoId(itemSelecionadoId === item.id ? null : item.id)
                              }
                              aria-label={`${itemSelecionadoId === item.id ? "Fechar" : "Ver"} composição de ${item.nome}`}
                              title={`${itemSelecionadoId === item.id ? "Fechar" : "Ver"} composição de ${item.nome}`}
                              aria-expanded={itemSelecionadoId === item.id}
                              className="rounded text-xs font-medium text-brass-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                            >
                              {itemSelecionadoId === item.id ? "fechar composição" : "composição"}
                            </button>
                            <button
                              type="button"
                              disabled={salvandoAcaoItemId === item.id}
                              onClick={() => iniciarEdicaoItem(item)}
                              aria-label={`Editar preço de venda de ${item.nome}`}
                              title={`Editar preço de venda de ${item.nome}`}
                              className="rounded text-xs text-ink-400 hover:text-ink-700 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                            >
                              editar
                            </button>
                            <button
                              type="button"
                              disabled={salvandoAcaoItemId === item.id}
                              onClick={() => handleToggleAtivoItem(item.id, !item.ativo)}
                              aria-label={`${item.ativo ? "Desativar" : "Reativar"} ${item.nome}`}
                              title={`${item.ativo ? "Desativar" : "Reativar"} ${item.nome}`}
                              className="rounded text-xs text-ink-400 hover:text-ink-700 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                            >
                              {salvandoAcaoItemId === item.id
                                ? "Atualizando…"
                                : item.ativo
                                  ? "desativar"
                                  : "reativar"}
                            </button>
                            <button
                              type="button"
                              disabled={salvandoAcaoItemId === item.id}
                              onClick={() => setConfirmandoItemId(item.id)}
                              aria-label={`Apagar item ${item.nome}`}
                              title={`Apagar item ${item.nome}`}
                              className="rounded text-xs text-ink-300 hover:text-red-600 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                            >
                              apagar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {itens.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ink-300">
                    Nenhum item cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {erroAcaoItem && <p className="mt-2 text-sm text-red-600">{erroAcaoItem}</p>}

        {itemSelecionado && (
          <div className="mt-4 rounded-xl border border-brass-300 bg-brass-100/40 p-4">
            <h4 className="font-display text-sm font-semibold text-ink-900">
              Composição — {itemSelecionado.nome}
            </h4>
            <ul className="mt-3 flex flex-col gap-1.5">
              {itemSelecionado.composicao.map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm text-ink-700">
                  <span>
                    {c.quantidade}× {c.insumoNome}{" "}
                    <span className="text-ink-400">
                      ({formatBRL(c.custoUnitario)} un. = {formatBRL(c.quantidade * c.custoUnitario)})
                    </span>
                  </span>
                  <button
                    type="button"
                    disabled={removendoComposicaoId === c.id}
                    onClick={() => handleRemoverInsumoDoItem(c.id)}
                    aria-label={`Remover ${c.insumoNome} da composição de ${itemSelecionado.nome}`}
                    title={`Remover ${c.insumoNome} da composição de ${itemSelecionado.nome}`}
                    className="rounded text-xs text-ink-300 hover:text-red-600 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                  >
                    {removendoComposicaoId === c.id ? "Removendo…" : "remover"}
                  </button>
                </li>
              ))}
              {itemSelecionado.composicao.length === 0 && (
                <li className="text-sm text-ink-400">Nenhum insumo adicionado ainda.</li>
              )}
            </ul>

            {insumos.length === 0 ? (
              <p className="mt-3 text-xs text-ink-400">
                Cadastre pelo menos um insumo acima antes de montar a composição.
              </p>
            ) : (
              <form
                onSubmit={handleAdicionarInsumoAoItem}
                className="mt-3 flex flex-wrap items-end gap-3"
              >
                <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
                  Insumo
                  <select
                    value={insumoIdEfetivo}
                    onChange={(e) => setInsumoParaAdicionar(e.target.value)}
                    className="w-40 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
                  >
                    {insumos.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nome}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
                  Quantidade
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="1"
                    value={quantidadeParaAdicionar}
                    onChange={(e) => setQuantidadeParaAdicionar(e.target.value)}
                    className="w-20 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
                  />
                </label>
                <button
                  type="submit"
                  disabled={salvandoComposicao}
                  className="rounded-lg border border-ink-700 bg-ink-700 px-4 py-2 text-sm font-medium text-paper-100 transition-colors hover:bg-ink-800 disabled:opacity-50"
                >
                  {salvandoComposicao ? "Adicionando…" : "Adicionar à composição"}
                </button>
              </form>
            )}
            {erroComposicao && <p className="mt-2 text-sm text-red-600">{erroComposicao}</p>}
          </div>
        )}

        <form
          onSubmit={handleNovoItem}
          className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-ink-200 bg-paper-50 p-4"
        >
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
            Nome do item
            <input
              type="text"
              required
              placeholder="ex.: X-Burger"
              value={nomeItem}
              onChange={(e) => setNomeItem(e.target.value)}
              className="w-48 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
            Preço de venda (R$)
            <input
              type="text"
              required
              inputMode="decimal"
              placeholder="0,00"
              value={precoItem}
              onChange={(e) => setPrecoItem(e.target.value)}
              className="w-32 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
            />
          </label>
          <button
            type="submit"
            disabled={salvandoItem}
            className="rounded-lg border border-ink-700 bg-ink-700 px-4 py-2 text-sm font-medium text-paper-100 transition-colors hover:bg-ink-800 disabled:opacity-50"
          >
            {salvandoItem ? "Salvando…" : "Cadastrar item"}
          </button>
          {erroItem && <p className="text-sm text-red-600">{erroItem}</p>}
        </form>
      </section>
    </div>
  );
}
