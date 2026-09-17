import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ROTAS_PROTEGIDAS = ["/painel", "/caixa", "/conta"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Com Fluid compute, não guarde esse cliente numa variável global — crie
  // um novo a cada requisição.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Não rode nada entre createServerClient e getClaims() — um erro aqui
  // pode deslogar usuários aleatoriamente sem motivo aparente.
  const { data } = await supabase.auth.getClaims();
  const usuario = data?.claims;

  const rotaProtegida = ROTAS_PROTEGIDAS.some((rota) => request.nextUrl.pathname.startsWith(rota));

  if (!usuario && rotaProtegida) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Sempre devolver supabaseResponse como está (com os cookies já copiados),
  // nunca criar uma resposta nova sem repassar os cookies da sessão.
  return supabaseResponse;
}
