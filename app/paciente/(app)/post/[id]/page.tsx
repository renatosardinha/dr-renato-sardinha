import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { videoEmbedUrl } from '@/lib/video';
import { PostCabecalho } from '@/components/paciente/PostCabecalho';
import { LikeButton } from '@/components/paciente/LikeButton';

export const dynamic = 'force-dynamic';

export default async function Post({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: p } = await supabase.from('posts')
    .select('id, titulo, corpo, video_url, midia_path, publicado_em').eq('id', params.id).eq('publicado', true).maybeSingle();
  if (!p) notFound();

  let imagem: string | undefined;
  if (p.midia_path) {
    const { data } = await supabase.storage.from('feed').createSignedUrl(p.midia_path, 3600);
    imagem = data?.signedUrl;
  }
  const embed = videoEmbedUrl(p.video_url);

  const { data: contagens, error: erroCurtidas } = await supabase.rpc('curtidas_posts');
  const c = (contagens ?? []).find((x: { post_id: string }) => x.post_id === p.id) as { total: number; curti: boolean } | undefined;
  const { data: pid } = await supabase.rpc('current_patient_id');
  const podeCurtir = !erroCurtidas && !!pid;
  // Conta a abertura (uma vez por visita); se a função ainda não existir no banco, segue sem registrar.
  if (pid) await supabase.rpc('registrar_abertura', { p_post: p.id });

  return (
    <article>
      <Link href="/paciente" className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-graphite">
        <ArrowLeft className="h-4 w-4" /> Voltar ao feed
      </Link>
      <div className="rounded-[18px] border border-mist bg-ivory px-4 pb-2 pt-3">
        <PostCabecalho data={p.publicado_em} />
        <h1 className="mt-3 font-display text-2xl leading-snug">{p.titulo}</h1>
        {p.corpo && <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-graphite">{p.corpo}</p>}

        {embed && (
          <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg border border-mist bg-ink">
            <iframe src={embed} title={p.titulo} className="h-full w-full" loading="lazy"
              allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          </div>
        )}
        {!embed && imagem && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagem} alt="" className="mt-4 w-full rounded-lg border border-mist" />
        )}
        <div className="mt-2">{podeCurtir && <LikeButton postId={p.id} total={c ? Number(c.total) : 0} curtiu={c?.curti ?? false} />}</div>
      </div>
    </article>
  );
}
