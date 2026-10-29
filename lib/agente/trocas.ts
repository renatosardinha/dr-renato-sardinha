import { TACO, FONTE_TACO } from './taco';

/**
 * Calculadora de trocas alimentares usada pelo assistente do app.
 * A conta é feita aqui, por código (nunca pelo modelo), para não errar aritmética.
 *
 * Fontes:
 * - Padrões da clínica (Planos Terapêuticos): proteínas por kcal (TBCA, grelhado, 100 g) e
 *   carboidratos por fator em relação ao arroz branco cozido.
 * - Demais alimentos: TACO (NEPA/UNICAMP, 4ª edição, 2011).
 */

type Alimento = {
  id: string;
  nome: string;
  grupo: string;
  kcal: number | null;
  prot: number | null;
  lip: number | null;
  carb: number | null;
  fonte: string;
  clinica?: { tipo: 'prot'; kcal: number } | { tipo: 'carb'; fator: number };
};

const FONTE_CLINICA = 'padrão da clínica (TBCA)';
const ARROZ_KCAL = 128;
const ARROZ_CARB = 28.1;

const CLINICA: Alimento[] = [
  { id: 'c:frango', nome: 'Peito de frango grelhado', grupo: 'Proteína', kcal: 163, prot: 31.5, lip: 3.2, carb: 0, fonte: FONTE_CLINICA, clinica: { tipo: 'prot', kcal: 163 } },
  { id: 'c:patinho', nome: 'Patinho bovino grelhado', grupo: 'Proteína', kcal: 219, prot: 35.9, lip: 7.3, carb: 0, fonte: FONTE_CLINICA, clinica: { tipo: 'prot', kcal: 219 } },
  { id: 'c:tilapia', nome: 'Filé de tilápia grelhado', grupo: 'Proteína', kcal: 128, prot: 26.1, lip: 2.7, carb: 0, fonte: FONTE_CLINICA, clinica: { tipo: 'prot', kcal: 128 } },
  { id: 'c:file-bovino', nome: 'Filé mignon bovino grelhado', grupo: 'Proteína', kcal: 220, prot: 32.8, lip: 9.1, carb: 0, fonte: FONTE_CLINICA, clinica: { tipo: 'prot', kcal: 220 } },
  { id: 'c:suino', nome: 'Lombo ou filé mignon suíno grelhado', grupo: 'Proteína', kcal: 210, prot: 35.7, lip: 6.6, carb: 0, fonte: FONTE_CLINICA, clinica: { tipo: 'prot', kcal: 210 } },
  { id: 'c:arroz', nome: 'Arroz branco cozido', grupo: 'Carboidrato', kcal: ARROZ_KCAL, prot: 2.5, lip: 0.2, carb: ARROZ_CARB, fonte: FONTE_CLINICA, clinica: { tipo: 'carb', fator: 1 } },
  ...([
    ['c:batata-inglesa', 'Batata inglesa cozida', 2.24],
    ['c:mandioca', 'Mandioca cozida', 1.12],
    ['c:batata-doce', 'Batata-doce cozida', 1.4],
    ['c:macarrao', 'Macarrão cozido', 1.2],
  ] as [string, string, number][]).map(([id, nome, fator]): Alimento => ({
    id, nome, grupo: 'Carboidrato', kcal: Math.round(ARROZ_KCAL / fator), prot: null, lip: null,
    carb: Math.round((ARROZ_CARB / fator) * 10) / 10, fonte: `${FONTE_CLINICA}, valores derivados do fator`,
    clinica: { tipo: 'carb', fator },
  })),
];

const BASE: Alimento[] = [
  ...CLINICA,
  ...TACO.map(([n, grupo, nome, kcal, prot, lip, carb]): Alimento => ({
    id: `t:${n}`, nome, grupo, kcal, prot, lip, carb, fonte: FONTE_TACO,
  })),
];
const POR_ID = new Map(BASE.map((a) => [a.id, a]));

const sem = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const PALAVRAS_VAZIAS = new Set(['de', 'da', 'do', 'das', 'dos', 'com', 'e', 'a', 'o', 'em']);
const BUSCA = BASE.map((a) => ({ a, ws: sem(a.nome).split(/[^a-z0-9]+/).filter(Boolean) }));

const resumo = (a: Alimento) => ({
  id: a.id, nome: a.nome, por_100_g: { kcal: a.kcal, proteina_g: a.prot, lipideos_g: a.lip, carboidrato_g: a.carb }, fonte: a.fonte,
});

const palavras = (texto: string) => texto.split(/[^a-z0-9]+/).filter(Boolean);
const igual = (p: string, t: string) => p === t || p === t + 's' || t === p + 's';

export function buscarAlimento(consulta: unknown, filtro?: (a: Alimento) => boolean) {
  const termos = palavras(sem(String(consulta ?? ''))).filter((t) => !PALAVRAS_VAZIAS.has(t));
  if (termos.length === 0) return { ok: false, erro: 'Informe o nome do alimento.' };
  const ordenar = (x: { a: Alimento }, y: { a: Alimento }) =>
    (x.a.clinica ? 0 : 1) - (y.a.clinica ? 0 : 1)
    || (primeira(x.a.nome) === termos[0] ? 0 : 1) - (primeira(y.a.nome) === termos[0] ? 0 : 1)
    || x.a.nome.length - y.a.nome.length;
  // 1ª tentativa: palavras inteiras (evita "maçã" achar "macarrão"). 2ª: começo de palavra.
  let achados = BUSCA.filter(({ ws }) => termos.every((t) => ws.some((p) => igual(p, t)))).sort(ordenar);
  if (achados.length === 0) {
    achados = BUSCA.filter(({ ws }) => termos.every((t) => t.length >= 4 && ws.some((p) => p.startsWith(t)))).sort(ordenar);
  }
  const opcoes = achados.filter(({ a }) => !filtro || filtro(a)).slice(0, 8).map(({ a }) => resumo(a));
  if (opcoes.length === 0) return { ok: false, erro: 'Alimento não encontrado nas tabelas. Não estime: oriente a consultar a tabela de trocas do plano ou falar com a clínica.' };
  return { ok: true, opcoes };
}

const arred5 = (g: number) => Math.max(5, Math.round(g / 5) * 5);
const fmt = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',');
const estado = (nome: string) => (/\bcru|crua\b/.test(sem(nome)) ? 'cru' : 'preparado');
const primeira = (nome: string) => sem(nome).split(/[^a-z0-9]+/)[0];
const tabela = (a: Alimento) => (a.id.startsWith('c:') ? 'clinica' : 'taco');
const funcao = (a: Alimento): 'prot' | 'carb' | 'outro' =>
  (a.prot ?? 0) >= 12 && (a.carb ?? 0) < 5 ? 'prot' : (a.carb ?? 0) >= 10 && (a.prot ?? 0) < 15 ? 'carb' : 'outro';

export type ResultadoTroca =
  | { ok: true; de: { nome: string; gramas: number }; para: { nome: string; gramas_exatas: number; gramas_arredondadas_5g: number };
      criterio: string; conta: string; fontes: string[]; avisos: string[] }
  | { ok: false; erro: string };

export function trocarAlimento(idOrigem: unknown, quantidade: unknown, idDestino: unknown, criterio?: unknown): ResultadoTroca {
  const o = POR_ID.get(String(idOrigem));
  const d = POR_ID.get(String(idDestino));
  const q = Number(quantidade);
  if (!o || !d) return { ok: false, erro: 'Alimento não reconhecido. Use buscar_alimento primeiro e informe os ids.' };
  if (!Number.isFinite(q) || q <= 0 || q > 5000) return { ok: false, erro: 'Quantidade inválida.' };

  const fo = funcao(o), fd = funcao(d);
  if (fo !== 'outro' && fd !== 'outro' && fo !== fd) {
    return { ok: false, erro: 'Troca entre proteína e carboidrato não é feita: a troca é dentro da mesma função na refeição (proteína por proteína, carboidrato por carboidrato). Oriente a seguir o plano ou falar com a clínica.' };
  }
  const avisos: string[] = [];
  let exato: number;
  let conta: string;
  let usado: string;

  if (o.clinica && d.clinica && o.clinica.tipo === 'prot' && d.clinica.tipo === 'prot') {
    exato = (q * o.clinica.kcal) / d.clinica.kcal;
    conta = `${fmt(q)} g x ${o.clinica.kcal} kcal / ${d.clinica.kcal} kcal`;
    usado = 'calorias (padrão da clínica)';
  } else if (o.clinica && d.clinica && o.clinica.tipo === 'carb' && d.clinica.tipo === 'carb') {
    exato = (q * d.clinica.fator) / o.clinica.fator;
    conta = `${fmt(q)} g x ${fmt(d.clinica.fator)} / ${fmt(o.clinica.fator)} (fatores em relação ao arroz)`;
    usado = 'fator da clínica (arroz = 1)';
  } else {
    const porCarb = criterio === 'carboidrato' || criterio === 'calorias'
      ? criterio === 'carboidrato'
      : (o.carb ?? 0) >= 10;
    const vo = porCarb ? o.carb : o.kcal;
    const vd = porCarb ? d.carb : d.kcal;
    const un = porCarb ? 'g de carboidrato' : 'kcal';
    if (vo == null || vd == null) return { ok: false, erro: 'Um dos alimentos não tem esse dado na tabela. Não estime: oriente a falar com a clínica.' };
    if (vd <= 0 || vo <= 0) return { ok: false, erro: `Não dá para trocar por ${un}: um dos alimentos tem valor zero. Sugira outra opção ou a clínica.` };
    exato = (q * vo) / vd;
    conta = `${fmt(q)} g x ${fmt(vo)} ${un} / ${fmt(vd)} ${un} (por 100 g)`;
    usado = porCarb ? 'carboidrato' : 'calorias';
    if (porCarb && (d.carb ?? 0) < 5) avisos.push('O alimento novo tem pouco carboidrato; essa troca por carboidrato pode não fazer sentido.');
  }

  if (primeira(o.nome) === primeira(d.nome) && estado(o.nome) !== estado(d.nome)) avisos.push('Um dos alimentos está cru e o outro preparado; confirme o estado em que o paciente vai pesar.');
  if (tabela(o) !== tabela(d)) avisos.push('Valores de tabelas diferentes (clínica e TACO); diferença pequena é esperada.');

  return {
    ok: true,
    de: { nome: o.nome, gramas: q },
    para: { nome: d.nome, gramas_exatas: Math.round(exato * 10) / 10, gramas_arredondadas_5g: arred5(exato) },
    criterio: usado,
    conta,
    fontes: Array.from(new Set([o.fonte, d.fonte])),
    avisos,
  };
}

/** Acha o alimento para um nome escrito livremente (plano colado). exato = nome idêntico ao da tabela. */
export function resolverAlimento(nome: string): { id: string; nome: string; exato: boolean } | null {
  const alvo = sem(nome).replace(/\s+/g, ' ').trim();
  if (!alvo) return null;
  const ex = BASE.find((a) => sem(a.nome) === alvo);
  if (ex) return { id: ex.id, nome: ex.nome, exato: true };
  // Grafias comuns que a TACO escreve de outro jeito.
  const consulta = alvo.replace(/\b(mu[cs]+arela|mozzarela|muzzarela|mucarela|mussarela)\b/g, 'mozarela');
  const r = buscarAlimento(consulta);
  if (!r.ok || !r.opcoes?.length) return null;
  // Evita cair em versões em pó ou desidratadas quando o nome escrito não as cita.
  const quer = (t: string) => alvo.includes(t);
  const penal = (n: string) => {
    const x = sem(n);
    return (/\bpo\b/.test(x) && !quer('po') ? 1 : 0) + (/desidratad|liofiliz/.test(x) && !quer('desidrat') ? 1 : 0);
  };
  const melhor = [...r.opcoes].sort((a, b) => penal(a.nome) - penal(b.nome))[0];
  return { id: melhor.id, nome: melhor.nome, exato: false };
}

// ---------- Apoio ao "Meu plano" (o paciente troca itens do próprio plano) ----------
const dados = (a: Alimento) => ({ id: a.id, nome: a.nome, tabela: tabela(a), kcal: a.kcal, carb: a.carb, prot: a.prot });

/** Dados básicos de um alimento pelo id (ou null se não existir). */
export function alimentoPorId(id: unknown) {
  const a = POR_ID.get(String(id));
  return a ? dados(a) : null;
}

// Sugestões curtas e comuns, para o paciente não ver uma lista enorme.
const NOMES_COMUNS: Record<'fruta' | 'cereal' | 'proteina', string[]> = {
  fruta: ['Banana, prata, crua', 'Maçã, Fuji, com casca, crua', 'Mamão, Papaia, cru', 'Laranja, baía, crua', 'Uva, Itália, crua', 'Manga, Tommy Atkins, crua'],
  cereal: ['Pão, trigo, francês', 'Pão, trigo, forma, integral', 'Tapioca, com manteiga', 'Cuscuz, de milho, cozido com sal', 'Aveia, flocos, crua'],
  proteina: ['Ovo, de galinha, inteiro, cozido/10minutos', 'Queijo, minas, frescal'],
};
const POR_NOME = new Map(BASE.map((a) => [sem(a.nome), a]));
const comuns = (t: keyof typeof NOMES_COMUNS) => NOMES_COMUNS[t].map((n) => POR_NOME.get(sem(n))).filter((a): a is Alimento => !!a);

/** Até 6 opções prontas para trocar: as da clínica primeiro; para frutas, pães e proteínas, uma lista curta e comum. */
export function opcoesDaClinica(idOrigem: unknown) {
  const o = POR_ID.get(String(idOrigem));
  if (!o) return [];
  const f = funcao(o);
  let lista: Alimento[] = [];
  if (f === 'prot') lista = [...CLINICA.filter((a) => a.clinica?.tipo === 'prot'), ...comuns('proteina')];
  else if (o.id.startsWith('c:')) lista = CLINICA.filter((a) => a.clinica?.tipo === 'carb');
  else if (o.grupo === 'Frutas e derivados') lista = comuns('fruta');
  else if (o.grupo === 'Cereais e derivados' || o.grupo === 'Alimentos preparados') lista = comuns('cereal');
  return lista.filter((a) => a.id !== o.id).slice(0, 6).map(dados);
}

/** Busca por nome entre alimentos da mesma função do original (para "Ver outras opções"). */
export function buscarMesmaFuncao(idOrigem: unknown, consulta: unknown) {
  const o = POR_ID.get(String(idOrigem));
  if (!o) return [];
  const f = funcao(o);
  const r = buscarAlimento(consulta, (a) => a.id !== o.id && funcao(a) === f);
  if (!r.ok || !r.opcoes) return [];
  return r.opcoes.slice(0, 6).map((x) => dados(POR_ID.get(x.id)!));
}

export const FERRAMENTAS = [
  {
    name: 'buscar_alimento',
    description: 'Procura um alimento pelo nome nas tabelas (padrões da clínica e TACO) e devolve até 8 opções com id e valores por 100 g. Use antes de trocar_alimento.',
    input_schema: { type: 'object', properties: { consulta: { type: 'string', description: 'Nome do alimento, por exemplo "banana prata" ou "pão francês".' } }, required: ['consulta'] },
  },
  {
    name: 'trocar_alimento',
    description: 'Calcula a quantidade em gramas do alimento novo que equivale à quantidade do alimento original. A conta é feita por código. Se o paciente não disser o critério, deixe vazio.',
    input_schema: {
      type: 'object',
      properties: {
        id_origem: { type: 'string', description: 'id do alimento que o plano manda (de buscar_alimento).' },
        quantidade_g: { type: 'number', description: 'Quantidade do alimento original, em gramas.' },
        id_destino: { type: 'string', description: 'id do alimento que o paciente quer comer.' },
        criterio: { type: 'string', enum: ['carboidrato', 'calorias'], description: 'Opcional. Carboidrato para frutas, pães e cereais; calorias para proteínas.' },
      },
      required: ['id_origem', 'quantidade_g', 'id_destino'],
    },
  },
] as const;

/** Executa a ferramenta pedida pelo modelo e devolve o resultado em texto (JSON). */
export function executarFerramenta(nome: string, entrada: unknown): string {
  const e = (entrada ?? {}) as Record<string, unknown>;
  const r = nome === 'buscar_alimento' ? buscarAlimento(e.consulta)
    : nome === 'trocar_alimento' ? trocarAlimento(e.id_origem, e.quantidade_g, e.id_destino, e.criterio)
    : { ok: false, erro: 'Ferramenta desconhecida.' };
  return JSON.stringify(r);
}
