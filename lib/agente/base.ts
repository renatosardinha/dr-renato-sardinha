/**
 * BASE DE CONHECIMENTO DO AGENTE DE DÚVIDAS.
 * Tudo o que está aqui pode ser dito aos pacientes. Linhas entre <!-- --> são notas internas e NÃO vão ao modelo.
 * O agente só liga quando AGENTE_ATIVO=1 na Vercel.
 */
export const BASE = `
# A clínica e o app
- Clínica RS - Saúde Física e Mental, em São José do Rio Preto (SP).
- Dr. Renato Sardinha, pós-graduado em Nutrologia Esportiva e pós-graduando em Psiquiatria (CRM-SP 205323).
<!-- REVISAR: confira com o CRM-SP/CFM se esta forma de apresentar a formação ("pós-graduando em Psiquiatria", "Saúde Física e Mental") é permitida em material voltado a pacientes. -->
- Acompanhamento médico baseado em evidência.
- O app serve para interação e acesso prático: feed com conteúdos, cópias de documentos e este espaço de dúvidas.
- As receitas são emitidas pelo Memed e o prontuário fica no sistema da clínica. O app não substitui esses registros.
- Este assistente não substitui a consulta e não conhece os dados individuais de cada paciente.

# Endereço e horários
- Endereço: Edifício Totalité, sala 909, Avenida Romeu Strazzi, 325, Vila Sinibaldi, São José do Rio Preto (SP).
- Se o paciente pedir o endereço, ofereça os links de navegação e pergunte se prefere Google Maps ou Waze:
  - Google Maps: https://www.google.com/maps/search/?api=1&query=Av.+Romeu+Strazzi+325+Vila+Sinibaldi+Sao+Jose+do+Rio+Preto
  - Waze: https://waze.com/ul?q=Av.%20Romeu%20Strazzi%20325%20S%C3%A3o%20Jos%C3%A9%20do%20Rio%20Preto&navigate=yes
- Funcionamento: segunda a quinta, das 9h às 17h30; sexta-feira, até as 14h.
- Horários de consultas e de aplicação de medicações: consultar a secretaria (Amanda).

# Alimentação
- O plano alimentar é baseado em flexibilidade, e não em cardápio rígido: o paciente pode trocar alimentos usando a tabela de trocas do próprio plano.
- A proteína é priorizada ao longo do dia.
- Quem tem intolerância à lactose usa as opções sem lactose da tabela de trocas.
- Em dias fora do planejado, retomar o plano na refeição seguinte, sem compensar pulando refeições e sem jejum.
- Redução de danos: depois de um erro alimentar grande, o paciente pode compensar com até 300 kcal a menos no dia seguinte, distribuídas nas refeições, sem pular refeições. O agente pode ajudar com trocas e com a redução de danos.
<!-- REVISAR: se o paciente demonstrar culpa intensa, episódios de comer compulsivo ou tentativas de compensar com vômito, laxante ou jejum, o agente deve encaminhar para a clínica (regra nas instruções). -->

# Suplementos
- Creatina: a dose padrão dos planos é 5 g por dia. Não indicar para quem tem doença renal ou risco renal acentuado; nesses casos, falar com a clínica antes.
<!-- REVISAR: você tirou a dose na sua versão; mantive 5 g/dia, que vinha dos planos. Confirme. -->
- Nitrato (suco de beterraba) pode ser usado como pré-treino. Dose e horário: conforme a orientação da clínica (a base ainda será complementada com os dados de evidência).
<!-- PENDENTE: pesquisar dosagens baseadas em evidência (PubMed) e inserir aqui depois da sua aprovação. O agente não pesquisa na internet. -->
- Cafeína: até 300 mg por dia; não tomar depois das 15h; não usar se houver desconforto gástrico, azia, má digestão ou enxaqueca.
- Psyllium: a dose padrão dos planos é 5 g misturados ao arroz, no almoço e no jantar, com boa ingestão de água.

# Treino
- A intensidade do exercício aeróbico se controla pelo teste da fala: ritmo em que dá para conversar com frases curtas.
- A base é o exercício aeróbico leve a moderado (zona 2). Treinos intervalados (como 30 segundos fortes e 30 de descanso) só entram se a clínica indicar.
- O treino de força é parte importante do acompanhamento. Dúvidas sobre a divisão dos treinos devem ser tiradas com a clínica.

# Bioimpedância: como funciona e como se preparar
<!-- PENDENTE: o Dr. Renato enviará um arquivo com mais dados; complementar depois. -->
- Como funciona: o aparelho envia uma corrente elétrica muito fraca, imperceptível e segura, pelo corpo. A corrente passa com facilidade pela água e pelos tecidos com mais água (como o músculo) e com mais dificuldade pela gordura. A partir dessa resistência, o aparelho estima água corporal, massa muscular e gordura por meio de equações matemáticas. Ou seja, é uma estimativa, não uma medida direta.
- O resultado tem muitas variações: o estado de hidratação, alimentação recente, treino, esvaziamento do intestino e da bexiga, temperatura, horário do dia, uso de roupas e acessórios e, nas mulheres, a fase do ciclo menstrual podem alterar os números. Aparelhos e equações diferentes também dão valores diferentes. Por isso, para acompanhar a evolução, o ideal é comparar exames feitos no mesmo aparelho e nas mesmas condições, olhando a tendência ao longo do tempo e não um valor isolado.
- Orientações ideais para o exame:
  - Estar com o intestino e a bexiga vazios (ir ao banheiro antes).
  - Evitar treinos nas 4 horas anteriores.
  - Evitar alimentação nas 4 horas anteriores.
  - Evitar ingestão de líquidos nas 4 horas anteriores.
  - De preferência, ir com roupas leves.
- Se o paciente tiver dúvida sobre a interpretação do resultado, orientar a conversar com o Dr. Renato na consulta.

# Sono
- Manter horários regulares para dormir e acordar.
- Quarto escuro e fresco; evitar telas na hora anterior ao sono.
- Evitar cafeína no fim da tarde e refeições pesadas perto da hora de dormir.
- Se o problema de sono persistir, avisar a clínica.

# Pacientes em tratamento para perda de peso (tirzepatida/Mounjaro, semaglutida/Ozempic): sintomas leves
Vale apenas para sintomas LEVES e recentes. Antes de sugerir qualquer remédio, siga o roteiro de perguntas das instruções.
- Cólica leve: Buscopan composto. Se o paciente tem alergia a dipirona, usar Buscopan simples. Seguir a dose da bula ou da orientação da clínica.
- Azia e má digestão: Digeplus ou Eno, conforme a bula.
- Constipação (até 4 dias): aumentar a ingestão de água e usar óleo mineral, 1 colher antes de dormir e 1 colher ao acordar. Se persistir, entrar em contato com o consultório.
<!-- REVISAR: confirme se "1 colher" é de sopa (15 mL). Óleo mineral: uso curto; evitar em gestantes, idosos acamados, quem tem dificuldade para engolir; pode atrapalhar a absorção de vitaminas lipossolúveis se usado por muito tempo. -->
- Náusea: medidas gerais (refeições menores, comer devagar, evitar frituras e gordura, tomar líquidos em pequenos goles). Para medicação contra náusea, falar com a clínica, que orienta o remédio adequado.
<!-- DECISÃO: o Vonau Flash 8 mg (ondansetrona) é medicamento com receita no Brasil e tem risco cardíaco em alguns pacientes; deixei o agente sem indicá-lo. Se quiser incluir, converse comigo antes. -->
- Contraindicações a avisar (e então encaminhar à clínica): alergia a algum componente; gestação ou amamentação; doença nos rins, coração, glaucoma, próstata aumentada ou dificuldade para urinar (Buscopan); pressão alta ou dieta com pouco sal (Eno); uso de outros remédios.

# Sinais de alerta (encaminhar à clínica na hora; se for grave, SAMU 192 ou pronto-socorro)
- Dor abdominal forte, que não melhora ou que vai para as costas.
- Vômitos repetidos ou não conseguir manter líquidos; sinais de desidratação (urina escura, tontura).
- Febre, sangue nas fezes ou no vômito, fezes pretas, pele ou olhos amarelados.
- Constipação por mais de 4 dias, ou com barriga muito inchada, dor importante ou sem eliminar gases.

# Quando falar com a clínica
- Qualquer sintoma novo, piora, efeito colateral não leve, dúvida sobre medicação receitada ou dose, gravidez ou amamentação, ou uso de outro remédio.
- Urgências (dor forte no peito, falta de ar, desmaio, reação alérgica, sangramento intenso): procurar o SAMU (192) ou o pronto-socorro.
`;
