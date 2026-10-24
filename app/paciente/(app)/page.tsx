import Link from 'next/link';
import { Play } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PostCabecalho } from '@/components/paciente/PostCabecalho';
import { LikeButton } from '@/components/paciente/LikeButton';

export const dynamic = 'force-dynamic';

export default async function Feed() {
  const supabase = createClient();
  const { data: posts } = await supabase.from('posts')
    .select('id, titulo, corpo, tipo, midia_path, publicado_em').eq('publicado', true)
    .order('publicado_em', { ascending: false }).limit(60);

  // Curtidas: se a função ainda não existir no banco, o feed funciona normalmente, só sem o botão.
  const { data: contagens, error: erroCurtidas } = await supabase.rpc('curtidas_posts');
  const curtidas = new Map<string, { total: number; curti: boolean }>(
    (contagens ?? []).map((c: { post_id: string; total: number; curti: boolean }) => [c.post_id, { total: Number(c.total), curti: c.curti }])
  );
  const { data: pid } = await supabase.rpc('current_patient_id');
  const podeCurtir = !erroCurtidas && !!pid;

  const feed = await Promise.all(
    (posts ?? []).map(async (p) => {
      if (!p.midia_path) return { ...p, capa: undefined as string | undefined };
      const { data } = await supabase.storage.from('feed').createSignedUrl(p.midia_path, 3600);
      return { ...p, capa: data?.signedUrl };
    })
  );

  return (
    <section>
      <h1 className="sr-only">Feed</h1>
      {feed.length === 0 ? (
        <p className="rounded-[18px] border border-mist bg-ivory p-6 text-ash">Ainda não há publicações.</p>
      ) : (
        <div className="space-y-3">
          {feed.map((p) => {
            const c = curtidas.get(p.id);
            return (
              <article key={p.id} className="rounded-[18px] border border-mist bg-ivory px-4 pb-2 pt-3">
                <PostCabecalho data={p.publicado_em} />
                <Link href={`/paciente/post/${p.id}`} className="mt-3 block">
                  <h2 className="font-display text-xl leading-snug">{p.titulo}</h2>
                  {p.corpo && <p className="mt-1.5 line-clamp-5 whitespace-pre-line text-[15px] leading-relaxed text-graphite">{p.corpo}</p>}
                  {p.capa ? (
                    <div className="relative mt-3 overflow-hidden rounded-lg border border-mist">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.capa} alt="" loading="lazy" className="max-h-[480px] w-full object-cover" />
                      {p.tipo === 'video' && (
                        <span className="absolute inset-0 flex items-center justify-center bg-ink/20">
                          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ivory/90"><Play className="h-6 w-6 fill-ink stroke-ink" /></span>
                        </span>
                      )}
                    </div>
                  ) : p.tipo === 'video' ? (
                    <div className="mt-3 flex items-center gap-3 rounded-lg border border-mist bg-sand px-4 py-5 text-sm font-semibold text-umber">
                      <Play className="h-5 w-5 fill-umber stroke-umber" /> Assistir ao vídeo
                    </div>
                  ) : null}
                </Link>
                <div className="mt-1 flex items-center justify-between">
                  {podeCurtir ? <LikeButton postId={p.id} total={c?.total ?? 0} curtiu={c?.curti ?? false} /> : <span />}
                  <Link href={`/paciente/post/${p.id}`} className="text-sm font-semibold text-terracotta-deep">Abrir</Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
