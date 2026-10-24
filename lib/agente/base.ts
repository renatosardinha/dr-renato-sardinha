/**
 * BASE DE CONHECIMENTO DO AGENTE DE DÚVIDAS.
 * Tudo o que está aqui pode ser dito aos pacientes. Linhas entre <!-- --> são notas internas e NÃO vão ao modelo.
 * RASCUNHO: o agente só liga quando AGENTE_ATIVO=1 na Vercel, depois que o Dr. Renato revisar este texto.
 */
export const BASE = `
# A clínica
- Clínica RS, em São José do Rio Preto (SP). Médico responsável: Dr. Renato Sardinha, nutrólogo (CRM-SP 205323).
- Acompanhamento médico baseado em evidência científica, olhando o paciente por inteiro.

# Este aplicativo
- O app serve para interação e acesso prático: feed com conteúdos da clínica, cópias de documentos (como bioimpedância) e este espaço de dúvidas.
- As receitas são emitidas pelo Memed e o prontuário fica no sistema da clínica. O app não substitui esses registros.
- Este assistente não substitui a consulta e não conhece os dados individuais de cada paciente.

# Alimentação
<!-- REVISAR: rascunho baseado nas suas preferências já descritas nos planos alimentares. Ajuste ou apague o que não quiser que o agente diga. -->
- O plano alimentar é baseado em flexibilidade, e não em cardápio rígido: o paciente pode trocar alimentos usando a tabela de trocas do próprio plano.
- A proteína é priorizada ao longo do dia.
- Quem tem intolerância à lactose pode usar as opções sem lactose indicadas na tabela de trocas.
- Em dias fora do planejado, o orientado é retomar na refeição seguinte, sem compensar nem pular refeições.

# Suplementos citados nos planos
<!-- REVISAR: confirme se o agente pode repetir estas orientações padrão. Se preferir, apague e deixe só "fale com a clínica". -->
- Creatina: a orientação padrão do plano é 5 g por dia. Quem tem doença nos rins ou dúvidas deve falar com a clínica antes de usar.
- Psyllium: a orientação padrão do plano é 5 g misturados ao arroz, no almoço e no jantar, com boa ingestão de água.

# Treino
<!-- REVISAR: rascunho. -->
- A intensidade do exercício aeróbico se controla pelo teste da fala: ritmo em que dá para conversar com frases curtas.
- A base é o exercício aeróbico leve a moderado (zona 2). Treinos intervalados (como 30 segundos fortes e 30 de descanso) só entram se a clínica indicar.
- O treino de força é parte importante do acompanhamento. Dúvidas sobre a divisão dos treinos devem ser tiradas com a clínica.

# Sono
<!-- REVISAR: orientações gerais de higiene do sono. -->
- Manter horários regulares para dormir e acordar, inclusive nos fins de semana.
- Quarto escuro, silencioso e fresco; evitar telas na hora anterior ao sono.
- Evitar cafeína no fim da tarde e refeições muito pesadas perto da hora de dormir.
- Se o problema de sono persistir, avisar a clínica; pode ser preciso avaliar o caso.

# Quando falar com a clínica
- Qualquer sintoma novo, piora, efeito colateral, dúvida sobre medicação ou dose, gravidez ou amamentação, ou uso de outro remédio.
- Urgências (dor forte no peito, falta de ar, desmaio, reação alérgica, sangramento intenso): procurar o SAMU (192) ou o pronto-socorro.
`;
