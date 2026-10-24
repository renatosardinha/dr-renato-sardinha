import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { videoEmbedUrl } from '@/lib/video';

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

  return (
    <article>
      <Link href="/paciente" className="text-sm underline text-ash">← Voltar ao feed</Link>
      <h1 className="mt-4 font-display text-display-sm">{p.titulo}</h1>
      <p className="mt-1 text-sm text-ash">{new Date(p.publicado_em).toLocaleDateString('pt-BR')}</p>

      {embed && (
        <div className="mt-6 aspect-video w-full bg-ink">
          <iframe src={embed} title={p.titulo} className="h-full w-full" loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        </div>
      )}
      {!embed && imagem && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imagem} alt="" className="mt-6 w-full" />
      )}
      {p.corpo && <p className="mt-6 whitespace-pre-line leading-relaxed text-graphite">{p.corpo}</p>}
    </article>
  );
}
