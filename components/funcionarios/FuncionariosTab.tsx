"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FuncionarioReal, PagamentoFuncionario } from "@/lib/data/funcionarios";
import {
  criarFuncionario,
  definirFuncionarioAtivo,
  registrarPagamentoFuncionario,
} from "@/lib/actions/funcionarios";
import { Valor } from "@/components/ui/Valor";
import { formatDataCurta } from "@/lib/format";

interface ContaOpcao {
  id: string;
  banco: string;
}

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export function FuncionariosTab({
  empresaId,
  funcionarios,
  contas,
  pagamentosRecentes,
}: {
  empresaId: string;
  funcionarios: FuncionarioReal[];
  contas: ContaOpcao[];
  pagamentosRecentes: PagamentoFuncionario[];
}) {
  const router = useRouter();

  // --- Novo funcionário ---
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [valorConducao, setValorConducao] = useState("");
  const [salvandoFuncionario, setSalvandoFuncionario] = useState(false);
  const [erroFuncionario, setErroFuncionario] = useState<string | null>(null);

  async function handleNovoFuncionario(e: React.FormEvent) {
    e.preventDefault();
    setSalvandoFuncionario(true);
    setErroFuncionario(null);

    const numero = valorConducao.trim() ? Number(valorConducao.replace(",", ".")) : null;
    const resposta = await criarFuncionario(empresaId, nome, cargo, numero);

    setSalvandoFuncionario(false);
    if (resposta.sucesso) {
      setNome("");
      setCargo("");
      setValorConducao("");
      router.refresh();
    } else {
      setErroFuncionario(resposta.erro ?? "Não foi possível cadastrar.");
    }
  }

  async function handleToggleAtivo(funcionarioId: string, ativo: boolean) {
    await definirFuncionarioAtivo(funcionarioId, ativo);
    router.refresh();
  }

  // --- Registrar condução / horas extras ---
  const funcionariosAtivos = funcionarios.filter((f) => f.ativo);
  const [funcionarioId, setFuncionarioId] = useState("");
  const [contaId, setContaId] = useState("");
  // A lista pode estar vazia no primeiro render e só vir depois (ex.: logo
  // após cadastrar o 1º funcionário) — deriva o valor efetivo aqui em vez de
  // confiar só no estado inicial, senão o <select> parece selecionado sem
  // o formulário de fato ter um id válido por trás.
  const funcionarioIdEfetivo =
    funcionarioId && funcionariosAtivos.some((f) => f.id === funcionarioId)
      ? funcionarioId
      : (funcionariosAtivos[0]?.id ?? "");
  const contaIdEfetivo =
    contaId && contas.some((c) => c.id === contaId) ? contaId : (contas[0]?.id ?? "");
  const [tipo, setTipo] = useState<"conducao" | "hora_extra">("conducao");
  const [dataPagamento, setDataPagamento] = useState(hoje());
  const [valorPagamento, setValorPagamento] = useState("");
  const [horas, setHoras] = useState("");
  const [salvandoPagamento, setSalvandoPagamento] = useState(false);
  const [resultadoPagamento, setResultadoPagamento] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(
    null,
  );

  function selecionarFuncionarioParaPagamento(id: string) {
    setFuncionarioId(id);
    const funcionario = funcionarios.find((f) => f.id === id);
    if (tipo === "conducao" && funcionario?.valorConducaoPadrao != null) {
      setValorPagamento(String(funcionario.valorConducaoPadrao));
    }
  }

  async function handleRegistrarPagamento(e: React.FormEvent) {
    e.preventDefault();
    const funcionario = funcionarios.find((f) => f.id === funcionarioIdEfetivo);
    if (!funcionario || !contaIdEfetivo) return;

    setSalvandoPagamento(true);
    setResultadoPagamento(null);

    const resposta = await registrarPagamentoFuncionario({
      empresaId,
      contaId: contaIdEfetivo,
      funcionarioId: funcionarioIdEfetivo,
      funcionarioNome: funcionario.nome,
      tipo,
      data: dataPagamento,
      valor: Number(valorPagamento.replace(",", ".")),
      horas: tipo === "hora_extra" ? Number(horas.replace(",", ".")) : undefined,
    });

    setSalvandoPagamento(false);
    if (resposta.sucesso) {
      setResultadoPagamento({ tipo: "ok", texto: "Pagamento registrado." });
      setValorPagamento("");
      setHoras("");
      router.refresh();
    } else {
      setResultadoPagamento({ tipo: "erro", texto: resposta.erro ?? "Não foi possível registrar." });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">Funcionários</h3>
        <div className="overflow-hidden rounded-xl border border-ink-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-4 py-2.5 font-medium">Nome</th>
                <th className="px-4 py-2.5 font-medium">Cargo</th>
                <th className="px-4 py-2.5 font-medium">Condução padrão</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {funcionarios.map((f) => (
                <tr key={f.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-2.5 text-ink-700">{f.nome}</td>
                  <td className="px-4 py-2.5 text-ink-500">{f.cargo}</td>
                  <td className="px-4 py-2.5 text-ink-500">
                    {f.valorConducaoPadrao != null ? <Valor valor={f.valorConducaoPadrao} /> : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                        f.ativo
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-ink-200 bg-paper-50 text-ink-400"
                      }`}
                    >
                      {f.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleAtivo(f.id, !f.ativo)}
                      className="text-xs text-ink-400 underline-offset-2 hover:text-ink-700 hover:underline"
                    >
                      {f.ativo ? "Desativar" : "Reativar"}
                    </button>
                  </td>
                </tr>
              ))}
              {funcionarios.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink-300">
                    Nenhum funcionário cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <form
          onSubmit={handleNovoFuncionario}
          className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-ink-200 bg-paper-50 p-4"
        >
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
            Nome
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-48 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
            Cargo
            <input
              type="text"
              required
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-40 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
            Condução padrão (R$/dia)
            <input
              type="text"
              inputMode="decimal"
              value={valorConducao}
              onChange={(e) => setValorConducao(e.target.value)}
              placeholder="opcional"
              className="w-36 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
            />
          </label>
          <button
            type="submit"
            disabled={salvandoFuncionario}
            className="rounded-lg border border-ink-700 bg-ink-700 px-4 py-2 text-sm font-medium text-paper-100 transition-colors hover:bg-ink-800 disabled:opacity-50"
          >
            {salvandoFuncionario ? "Salvando…" : "Cadastrar funcionário"}
          </button>
          {erroFuncionario && <p className="text-sm text-red-600">{erroFuncionario}</p>}
        </form>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">
          Registrar condução ou horas extras
        </h3>

        {funcionariosAtivos.length === 0 || contas.length === 0 ? (
          <p className="rounded-xl border border-ink-200 bg-paper-50 p-4 text-sm text-ink-500">
            Cadastre pelo menos um funcionário ativo e uma conta bancária para registrar pagamentos.
          </p>
        ) : (
          <form
            onSubmit={handleRegistrarPagamento}
            className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-paper-50 p-4"
          >
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
                Funcionário
                <select
                  value={funcionarioIdEfetivo}
                  onChange={(e) => selecionarFuncionarioParaPagamento(e.target.value)}
                  className="w-48 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
                >
                  {funcionariosAtivos.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
                Tipo
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as "conducao" | "hora_extra")}
                  className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
                >
                  <option value="conducao">Condução</option>
                  <option value="hora_extra">Horas extras</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
                Conta de saída
                <select
                  value={contaIdEfetivo}
                  onChange={(e) => setContaId(e.target.value)}
                  className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
                >
                  {contas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.banco}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
                Data
                <input
                  type="date"
                  value={dataPagamento}
                  onChange={(e) => setDataPagamento(e.target.value)}
                  className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
                />
              </label>

              {tipo === "hora_extra" && (
                <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
                  Horas
                  <input
                    type="text"
                    inputMode="decimal"
                    value={horas}
                    onChange={(e) => setHoras(e.target.value)}
                    placeholder="ex.: 3"
                    className="w-20 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
                  />
                </label>
              )}

              <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
                Valor (R$)
                <input
                  type="text"
                  inputMode="decimal"
                  value={valorPagamento}
                  onChange={(e) => setValorPagamento(e.target.value)}
                  placeholder="0,00"
                  className="w-28 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
                />
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={salvandoPagamento}
                className="rounded-lg border border-ink-700 bg-ink-700 px-4 py-2 text-sm font-medium text-paper-100 transition-colors hover:bg-ink-800 disabled:opacity-50"
              >
                {salvandoPagamento ? "Registrando…" : "Registrar pagamento"}
              </button>
            </div>

            {resultadoPagamento && (
              <p className={`text-sm ${resultadoPagamento.tipo === "ok" ? "text-emerald-600" : "text-red-600"}`}>
                {resultadoPagamento.texto}
              </p>
            )}
          </form>
        )}
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">
          Últimos pagamentos de condução e horas extras
        </h3>
        <div className="overflow-hidden rounded-xl border border-ink-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-4 py-2.5 font-medium">Data</th>
                <th className="px-4 py-2.5 font-medium">Funcionário</th>
                <th className="px-4 py-2.5 font-medium">Descrição</th>
                <th className="px-4 py-2.5 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {pagamentosRecentes.map((p) => {
                const funcionario = funcionarios.find((f) => f.id === p.funcionarioId);
                return (
                  <tr key={p.id} className="border-b border-ink-100 last:border-0">
                    <td className="px-4 py-2.5 text-ink-500">{formatDataCurta(p.data)}</td>
                    <td className="px-4 py-2.5 text-ink-700">{funcionario?.nome ?? "—"}</td>
                    <td className="px-4 py-2.5 text-ink-500">{p.descricao}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Valor valor={p.valor} />
                    </td>
                  </tr>
                );
              })}
              {pagamentosRecentes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-ink-300">
                    Nenhum pagamento registrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
