import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { AppShell } from "@/components/ui/AppShell";
import { listarLogsAcesso } from "@/lib/data/auditoria";
import { formatDataHora } from "@/lib/format";

export default async function PainelLogsPage() {
  const sessao = await getSessao();
  if (!sessao || sessao.role !== "dono") redirect("/");

  const logs = await listarLogsAcesso();

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
            tela. Últimos {logs.length} acesso{logs.length === 1 ? "" : "s"}.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-ink-200">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-4 py-2.5 font-medium">Quando</th>
                <th className="px-4 py-2.5 font-medium">Quem</th>
                <th className="px-4 py-2.5 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-2.5 text-ink-500">{formatDataHora(log.createdAt)}</td>
                  <td className="px-4 py-2.5 text-ink-700">{log.userEmail ?? "—"}</td>
                  <td className="px-4 py-2.5 text-ink-500">{log.acao}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-ink-300">
                    Nenhum acesso registrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
