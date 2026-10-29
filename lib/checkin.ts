/**
 * Check-in semanal: itens, dicas e regras de alerta.
 * As dicas são educação geral e NÃO mudam conduta nem medicação.
 * REVISAR: todos os textos de DICAS e de ACOLHIMENTO abaixo são rascunho para o Dr. Renato aprovar.
 */

export type ChaveItem = 'humor' | 'sono' | 'energia' | 'saciedade' | 'plano' | 'aerobico' | 'forca';

export type Item = {
  chave: ChaveItem;
  titulo: string;
  pergunta: string;
  ajuda: string;       // o que significam os extremos
  max: 10 | 7;
  unidade: 'nota' | 'dias';
};

export const ITENS: Item[] = [
  { chave: 'humor', titulo: 'Humor', pergunta: 'Como esteve o seu humor nesta semana?', ajuda: '0 = muito mal, 10 = muito bem', max: 10, unidade: 'nota' },
  { chave: 'sono', titulo: 'Sono', pergunta: 'Como foi o seu sono?', ajuda: '0 = muito ruim, 10 = ótimo', max: 10, unidade: 'nota' },
  { chave: 'energia', titulo: 'Energia', pergunta: 'Como esteve a sua energia no dia a dia?', ajuda: '0 = sem energia, 10 = muita energia', max: 10, unidade: 'nota' },
  { chave: 'saciedade', titulo: 'Saciedade', pergunta: 'Como foi o controle da fome e da vontade de comer?', ajuda: '0 = sem controle, 10 = tranquilo e saciado', max: 10, unidade: 'nota' },
  { chave: 'plano', titulo: 'Plano alimentar', pergunta: 'O quanto você seguiu o plano alimentar?', ajuda: '0 = nada, 10 = tudo', max: 10, unidade: 'nota' },
  { chave: 'aerobico', titulo: 'Aeróbico', pergunta: 'Em quantos dias você fez exercício aeróbico?', ajuda: 'Caminhada, corrida, bicicleta, natação etc. (0 a 7 dias)', max: 7, unidade: 'dias' },
  { chave: 'forca', titulo: 'Treino de força', pergunta: 'Em quantos dias você fez treino de força?', ajuda: 'Musculação ou outro treino com carga (0 a 7 dias)', max: 7, unidade: 'dias' },
];

export const NOTAS: ChaveItem[] = ['humor', 'sono', 'energia', 'saciedade', 'plano'];
export const CRITICO_ABAIXO_DE = 5;       // nota abaixo de 5 vira alerta
export const HUMOR_GRAVE_ATE = 2;         // humor de 0 a 2 mostra mensagem de acolhimento
export const AEROBICO_DICA_ABAIXO_DE = 3; // dias
export const FORCA_DICA_ABAIXO_DE = 2;    // dias

export const WHATSAPP_PROFISSIONAL = 'https://wa.me/5517997713786?text=' +
  encodeURIComponent('Olá, Dr. Renato. Preciso conversar.');

export const DICAS: Record<ChaveItem, string> = {
  humor: 'Semanas mais pesadas acontecem. Procure separar um momento do dia, mesmo curto, para algo que lhe faça bem, e converse com alguém de confiança. Se esse sentimento continuar, conte para a equipe da clínica.',
  sono: 'Tente manter horários parecidos para dormir e acordar, deixar as telas de lado na última hora antes de dormir e evitar cafeína à tarde. Se o sono ruim continuar, avise a equipe da clínica.',
  energia: 'Energia baixa costuma melhorar com sono regular, refeições nos horários do plano e boa hidratação. Se continuar por várias semanas, avise a equipe da clínica.',
  saciedade: 'Para ajudar no controle da fome, comece as refeições pela proteína e pelas fibras (salada e legumes), coma devagar e siga os horários do plano. Se estiver difícil, conte para a equipe da clínica.',
  plano: 'Sem culpa: a próxima refeição é um novo começo. Escolha uma refeição da semana para seguir direitinho e vá aumentando aos poucos. Se estiver difícil seguir o plano, fale com a equipe da clínica para ajustar.',
  aerobico: 'A recomendação geral é fazer pelo menos 150 minutos de atividade aeróbica moderada por semana, como caminhada rápida. Comece com 10 a 15 minutos e vá aumentando.',
  forca: 'O ideal é treinar força pelo menos 2 vezes por semana, trabalhando os grandes grupos musculares. Se for começar, procure orientação para evitar lesões.',
};

export function dicaPara(chave: ChaveItem, valor: number): string | null {
  if (chave === 'aerobico') return valor < AEROBICO_DICA_ABAIXO_DE ? DICAS.aerobico : null;
  if (chave === 'forca') return valor < FORCA_DICA_ABAIXO_DE ? DICAS.forca : null;
  if (chave === 'humor' && valor <= HUMOR_GRAVE_ATE) return null; // vale a mensagem de acolhimento
  return valor < CRITICO_ABAIXO_DE ? DICAS[chave] : null;
}

// ---------- Datas (horário de Brasília) ----------
const fmtDia = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

/** Segunda-feira da semana de `base`, no formato AAAA-MM-DD (igual à função semana_atual do banco). */
export function segundaDaSemana(base = new Date()): string {
  const [a, m, d] = fmtDia(base).split('-').map(Number);
  const dt = new Date(Date.UTC(a, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - ((dt.getUTCDay() + 6) % 7));
  return dt.toISOString().slice(0, 10);
}

export function diasAtras(n: number, base = new Date()): string {
  return fmtDia(new Date(base.getTime() - n * 86400000));
}

/** Início e fim (exclusivo) de um mês AAAA-MM, em horário de Brasília (UTC-3, sem horário de verão). */
export function limitesDoMes(mes: string) {
  const [a, m] = mes.split('-').map(Number);
  const prox = m === 12 ? `${a + 1}-01` : `${a}-${String(m + 1).padStart(2, '0')}`;
  return { inicio: `${mes}-01T00:00:00-03:00`, fim: `${prox}-01T00:00:00-03:00` };
}

export function mesAtual() {
  return fmtDia(new Date()).slice(0, 7);
}

export function deslocarMes(mes: string, delta: number) {
  const [a, m] = mes.split('-').map(Number);
  const dt = new Date(Date.UTC(a, m - 1 + delta, 1));
  return dt.toISOString().slice(0, 7);
}

export function nomeDoMes(mes: string) {
  const [a, m] = mes.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, 15)).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

// ---------- Alertas para o painel ----------
export type LinhaCheckin = {
  patient_id: string; semana: string;
  humor: number; sono: number; energia: number; saciedade: number; plano: number; aerobico: number; forca: number;
  observacao?: string | null;
};

export type AlertaCheckin = {
  patient_id: string;
  semana: string;
  criticos: { chave: ChaveItem; titulo: string; valor: number }[]; // notas abaixo de 5
  humorGrave: boolean;
  semTreino: ChaveItem[];   // aerobico/forca com 0 dias nos 2 últimos check-ins
  observacao: string | null;
};

/**
 * Recebe check-ins recentes (últimas ~4 semanas) e devolve um alerta por paciente,
 * olhando o check-in mais recente (se for dos últimos 14 dias).
 */
export function alertasCheckin(linhas: LinhaCheckin[]): AlertaCheckin[] {
  const corte = diasAtras(13);
  const por = new Map<string, LinhaCheckin[]>();
  for (const l of linhas) {
    const arr = por.get(l.patient_id) ?? [];
    arr.push(l);
    por.set(l.patient_id, arr);
  }
  const saida: AlertaCheckin[] = [];
  for (const [patient_id, arr] of Array.from(por.entries())) {
    arr.sort((x, y) => (x.semana < y.semana ? 1 : -1));
    const ult = arr[0];
    if (ult.semana < corte) continue;
    const criticos = ITENS.filter((i) => NOTAS.includes(i.chave) && ult[i.chave] < CRITICO_ABAIXO_DE)
      .map((i) => ({ chave: i.chave, titulo: i.titulo, valor: ult[i.chave] }));
    const semTreino = (['aerobico', 'forca'] as const).filter((k) => arr.length >= 2 && arr[0][k] === 0 && arr[1][k] === 0);
    const humorGrave = ult.humor <= HUMOR_GRAVE_ATE;
    if (criticos.length === 0 && semTreino.length === 0) continue;
    saida.push({ patient_id, semana: ult.semana, criticos, humorGrave, semTreino, observacao: ult.observacao ?? null });
  }
  // Humor grave primeiro, depois quem tem mais notas críticas.
  return saida.sort((a, b) => Number(b.humorGrave) - Number(a.humorGrave) || b.criticos.length - a.criticos.length);
}

/** Link do WhatsApp do paciente a partir do celular cadastrado. */
export function whatsappDoPaciente(celular: string | null): string | null {
  const d = (celular ?? '').replace(/\D/g, '');
  if (d.length < 10) return null;
  return `https://wa.me/${d.startsWith('55') && d.length >= 12 ? d : '55' + d}`;
}
