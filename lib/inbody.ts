/**
 * Leitura dos dados que o LookinBody 120 envia pela "API da web" (Integração de dados InBody).
 * O formato exato depende da versão do LookinBody, então a leitura é tolerante:
 * procura os campos pelos códigos da InBody (WT, SMM, BFM, PBF) e por nomes comuns.
 * Tudo o que chega também é guardado bruto, para conferir e ajustar se algo não for reconhecido.
 */

export type LeituraInBody = {
  email: string | null;
  id: string | null;
  medidoEm: string | null; // ISO
  peso: number | null;
  massaMuscular: number | null;
  massaGordura: number | null;
  percentualGordura: number | null;
};

const norm = (k: string) => k.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');

const CHAVES = {
  email: ['email', 'emailaddress', 'useremail', 'memberemail', 'mail'],
  id: ['id', 'userid', 'memberid', 'patientid', 'userkey', 'idnumber'],
  data: ['testdatetimes', 'testdatetime', 'testdate', 'datetimes', 'datetime', 'measuredate', 'measuredatetime', 'date'],
  peso: ['wt', 'weight', 'peso'],
  massaMuscular: ['smm', 'skeletalmusclemass', 'massamuscularesqueletica'],
  massaGordura: ['bfm', 'bodyfatmass', 'massadegordura', 'massagordura'],
  percentualGordura: ['pbf', 'percentbodyfat', 'bodyfatpercentage', 'percentualdegordura', 'percentualgordura'],
} as const;

/** Achata o objeto em pares chave normalizada → valor (o primeiro valor encontrado vence). */
function achatar(v: unknown, saida = new Map<string, unknown>(), prof = 0): Map<string, unknown> {
  if (prof > 6 || v === null || typeof v !== 'object') return saida;
  if (Array.isArray(v)) {
    v.slice(0, 50).forEach((x) => achatar(x, saida, prof + 1));
    return saida;
  }
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    const n = norm(k);
    // Formato "lista de itens": { Name/Code: "WT", Value: "70.5" }
    if ((n === 'name' || n === 'code' || n === 'item' || n === 'key') && typeof val === 'string') {
      const obj = v as Record<string, unknown>;
      const valor = obj.Value ?? obj.value ?? obj.VALUE ?? obj.Val ?? obj.val;
      if (valor !== undefined && !saida.has(norm(val))) saida.set(norm(val), valor);
    }
    if (val !== null && typeof val === 'object') achatar(val, saida, prof + 1);
    else if (!saida.has(n)) saida.set(n, val);
  }
  return saida;
}

function pegar(m: Map<string, unknown>, nomes: readonly string[]): unknown {
  for (const n of nomes) if (m.has(n) && m.get(n) !== '' && m.get(n) !== null) return m.get(n);
  return undefined;
}

function numero(v: unknown, min: number, max: number): number | null {
  if (v === undefined || v === null) return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.').replace(/[^0-9.\-]/g, ''));
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return Math.round(n * 10) / 10;
}

function texto(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, 200) : null;
}

/** Aceita "20261106153000", "2026-11-06 15:30:00", "2026.11.06 15:30" ou ISO. Sem fuso = horário de Brasília. */
export function lerData(v: unknown): string | null {
  const s = texto(v);
  if (!s) return null;
  let so = s.replace(/\D/g, '');
  const br = s.match(/^(\d{2})[./-](\d{2})[./-](\d{4})/); // 06/11/2026
  if (br) so = br[3] + br[2] + br[1] + so.slice(8);
  let iso: string | null = null;
  const temFuso = /\d[T ]\d{2}:\d{2}.*([zZ]|[+-]\d{2}:?\d{2})$/.test(s);
  if (temFuso) {
    iso = s;
  } else if (/^\d{4}/.test(so) && so.length >= 12) {
    const p = so.slice(0, 14).padEnd(14, '0');
    iso = `${p.slice(0, 4)}-${p.slice(4, 6)}-${p.slice(6, 8)}T${p.slice(8, 10)}:${p.slice(10, 12)}:${p.slice(12, 14)}-03:00`;
  } else if (so.length === 8) {
    iso = `${so.slice(0, 4)}-${so.slice(4, 6)}-${so.slice(6, 8)}T12:00:00-03:00`;
  }
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const ano = d.getUTCFullYear();
  return ano >= 2000 && ano <= 2100 ? d.toISOString() : null;
}

const pareceEmail = (s: string | null) => !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export function lerInBody(dados: unknown): LeituraInBody {
  const m = achatar(dados);
  const id = texto(pegar(m, CHAVES.id));
  let email = texto(pegar(m, CHAVES.email));
  if (!pareceEmail(email)) email = pareceEmail(id) ? id : null; // se o e-mail foi digitado no campo ID
  return {
    email: email ? email.toLowerCase() : null,
    id,
    medidoEm: lerData(pegar(m, CHAVES.data)),
    peso: numero(pegar(m, CHAVES.peso), 10, 400),
    massaMuscular: numero(pegar(m, CHAVES.massaMuscular), 1, 150),
    massaGordura: numero(pegar(m, CHAVES.massaGordura), 0, 300),
    percentualGordura: numero(pegar(m, CHAVES.percentualGordura), 1, 80),
  };
}

/** Converte o corpo recebido (JSON, formulário ou texto em Base64) num objeto. */
export function lerCorpo(bruto: string, tipo: string): unknown {
  const tentarJson = (s: string) => { try { return JSON.parse(s); } catch { return undefined; } };
  const t = bruto.trim();
  const json = tentarJson(t);
  if (json !== undefined) return json;
  if (/^[A-Za-z0-9+/=\s]+$/.test(t) && t.length % 4 === 0) {
    const dec = tentarJson(Buffer.from(t, 'base64').toString('utf8').trim());
    if (dec !== undefined) return dec;
  }
  if (tipo.includes('application/x-www-form-urlencoded') || /^[^=&\s]+=[^&]*(&[^=&\s]+=[^&]*)*$/.test(t)) {
    const obj: Record<string, unknown> = {};
    new URLSearchParams(t).forEach((v, k) => { obj[k] = tentarJson(v) ?? v; });
    return obj;
  }
  return { texto: t.slice(0, 100000) };
}
