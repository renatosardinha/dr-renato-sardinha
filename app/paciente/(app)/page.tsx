import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Feed() {
  const supabase = createClient();
  const { data: posts } = await supabase.from('posts')
    .select('id, titulo, corpo, midia_path, publicado_em').eq('publicado', true)
    .order('publicado_em', { ascending: false }).limit(30);

  const feed = await Promise.all(
    (posts ?? []).map(async (p) => {
      if (!p.midia_path) return { ...p, imagem: undefined as string | undefined };
      const { data } = await supabase.storage.from('feed').createSignedUrl(p.midia_path, 3600);
      return { ...p, imagem: data?.signedUrl };
    })
  );

  return (
    <section>
      <h1 className="font-display text-display-sm">Feed</h1>
      {feed.length === 0 ? (
        <p className="mt-4 text-ash">Ainda não há publicações.</p>
      ) : (
        <div className="mt-6 space-y-6">
          {feed.map((p) => (
            <article key={p.id} className="border border-mist bg-ivory p-5">
              {p.imagem && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imagem} alt="" className="mb-4 w-full" loading="lazy" />
              )}
              <h2 className="font-display text-lg">{p.titulo}</h2>
              {p.corpo && <p className="mt-2 whitespace-pre-line text-graphite">{p.corpo}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
