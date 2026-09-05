"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { SANTO_GALO_ID } from "@/data/seed";

export type Role = "admin" | "cliente";

export interface Sessao {
  role: Role;
  /** Só existe para role "cliente" — é a única fonte de empresaId do lado cliente. */
  empresaId: string | null;
  nomeExibicao: string;
}

interface SessaoContextValue {
  sessao: Sessao | null;
  pronto: boolean;
  entrarComoAdmin: () => void;
  entrarComoCliente: () => void;
  sair: () => void;
}

const STORAGE_KEY = "ronin-demo-sessao";

const SessaoContext = createContext<SessaoContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    // Hidratação única a partir do localStorage no mount do cliente — não há
    // como evitar o setState síncrono aqui sem reintroduzir mismatch de SSR
    // (o servidor nunca tem acesso a localStorage).
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setSessao(JSON.parse(raw));
    } catch {
      // localStorage indisponível (ex.: navegação privada) — segue deslogado.
    }
    setPronto(true);
  }, []);

  const persistir = useCallback((s: Sessao | null) => {
    setSessao(s);
    try {
      if (s) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // sem storage, mantém só em memória
    }
  }, []);

  const entrarComoAdmin = useCallback(() => {
    persistir({ role: "admin", empresaId: null, nomeExibicao: "Ronin" });
  }, [persistir]);

  const entrarComoCliente = useCallback(() => {
    // Único credencial de cliente desta demo. O empresaId nasce aqui, no
    // momento do login — nenhuma tela de cliente lê empresaId de outro lugar.
    persistir({ role: "cliente", empresaId: SANTO_GALO_ID, nomeExibicao: "Santo Galo Marmitas" });
  }, [persistir]);

  const sair = useCallback(() => persistir(null), [persistir]);

  return (
    <SessaoContext.Provider value={{ sessao, pronto, entrarComoAdmin, entrarComoCliente, sair }}>
      {children}
    </SessaoContext.Provider>
  );
}

export function useSessao(): SessaoContextValue {
  const ctx = useContext(SessaoContext);
  if (!ctx) throw new Error("useSessao precisa estar dentro de <AuthProvider>");
  return ctx;
}
