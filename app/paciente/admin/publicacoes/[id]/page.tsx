import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { atualizarPost, removerPost } from '../../actions';
import { Avisos } from '@/components/paciente/Avisos';
import { campo, botao, rotulo } from '@/components/paciente/ui';

export const dynamic = 'force-dynamic';

export default async function EditarPublicacao({ params, searchParams }: {
  params: { id: string }; searchParams: { ok?: string; erro?: string };
}) {
  const supabase = createClient();
  const { data: p } = await supabase.from('posts')
    .select('id, titulo, corpo, video_url, midia_path, publicado, publicado_em').eq('id', params.id).maybeSingle();
  if (!p) notFound();

  let imagem: string | undefined;
  if (p.midia_path) {
    const { data } = await supabase.storage.from('feed').createSignedUrl(p.midia_path, 600);
    imagem = data?.signedUrl;
  }

  return (
    <section>
      <Link href="/paciente/admin/publicacoes" className="text-sm underline text-ash">← Publicações</Link>
      <h1 className="mt-3 font-display text-display-sm">Editar publicação</h1>
      <div className="mt-4"><Avisos ok={searchParams.ok} erro={searchParams.erro} /></div>

      <form action={atualizarPost} className="mt-2 space-y-4">
        <input type="hidden" name="id" value={p.id} />
        <div><label className={rotulo}>Título</label><input name="titulo" defaultValue={p.titulo} required className={campo} /></div>
        <div><label className={rotulo}>Texto</label><textarea name="corpo" rows={12} defaultValue={p.corpo ?? ''} className={campo} /></div>

        <div>
          <label className={rotulo}>Imagem de capa</label>
          {imagem ? (
            <div className="mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagem} alt="" className="max-h-56 border border-mist" />
              <label className="mt-2 flex items-center gap-2 text-sm text-graphite">
                <input type="checkbox" name="remover_imagem" /> Remover esta imagem
              </label>
            </div>
          ) : <p className="mb-2 text-sm text-ash">Sem imagem.</p>}
          <input name="imagem" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
          <p className="mt-1 text-xs text-ash">{imagem ? 'Escolher um arquivo substitui a imagem atual.' : 'JPG, PNG ou WebP, até 4 MB.'}</p>
        </div>

        <div>
          <label className={rotulo}>Link do vídeo (opcional)</label>
          <input name="video_url" type="url" defaultValue={p.video_url ?? ''} placeholder="https://vimeo.com/…" className={campo} />
        </div>

        <label className="flex items-center gap-2 text-sm text-graphite">
          <input type="checkbox" name="publicado" defaultChecked={p.publicado} />
          Visível no feed (desmarque para guardar como rascunho)
        </label>

        <div className="flex items-center gap-4">
          <button className={botao}>Salvar alterações</button>
          <Link href="/paciente/admin/publicacoes" className="text-sm underline text-ash">Cancelar</Link>
        </div>
      </form>

      <form action={removerPost} className="mt-10 border-t border-mist pt-6">
        <input type="hidden" name="id" value={p.id} />
        <button className="text-sm underline text-terracotta">Remover esta publicação</button>
      </form>
    </section>
  );
}
