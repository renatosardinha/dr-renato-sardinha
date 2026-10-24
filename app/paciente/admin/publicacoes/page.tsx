import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { publicarPost, removerPost } from '../actions';
import { Avisos } from '@/components/paciente/Avisos';
import { campo, botao, rotulo } from '@/components/paciente/ui';

export const dynamic = 'force-dynamic';

export default async function Publicacoes({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const supabase = createClient();
  const { data: posts } = await supabase.from('posts')
    .select('id, titulo, tipo, publicado, publicado_em').order('publicado_em', { ascending: false }).limit(50);

  return (
    <section>
      <h1 className="font-display text-display-sm">Publicações</h1>
      <div className="mt-4"><Avisos ok={searchParams.ok} erro={searchParams.erro} /></div>

      <h2 className="mt-2 font-display text-xl">Nova publicação</h2>
      <form action={publicarPost} className="mt-3 space-y-3">
        <div><label className={rotulo}>Título</label><input name="titulo" required className={campo} /></div>
        <div><label className={rotulo}>Texto</label><textarea name="corpo" rows={8} className={campo} /></div>
        <div><label className={rotulo}>Imagem de capa (opcional — JPG, PNG ou WebP, até 4 MB)</label>
          <input name="imagem" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" /></div>
        <div>
          <label className={rotulo}>Link do vídeo (opcional)</label>
          <input name="video_url" type="url" placeholder="https://vimeo.com/… ou link do Bunny/YouTube" className={campo} />
          <p className="mt-1 text-xs text-ash">
            Atenção: vídeo “não listado” do YouTube não é privado — quem tiver o link assiste. Para conteúdo exclusivo, use Vimeo ou Bunny Stream.
          </p>
        </div>
        <button className={botao}>Publicar no feed</button>
      </form>

      <h2 className="mt-12 font-display text-xl">Já publicadas ({(posts ?? []).length})</h2>
      <ul className="mt-3 divide-y divide-mist border-y border-mist">
        {(posts ?? []).map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
            <Link href={`/paciente/admin/publicacoes/${p.id}`} className="flex-1 hover:underline">
              {p.titulo}<br />
              <span className="text-ash">
                {new Date(p.publicado_em).toLocaleDateString('pt-BR')}
                {p.tipo === 'imagem' ? ' · imagem' : p.tipo === 'video' ? ' · vídeo' : ''}
                {!p.publicado ? ' · rascunho (oculto)' : ''}
              </span>
            </Link>
            <Link href={`/paciente/admin/publicacoes/${p.id}`} className="underline text-terracotta">Editar</Link>
            <form action={removerPost}><input type="hidden" name="id" value={p.id} /><button className="underline text-ash">Remover</button></form>
          </li>
        ))}
        {(posts ?? []).length === 0 && <li className="py-4 text-ash">Nenhuma publicação ainda.</li>}
      </ul>
    </section>
  );
}
