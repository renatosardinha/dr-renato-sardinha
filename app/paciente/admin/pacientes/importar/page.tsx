import Link from 'next/link';
import { ImportarForm } from './ImportarForm';

export const dynamic = 'force-dynamic';

export default function Importar() {
  return (
    <section>
      <Link href="/paciente/admin/pacientes" className="text-sm text-ash">← Pacientes</Link>
      <h1 className="mt-2 font-display text-display-sm">Importar planilha</h1>
      <p className="mt-2 text-sm text-graphite">
        Envie o arquivo <strong>.csv</strong> exportado do GestãoDS (no Excel: Arquivo → Salvar como → CSV). O app lê apenas
        <strong> Nome completo</strong>, <strong>Email</strong> e <strong>Celular</strong>; as demais colunas (CPF, endereço etc.) são ignoradas.
        Quem não tem e-mail fica de fora. Nenhum e-mail é enviado aos pacientes.
      </p>
      <ImportarForm />
    </section>
  );
}
