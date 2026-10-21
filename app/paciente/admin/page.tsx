import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { criarPaciente, enviarDocumento, publicarPost, removerPost } from './actions';

export const dynamic = 'force-dynamic';

const campo = 'w-full border border-mist bg-ivory px-3 py-2 text-base outline-none focus:border-terracotta';
const botao = 'bg-ink text-ivory px-5 py-2 text-sm tracking-wide';
const rotulo = 'block text-sm text-graphite mb-1';

export default async function Admin({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const supabase = createClient();
  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) redirect('/paciente');

  const [{ data: pacientes }, { data: posts }] = await Promise.all([
    supabase.from('patients').select('id, nome, email, ativo').order('nome'),
    supabase.from('posts').select('id, titulo, publicado_em').order('publicado_em', { ascending: false }).limit(10),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <a href="/paciente" className="text-sm underline text-ash">← Voltar</a>
      <h1 className="mt-4 font-display text-display-sm">Painel da clínica</h1>

      {searchParams.ok && <p className="mt-4 border border-mist bg-ivory p-3 text-sm" role="status">{searchParams.ok}</p>}
      {searchParams.erro && <p className="mt-4 border border-terracotta p-3 text-sm text-terracotta" role="alert">{searchParams.erro}</p>}

      <section className="mt-10">
        <h2 className="font-display text-xl">1. Cadastrar paciente</h2>
        <form action={criarPaciente} className="mt-4 space-y-3">
          <div><label className={rotulo}>Nome completo</label><input name="nome" required className={campo} /></div>
          <div><label className={rotulo}>E-mail (o código de acesso chega aqui)</label><input name="email" type="email" required className={campo} /></div>
          <div><label className={rotulo}>Celular (opcional)</label><input name="celular" className={campo} /></div>
          <label className="flex items-start gap-2 text-sm text-graphite">
            <input type="checkbox" name="consentimento" className="mt-1" />
            O paciente consentiu com o uso da área do paciente e o tratamento dos seus dados (LGPD).
          </label>
          <button className={botao}>Cadastrar</button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl">2. Enviar documento a um paciente</h2>
        <form action={enviarDocumento} className="mt-4 space-y-3">
          <div>
            <label className={rotulo}>Paciente</label>
            <select name="patient_id" required className={campo} defaultValue="">
              <option value="" disabled>Escolha…</option>
              {(pacientes ?? []).map((p) => <option key={p.id} value={p.id}>{p.nome} — {p.email}</option>)}
            </select>
          </div>
          <div>
            <label className={rotulo}>Tipo</label>
            <select name="tipo" className={campo}>
              <option value="bioimpedancia">Bioimpedância</option>
              <option value="receita">Receita</option>
              <option value="exame">Exame</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div><label className={rotulo}>Título (ex.: Bioimpedância — out/2026)</label><input name="titulo" required className={campo} /></div>
          <div><label className={rotulo}>Data do documento (opcional)</label><input name="data_documento" type="date" className={campo} /></div>
          <div><label className={rotulo}>Arquivo (PDF, JPG ou PNG, até 4 MB)</label>
            <input name="arquivo" type="file" accept="application/pdf,image/jpeg,image/png" required className="text-sm" /></div>
          <button className={botao}>Enviar</button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl">3. Publicar no feed</h2>
        <form action={publicarPost} className="mt-4 space-y-3">
          <div><label className={rotulo}>Título</label><input name="titulo" required className={campo} /></div>
          <div><label className={rotulo}>Texto</label><textarea name="corpo" rows={6} className={campo} /></div>
          <div><label className={rotulo}>Imagem (opcional — JPG, PNG ou WebP, até 4 MB)</label>
            <input name="imagem" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" /></div>
          <button className={botao}>Publicar</button>
        </form>
        {(posts ?? []).length > 0 && (
          <ul className="mt-6 divide-y divide-mist border-y border-mist">
            {posts!.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                <span>{p.titulo}</span>
                <form action={removerPost}><input type="hidden" name="id" value={p.id} />
                  <button className="underline text-ash">Remover</button></form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl">Pacientes cadastrados ({(pacientes ?? []).length})</h2>
        <ul className="mt-3 text-sm text-graphite">
          {(pacientes ?? []).map((p) => <li key={p.id}>{p.nome} — {p.email}</li>)}
        </ul>
      </section>
    </main>
  );
}
