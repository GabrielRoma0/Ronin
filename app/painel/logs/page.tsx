import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessao } from "@/lib/auth";
import { AppShell } from "@/components/ui/AppShell";
import { listarLogsAcesso, type CursorLogsAcesso } from "@/lib/data/auditoria";
import { formatDataHora } from "@/lib/format";

/** Cursor cabe inteiro num único parâmetro de URL: "<created_at>|<id>". */
function decodificarCursor(valor: string | undefined): CursorLogsAcesso | undefined {
  if (!valor) return undefined;
  const [createdAt, id] = valor.split("|");
  if (!createdAt || !id) return undefined;
  return { createdAt, id };
}

function codificarCursor(cursor: CursorLogsAcesso): string {
  return `${cursor.createdAt}|${cursor.id}`;
}

export default async function PainelLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ antes?: string }>;
}) {
  const sessao = await getSessao();
  if (!sessao || sessao.role !== "dono") redirect("/");

  const { antes } = await searchParams;
  const cursorAtual = decodificarCursor(antes);
  const { itens: logs, proximoCursor } = await listarLogsAcesso({ antesDe: cursorAtual });

  return (
    <AppShell sessaoLabel={`Sessão: ${sessao.username ?? "dono"}`} role="dono">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brass-700">
            Segurança e conformidade
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">Log de acesso</h1>
          <p className="mt-1 text-sm text-ink-400">
            Registro de quem acessou o relatório ou lançou dados — só quem tem acesso total vê esta
            tela. {logs.length} acesso{logs.length === 1 ? "" : "s"} nesta página
            {cursorAtual ? " (mais antigos)" : " (mais recentes)"}.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-ink-200">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-400">
                <th scope="col" className="px-4 py-2.5 font-medium">Quando</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Quem</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-2.5 text-ink-500">{formatDataHora(log.createdAt)}</td>
                  <td className="px-4 py-2.5 text-ink-700">{log.usuario ?? "—"}</td>
                  <td className="px-4 py-2.5 text-ink-500">{log.acao}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-ink-300">
                    {cursorAtual ? "Nenhum acesso mais antigo que esse." : "Nenhum acesso registrado ainda."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm">
          {cursorAtual ? (
            <Link
              href="/painel/logs"
              className="text-ink-400 underline-offset-2 hover:text-ink-700 hover:underline"
            >
              ← Página mais recente
            </Link>
          ) : (
            <span />
          )}
          {proximoCursor && (
            <Link
              href={`/painel/logs?antes=${encodeURIComponent(codificarCursor(proximoCursor))}`}
              className="text-ink-400 underline-offset-2 hover:text-ink-700 hover:underline"
            >
              Acessos mais antigos →
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
