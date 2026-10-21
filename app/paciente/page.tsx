import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const TIPO: Record<string, string> = {
  bioimpedancia: 'Bioimpedância', receita: 'Receita', exame: 'Exame', outro: 'Documento',
};

export default async function PacienteHome() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: paciente } = await supabase.from('patients').select('id, nome').maybeSingle();
  const { data: admin } = await supabase.rpc('is_admin');

  if (!paciente && !admin) {
    return (
      <main className="mx-auto max-w-prose px-6 py-24">
        <h1 className="font-display text-display-sm">Acesso não liberado</h1>
        <p className="mt-3 text-graphite">
          O e-mail {user?.email} não está ativo na clínica. Fale com a recepção.
        </p>
        <Sair />
      </main>
    );
  }

  const [{ data: posts }, { data: docs }] = await Promise.all([
    supabase.from('posts').select('id, titulo, corpo, publicado_em').eq('publicado', true)
      .order('publicado_em', { ascending: false }).limit(30),
    supabase.from('documents').select('id, tipo, titulo, storage_path, data_documento')
      .order('created_at', { ascending: false }),
  ]);

  const links = await Promise.all(
    (docs ?? []).map(async (d) => {
      const { data } = await supabase.storage.from('documentos').createSignedUrl(d.storage_path, 300);
      return { ...d, url: data?.signedUrl };
    })
  );

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-eyebrow uppercase tracking-editorial text-terracotta">Clínica RS</p>
          <h1 className="mt-2 font-display text-display-sm">
            Olá{paciente ? `, ${paciente.nome.split(' ')[0]}` : ''}
          </h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          {admin && <a href="/paciente/admin" className="text-sm underline text-terracotta">Painel admin</a>}
          <Sair />
        </div>
      </header>

      <section className="mt-12">
        <h2 className="font-display text-xl">Meus documentos</h2>
        {links.length === 0 ? (
          <p className="mt-3 text-ash">Nenhum documento disponível ainda.</p>
        ) : (
          <ul className="mt-4 divide-y divide-mist border-y border-mist">
            {links.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-3">
                <span>
                  <span className="text-ash text-sm">{TIPO[d.tipo] ?? 'Documento'}</span><br />
                  {d.titulo}
                </span>
                {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer"
                  className="text-sm underline text-terracotta">Abrir</a>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-14">
        <h2 className="font-display text-xl">Novidades</h2>
        {(posts ?? []).length === 0 ? (
          <p className="mt-3 text-ash">Ainda não há publicações.</p>
        ) : (
          <div className="mt-4 space-y-6">
            {posts!.map((p) => (
              <article key={p.id} className="border border-mist bg-ivory p-5">
                <h3 className="font-display text-lg">{p.titulo}</h3>
                {p.corpo && <p className="mt-2 whitespace-pre-line text-graphite">{p.corpo}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Sair() {
  return (
    <form action="/paciente/sair" method="post">
      <button className="text-sm text-ash underline">Sair</button>
    </form>
  );
}
