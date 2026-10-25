import { createClient } from '@/lib/supabase/server';
import { FeedLista, type ItemFeed } from '@/components/paciente/FeedLista';

export const dynamic = 'force-dynamic';

const sem = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default async function Feed() {
  const supabase = createClient();
  const { data: posts } = await supabase.from('posts')
    .select('id, titulo, corpo, tipo, publicado_em').eq('publicado', true)
    .order('publicado_em', { ascending: false }).limit(200);

  const itens: ItemFeed[] = (posts ?? []).map((p) => ({
    id: p.id,
    titulo: p.titulo,
    data: p.publicado_em,
    video: p.tipo === 'video',
    busca: sem(`${p.titulo} ${p.corpo ?? ''}`),
  }));

  return (
    <section>
      <h1 className="sr-only">Publicações</h1>
      {itens.length === 0
        ? <p className="rounded-[18px] border border-mist bg-ivory p-6 text-ash">Ainda não há publicações.</p>
        : <FeedLista itens={itens} />}
    </section>
  );
}
