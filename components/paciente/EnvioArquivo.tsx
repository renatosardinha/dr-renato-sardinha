'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { campo, botao, rotulo } from '@/components/paciente/ui';

const MAX_BYTES = 10 * 1024 * 1024;
const TIPOS_OK = ['application/pdf', 'image/jpeg', 'image/png'];

/** Reduz fotos grandes (celular) antes de enviar: mais rápido e ocupa menos espaço. */
async function reduzirImagem(arquivo: File): Promise<Blob> {
  if (!arquivo.type.startsWith('image/') || arquivo.size < 1.5 * 1024 * 1024) return arquivo;
  try {
    const bmp = await createImageBitmap(arquivo);
    const escala = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * escala);
    canvas.height = Math.round(bmp.height * escala);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.82));
    return blob && blob.size < arquivo.size ? blob : arquivo;
  } catch {
    return arquivo;
  }
}

export function EnvioArquivo({ pacienteId }: { pacienteId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const arquivo = fd.get('arquivo');
    const tipo = String(fd.get('tipo') ?? 'exame');
    const observacao = String(fd.get('observacao') ?? '').trim().slice(0, 300) || null;

    if (!(arquivo instanceof File) || arquivo.size === 0) return setMsg({ tipo: 'erro', texto: 'Escolha um arquivo.' });
    if (!TIPOS_OK.includes(arquivo.type)) return setMsg({ tipo: 'erro', texto: 'Use PDF, JPG ou PNG.' });
    if (arquivo.size > 30 * 1024 * 1024) return setMsg({ tipo: 'erro', texto: 'Arquivo muito grande. O limite é 10 MB.' });

    setEnviando(true);
    try {
      const final = await reduzirImagem(arquivo);
      if (final.size > MAX_BYTES) {
        setMsg({ tipo: 'erro', texto: 'Arquivo acima de 10 MB. Envie uma versão menor.' });
        return;
      }
      const ext = final.type === 'application/pdf' ? 'pdf' : final.type === 'image/png' ? 'png' : 'jpg';
      const caminho = `${pacienteId}/enviados/${crypto.randomUUID()}.${ext}`;
      const supabase = createClient();

      const { error: erroUp } = await supabase.storage.from('documentos')
        .upload(caminho, final, { contentType: final.type, upsert: false });
      if (erroUp) {
        setMsg({ tipo: 'erro', texto: 'Não consegui enviar agora. Você pode enviar até 10 arquivos por dia. Tente de novo ou fale com a clínica.' });
        return;
      }
      const { error: erroDb } = await supabase.from('patient_uploads').insert({
        patient_id: pacienteId, tipo, nome_arquivo: arquivo.name.slice(0, 120), observacao,
        storage_path: caminho, tamanho: final.size,
      });
      if (erroDb) {
        await supabase.storage.from('documentos').remove([caminho]);
        setMsg({ tipo: 'erro', texto: 'Não consegui registrar o envio. Tente de novo.' });
        return;
      }
      formRef.current?.reset();
      setMsg({ tipo: 'ok', texto: 'Arquivo enviado. A equipe da clínica poderá ver.' });
      router.refresh();
    } catch {
      setMsg({ tipo: 'erro', texto: 'Algo deu errado no envio. Tente de novo.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={enviar} className="mt-3 space-y-3 rounded-[18px] border border-mist bg-ivory p-4">
      <div>
        <label className={rotulo} htmlFor="env-tipo">Tipo</label>
        <select id="env-tipo" name="tipo" className={campo} defaultValue="exame">
          <option value="exame">Exame</option>
          <option value="bioimpedancia">Bioimpedância</option>
          <option value="receita">Receita</option>
          <option value="outro">Outro</option>
        </select>
      </div>
      <div>
        <label className={rotulo} htmlFor="env-arquivo">Arquivo (PDF, JPG ou PNG, até 10 MB)</label>
        <input id="env-arquivo" name="arquivo" type="file" accept="application/pdf,image/jpeg,image/png" required className="text-sm" />
      </div>
      <div>
        <label className={rotulo} htmlFor="env-obs">Observação (opcional)</label>
        <input id="env-obs" name="observacao" maxLength={300} placeholder="Ex.: exames de outubro" className={campo} />
      </div>
      <button disabled={enviando} className={`${botao} disabled:opacity-60`}>{enviando ? 'Enviando...' : 'Enviar arquivo'}</button>
      <p role="status" aria-live="polite" className={`text-sm ${msg?.tipo === 'erro' ? 'text-red-700' : 'text-graphite'}`}>{msg?.texto}</p>
      <p className="text-xs text-ash">
        A equipe da clínica pode ver o que você enviar aqui. Esse envio não é acompanhado em tempo real:
        em caso de urgência, ligue para a clínica ou procure atendimento.
      </p>
    </form>
  );
}
