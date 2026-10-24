import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const ROTULO: Record<string, string> = { texto: 'Texto', imagem: 'Imagem', video: 'Vídeo' };

function resumo(t: string | null) {
  if (!t) return '';
  const limpo = t.replace(/\s+/g, ' ').trim();
  return limpo.length > 110 ? limpo.slice(0, 110).trimEnd() + '…' : limpo;
}

export default async function Feed() {
  const supabase = createClient();
  const { data: posts } = await supabase.from('posts')
    .select('id, titulo, corpo, tipo, midia_path, publicado_em').eq('publicado', true)
    .order('publicado_em', { ascending: false }).limit(60);

  const feed = await Promise.all(
    (posts ?? []).map(async (p) => {
      if (!p.midia_path) return { ...p, capa: undefined as string | undefined };
      const { data } = await supabase.storage.from('feed').createSignedUrl(p.midia_path, 3600);
      return { ...p, capa: data?.signedUrl };
    })
  );

  return (
    <section>
      <h1 className="font-display text-display-sm">Feed</h1>
      {feed.length === 0 ? (
        <p className="mt-4 text-ash">Ainda não há publicações.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {feed.map((p) => (
            <Link key={p.id} href={`/paciente/post/${p.id}`}
              className="group block border border-mist bg-ivory transition hover:border-terracotta">
              <div className="relative aspect-square overflow-hidden bg-sand">
                {p.capa ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.capa} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center p-4 text-center text-sm text-umber">
                    {p.tipo === 'video' ? '▶' : resumo(p.corpo) || p.titulo}
                  </div>
                )}
                {p.tipo === 'video' && p.capa && (
                  <span className="absolute inset-0 flex items-center justify-center text-4xl text-ivory/90">▶</span>
                )}
                <span className="absolute left-2 top-2 bg-ink/80 px-2 py-0.5 text-xs text-ivory">
                  {ROTULO[p.tipo] ?? 'Texto'}
                </span>
              </div>
              <div className="p-3">
                <h2 className="font-display text-base leading-snug">{p.titulo}</h2>
                <p className="mt-1 text-xs text-ash">{new Date(p.publicado_em).toLocaleDateString('pt-BR')}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
