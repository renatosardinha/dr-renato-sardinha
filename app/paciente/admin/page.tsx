import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function VisaoGeral() {
  const supabase = createClient();
  const [p, d, f] = await Promise.all([
    supabase.from('patients').select('id', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('documents').select('id', { count: 'exact', head: true }),
    supabase.from('posts').select('id', { count: 'exact', head: true }),
  ]);
  const cartoes = [
    { n: p.count ?? 0, t: 'Pacientes ativos', href: '/paciente/admin/pacientes' },
    { n: d.count ?? 0, t: 'Documentos enviados', href: '/paciente/admin/pacientes' },
    { n: f.count ?? 0, t: 'Publicações no feed', href: '/paciente/admin/publicacoes' },
  ];
  return (
    <section>
      <h1 className="font-display text-display-sm">Visão geral</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cartoes.map((c) => (
          <Link key={c.t} href={c.href} className="border border-mist bg-ivory p-5 hover:border-terracotta">
            <p className="font-display text-3xl">{c.n}</p>
            <p className="mt-1 text-sm text-graphite">{c.t}</p>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-sm text-ash">
        Para enviar uma bioimpedância, abra o paciente em <b>Pacientes</b> e use “Enviar documento”.
      </p>
    </section>
  );
}
