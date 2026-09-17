"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import type { AvaliacaoFuncionario, FuncionarioReal, PagamentoFuncionario } from "@/lib/data/funcionarios";
import {
  atualizarDadosFuncionario,
  criarFuncionario,
  definirFuncionarioAtivo,
  registrarPagamentoFuncionario,
  removerFuncionario,
} from "@/lib/actions/funcionarios";
import { registrarAvaliacao } from "@/lib/actions/avaliacoes";
import { Valor } from "@/components/ui/Valor";
import { formatBRL, formatDataCurta } from "@/lib/format";

interface ContaOpcao {
  id: string;
  banco: string;
}

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Segunda-feira da semana corrente, em formato ISO (yyyy-mm-dd) — base pro contador de condução da semana. */
function inicioDaSemana(): string {
  const agora = new Date();
  const dia = agora.getDay();
  const diffAteSegunda = dia === 0 ? 6 : dia - 1;
  const segunda = new Date(agora);
  segunda.setDate(agora.getDate() - diffAteSegunda);
  return segunda.toISOString().slice(0, 10);
}

export function FuncionariosTab({
  empresaId,
  funcionarios,
  contas,
  pagamentosRecentes,
  avaliacoes,
}: {
  empresaId: string;
  funcionarios: FuncionarioReal[];
  contas: ContaOpcao[];
  pagamentosRecentes: PagamentoFuncionario[];
  avaliacoes: AvaliacaoFuncionario[];
}) {
  const router = useRouter();

  // --- Novo funcionário ---
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [valorConducao, setValorConducao] = useState("");
  const [salarioNovo, setSalarioNovo] = useState("");
  const [diasSemanaNovo, setDiasSemanaNovo] = useState("");
  const [salvandoFuncionario, setSalvandoFuncionario] = useState(false);
  const [erroFuncionario, setErroFuncionario] = useState<string | null>(null);

  async function handleNovoFuncionario(e: React.FormEvent) {
    e.preventDefault();
    setSalvandoFuncionario(true);
    setErroFuncionario(null);

    const numero = valorConducao.trim() ? Number(valorConducao.replace(",", ".")) : null;
    const salario = salarioNovo.trim() ? Number(salarioNovo.replace(",", ".")) : null;
    const dias = diasSemanaNovo.trim() ? Number(diasSemanaNovo) : null;
    const resposta = await criarFuncionario(empresaId, nome, cargo, numero, salario, dias);

    setSalvandoFuncionario(false);
    if (resposta.sucesso) {
      setNome("");
      setCargo("");
      setValorConducao("");
      setSalarioNovo("");
      setDiasSemanaNovo("");
      router.refresh();
    } else {
      setErroFuncionario(resposta.erro ?? "Não foi possível cadastrar.");
    }
  }

  const [erroRemocao, setErroRemocao] = useState<string | null>(null);
  const [removendoId, setRemovendoId] = useState<string | null>(null);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);

  async function handleToggleAtivo(funcionarioId: string, ativo: boolean) {
    await definirFuncionarioAtivo(funcionarioId, ativo);
    router.refresh();
  }

  async function handleRemover(funcionarioId: string) {
    setRemovendoId(funcionarioId);
    setErroRemocao(null);
    const resposta = await removerFuncionario(funcionarioId);
    setRemovendoId(null);
    setConfirmandoId(null);

    if (resposta.sucesso) {
      router.refresh();
    } else {
      setErroRemocao(resposta.erro ?? "Não foi possível apagar.");
    }
  }

  // --- Editar salário / dias de trabalho por semana ---
  const [editandoDados, setEditandoDados] = useState<Record<string, { salario: string; dias: string }>>({});
  const [salvandoDadosId, setSalvandoDadosId] = useState<string | null>(null);
  const [erroDados, setErroDados] = useState<string | null>(null);

  function iniciarEdicaoDados(f: FuncionarioReal) {
    setEditandoDados((atual) => ({
      ...atual,
      [f.id]: {
        salario: f.salario != null ? String(f.salario) : "",
        dias: f.diasTrabalhoSemana != null ? String(f.diasTrabalhoSemana) : "",
      },
    }));
  }

  function cancelarEdicaoDados(id: string) {
    setEditandoDados((atual) => {
      const resto = { ...atual };
      delete resto[id];
      return resto;
    });
  }

  async function handleSalvarDados(id: string) {
    const valores = editandoDados[id];
    if (!valores) return;

    const salario = valores.salario.trim() ? Number(valores.salario.replace(",", ".")) : null;
    const dias = valores.dias.trim() ? Number(valores.dias) : null;

    if (salario != null && !Number.isFinite(salario)) {
      setErroDados("Salário inválido.");
      return;
    }
    if (dias != null && (!Number.isInteger(dias) || dias < 1 || dias > 7)) {
      setErroDados("Dias por semana precisa ser um número inteiro entre 1 e 7.");
      return;
    }

    setSalvandoDadosId(id);
    setErroDados(null);
    const resposta = await atualizarDadosFuncionario(id, salario, dias);
    setSalvandoDadosId(null);

    if (resposta.sucesso) {
      cancelarEdicaoDados(id);
      router.refresh();
    } else {
      setErroDados(resposta.erro ?? "Não foi possível salvar.");
    }
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

  // horasExtras == null não basta pra dizer "é condução" — um lançamento de
  // Pessoal importado do extrato (ex.: "Salário - Fulano") também não tem
  // horas extras, mas não é condução nenhuma. A descrição é o sinal
  // confiável: só quem passa por registrarPagamentoFuncionario começa com
  // "Condução -" ou "Horas extras -", então checar o prefixo evita contar
  // salário como se fosse condução do dia.
  const inicioSemana = inicioDaSemana();
  const progressoConducaoSemana = funcionariosAtivos
    .filter((f) => f.diasTrabalhoSemana != null)
    .map((f) => {
      const diasComPagamento = new Set(
        pagamentosRecentes
          .filter(
            (p) =>
              p.funcionarioId === f.id && p.descricao.startsWith("Condução") && p.data >= inicioSemana,
          )
          .map((p) => p.data),
      );
      return { funcionario: f, registrados: diasComPagamento.size, meta: f.diasTrabalhoSemana! };
    });

  // --- Nota de satisfação (quinzenal, lançada manualmente pelo dono) ---
  const [avalFuncionarioId, setAvalFuncionarioId] = useState("");
  const avalFuncionarioIdEfetivo =
    avalFuncionarioId && funcionariosAtivos.some((f) => f.id === avalFuncionarioId)
      ? avalFuncionarioId
      : (funcionariosAtivos[0]?.id ?? "");
  const [avalData, setAvalData] = useState(hoje());
  const [avalNota, setAvalNota] = useState("");
  const [salvandoAval, setSalvandoAval] = useState(false);
  const [resultadoAval, setResultadoAval] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  async function handleRegistrarAvaliacao(e: React.FormEvent) {
    e.preventDefault();
    if (!avalFuncionarioIdEfetivo) return;

    const nota = Number(avalNota.replace(",", "."));
    if (!Number.isFinite(nota) || nota < 0 || nota > 10) {
      setResultadoAval({ tipo: "erro", texto: "Informe uma nota entre 0 e 10." });
      return;
    }

    setSalvandoAval(true);
    setResultadoAval(null);
    const resposta = await registrarAvaliacao(empresaId, avalFuncionarioIdEfetivo, avalData, nota);
    setSalvandoAval(false);

    if (resposta.sucesso) {
      setResultadoAval({ tipo: "ok", texto: "Nota registrada." });
      setAvalNota("");
      router.refresh();
    } else {
      setResultadoAval({ tipo: "erro", texto: resposta.erro ?? "Não foi possível registrar." });
    }
  }

  const funcionariosComAvaliacao = funcionarios.filter((f) => avaliacoes.some((a) => a.funcionarioId === f.id));
  const [verHistoricoId, setVerHistoricoId] = useState("");
  const verHistoricoIdEfetivo =
    verHistoricoId && funcionariosComAvaliacao.some((f) => f.id === verHistoricoId)
      ? verHistoricoId
      : (funcionariosComAvaliacao[0]?.id ?? "");
  const historicoSelecionado = avaliacoes
    .filter((a) => a.funcionarioId === verHistoricoIdEfetivo)
    .map((a) => ({ data: formatDataCurta(a.data), nota: a.nota }));

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">Funcionários</h3>
        <div className="overflow-x-auto rounded-xl border border-ink-200">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-4 py-2.5 font-medium">Nome</th>
                <th className="px-4 py-2.5 font-medium">Cargo</th>
                <th className="px-4 py-2.5 font-medium">Condução padrão</th>
                <th className="px-4 py-2.5 font-medium">Salário</th>
                <th className="px-4 py-2.5 font-medium">Dias/semana</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {funcionarios.map((f) => {
                const emEdicaoDados = editandoDados[f.id] !== undefined;
                return (
                  <tr key={f.id} className="border-b border-ink-100 last:border-0">
                    <td className="px-4 py-2.5 text-ink-700">{f.nome}</td>
                    <td className="px-4 py-2.5 text-ink-500">{f.cargo}</td>
                    <td className="px-4 py-2.5 text-ink-500">
                      {f.valorConducaoPadrao != null ? <Valor valor={f.valorConducaoPadrao} /> : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-ink-500">
                      {emEdicaoDados ? (
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="opcional"
                          value={editandoDados[f.id].salario}
                          onChange={(e) =>
                            setEditandoDados((atual) => ({
                              ...atual,
                              [f.id]: { ...atual[f.id], salario: e.target.value },
                            }))
                          }
                          className="w-24 rounded-md border border-ink-200 bg-white px-2 py-1 text-xs"
                        />
                      ) : f.salario != null ? (
                        formatBRL(f.salario)
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-ink-500">
                      {emEdicaoDados ? (
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="1-7"
                          value={editandoDados[f.id].dias}
                          onChange={(e) =>
                            setEditandoDados((atual) => ({
                              ...atual,
                              [f.id]: { ...atual[f.id], dias: e.target.value },
                            }))
                          }
                          className="w-14 rounded-md border border-ink-200 bg-white px-2 py-1 text-xs"
                        />
                      ) : (
                        (f.diasTrabalhoSemana ?? "—")
                      )}
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
                      <div className="flex justify-end gap-3">
                        {emEdicaoDados ? (
                          <>
                            <button
                              type="button"
                              disabled={salvandoDadosId === f.id}
                              onClick={() => handleSalvarDados(f.id)}
                              aria-label={`Salvar salário e dias de ${f.nome}`}
                              title={`Salvar salário e dias de ${f.nome}`}
                              className="rounded text-xs font-medium text-brass-700 hover:underline disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                            >
                              {salvandoDadosId === f.id ? "Salvando…" : "salvar"}
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelarEdicaoDados(f.id)}
                              aria-label={`Cancelar edição de ${f.nome}`}
                              title={`Cancelar edição de ${f.nome}`}
                              className="rounded text-xs text-ink-400 hover:text-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                            >
                              cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => iniciarEdicaoDados(f)}
                              aria-label={`Editar salário e dias de ${f.nome}`}
                              title={`Editar salário e dias de ${f.nome}`}
                              className="rounded text-xs text-ink-400 underline-offset-2 hover:text-ink-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                            >
                              editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleAtivo(f.id, !f.ativo)}
                              aria-label={`${f.ativo ? "Desativar" : "Reativar"} ${f.nome}`}
                              title={`${f.ativo ? "Desativar" : "Reativar"} ${f.nome}`}
                              className="rounded text-xs text-ink-400 underline-offset-2 hover:text-ink-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                            >
                              {f.ativo ? "Desativar" : "Reativar"}
                            </button>
                            {!f.ativo &&
                              (confirmandoId === f.id ? (
                                <>
                                  <button
                                    type="button"
                                    disabled={removendoId === f.id}
                                    onClick={() => handleRemover(f.id)}
                                    aria-label={`Confirmar exclusão definitiva de ${f.nome}`}
                                    title={`Confirmar exclusão definitiva de ${f.nome}`}
                                    className="rounded text-xs font-medium text-red-600 hover:underline disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                                  >
                                    {removendoId === f.id ? "Apagando…" : "Confirmar?"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmandoId(null)}
                                    aria-label={`Cancelar exclusão de ${f.nome}`}
                                    title={`Cancelar exclusão de ${f.nome}`}
                                    className="rounded text-xs text-ink-400 hover:text-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                                  >
                                    cancelar
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmandoId(f.id)}
                                  aria-label={`Apagar ${f.nome}`}
                                  title={`Apagar ${f.nome}`}
                                  className="rounded text-xs text-ink-300 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600"
                                >
                                  Apagar
                                </button>
                              ))}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {funcionarios.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ink-300">
                    Nenhum funcionário cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {erroRemocao && <p className="mt-2 text-sm text-red-600">{erroRemocao}</p>}
        {erroDados && <p className="mt-2 text-sm text-red-600">{erroDados}</p>}

        {progressoConducaoSemana.length > 0 && (
          <div className="mt-4 rounded-xl border border-ink-200 bg-paper-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
              Condução registrada essa semana
            </p>
            <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              {progressoConducaoSemana.map(({ funcionario, registrados, meta }) => (
                <li
                  key={funcionario.id}
                  className={registrados < meta ? "text-amber-700" : "text-ink-700"}
                >
                  {funcionario.nome}: <span className="font-medium">{registrados}</span> de {meta} dia(s)
                </li>
              ))}
            </ul>
          </div>
        )}

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
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
            Salário (R$)
            <input
              type="text"
              inputMode="decimal"
              value={salarioNovo}
              onChange={(e) => setSalarioNovo(e.target.value)}
              placeholder="opcional"
              className="w-32 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
            Dias/semana
            <input
              type="text"
              inputMode="numeric"
              value={diasSemanaNovo}
              onChange={(e) => setDiasSemanaNovo(e.target.value)}
              placeholder="1-7"
              className="w-20 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
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
        <div className="overflow-x-auto rounded-xl border border-ink-200">
          <table className="w-full min-w-[560px] text-sm">
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
                const eConducao = p.descricao.startsWith("Condução");
                const destoante =
                  eConducao &&
                  funcionario?.valorConducaoPadrao != null &&
                  Math.abs(p.valor) !== funcionario.valorConducaoPadrao;
                return (
                  <tr key={p.id} className="border-b border-ink-100 last:border-0">
                    <td className="px-4 py-2.5 text-ink-500">{formatDataCurta(p.data)}</td>
                    <td className="px-4 py-2.5 text-ink-700">{funcionario?.nome ?? "—"}</td>
                    <td className="px-4 py-2.5 text-ink-500">{p.descricao}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Valor valor={p.valor} />
                      {destoante && (
                        <span
                          className="ml-2 rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700"
                          title={`Padrão desse funcionário: ${formatBRL(funcionario!.valorConducaoPadrao!)}`}
                        >
                          ≠ padrão
                        </span>
                      )}
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

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">
          Nota de satisfação (quinzenal)
        </h3>
        <p className="mb-3 text-sm text-ink-400">
          Avaliação manual do dono — não é calculada a partir de nenhum outro dado do sistema. Lance uma
          nota de 0 a 10 a cada ~15 dias pra acompanhar se está subindo ou caindo.
        </p>

        {funcionariosAtivos.length === 0 ? (
          <p className="rounded-xl border border-ink-200 bg-paper-50 p-4 text-sm text-ink-500">
            Cadastre pelo menos um funcionário ativo para lançar uma nota.
          </p>
        ) : (
          <form
            onSubmit={handleRegistrarAvaliacao}
            className="flex flex-wrap items-end gap-3 rounded-xl border border-ink-200 bg-paper-50 p-4"
          >
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
              Funcionário
              <select
                value={avalFuncionarioIdEfetivo}
                onChange={(e) => setAvalFuncionarioId(e.target.value)}
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
              Data
              <input
                type="date"
                value={avalData}
                onChange={(e) => setAvalData(e.target.value)}
                className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
              Nota (0-10)
              <input
                type="text"
                inputMode="decimal"
                value={avalNota}
                onChange={(e) => setAvalNota(e.target.value)}
                placeholder="ex.: 8,5"
                className="w-24 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
              />
            </label>
            <button
              type="submit"
              disabled={salvandoAval}
              className="rounded-lg border border-ink-700 bg-ink-700 px-4 py-2 text-sm font-medium text-paper-100 transition-colors hover:bg-ink-800 disabled:opacity-50"
            >
              {salvandoAval ? "Salvando…" : "Registrar nota"}
            </button>
            {resultadoAval && (
              <p className={`text-sm ${resultadoAval.tipo === "ok" ? "text-emerald-600" : "text-red-600"}`}>
                {resultadoAval.texto}
              </p>
            )}
          </form>
        )}

        {funcionariosComAvaliacao.length > 0 && (
          <div className="mt-4 rounded-xl border border-ink-200 bg-paper-50 p-4">
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-400">
              Ver evolução de
              <select
                value={verHistoricoIdEfetivo}
                onChange={(e) => setVerHistoricoId(e.target.value)}
                className="w-48 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700"
              >
                {funcionariosComAvaliacao.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-3 h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicoSelecionado} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-ink-100)" />
                  <XAxis
                    dataKey="data"
                    tick={{ fontSize: 12, fill: "var(--color-ink-700)" }}
                    axisLine={{ stroke: "var(--color-ink-200)" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fontSize: 11, fill: "var(--color-ink-400)" }}
                    axisLine={{ stroke: "var(--color-ink-200)" }}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--color-ink-200)", fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="nota"
                    name="Nota"
                    stroke="var(--color-brass-700)"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
