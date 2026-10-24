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

# Insônia: orientações práticas (apoio entre consultas)
<!-- REVISAR (Dr. Renato): módulo baseado em higiene do sono e controle de estímulos (componentes da TCC para insônia). Deixei de fora de propósito a restrição de sono e qualquer medicamento ou suplemento para dormir (inclusive melatonina). -->
- Por que a insônia se mantém: o sono depende do relógio biológico e da "pressão de sono" acumulada durante o dia. Quando a pessoa passa muito tempo acordada na cama, preocupada em dormir, o cérebro associa cama a alerta, e o ciclo se repete.
- 1) Horário fixo para acordar, todos os dias, inclusive no fim de semana. É a âncora do relógio biológico. O horário de deitar deve seguir o sono, e não ser forçado.
- 2) Luz: pegar luz natural de manhã (10 a 30 minutos) e reduzir luz forte e telas na hora anterior ao sono.
- 3) Controle de estímulos: usar a cama só para dormir. Se não pegar no sono em cerca de 20 minutos, levantar, fazer algo calmo com pouca luz (ler algo leve, ouvir música calma) e voltar quando sentir sono. Evitar ficar olhando o relógio.
- 4) Substâncias e refeições: nada de cafeína depois das 15h; o álcool pode ajudar a adormecer, mas piora a qualidade do sono; jantar leve, 2 a 3 horas antes de deitar; diminuir líquidos perto da hora de dormir para não acordar para urinar.
- 5) Desacelerar a mente: reservar 10 minutos no início da noite (e não na cama) para anotar preocupações e o que precisa fazer no dia seguinte. Na cama, usar respiração lenta ou relaxamento muscular (veja o módulo de ansiedade).
- 6) Evitar cochilos longos (mais de 30 minutos) e cochilos depois das 15h.
- 7) Atividade física regular ajuda o sono; se treino muito intenso perto da hora de dormir atrapalhar, mudar o horário do treino.
- 8) Não tentar compensar uma noite ruim ficando mais tempo na cama ou dormindo até tarde.
- Avisar a clínica quando: a dificuldade para dormir passa de 2 semanas ou atrapalha o dia; houver sonolência ao dirigir, ronco alto com pausas na respiração, pernas inquietas à noite, pesadelos intensos ou uso de álcool para dormir. Não orientar remédios ou suplementos para dormir: isso é com a clínica.

# Ansiedade: como se regular no momento (apoio entre consultas)
<!-- REVISAR (Dr. Renato): este módulo é apoio e psicoeducação, sem papel de terapia. Técnicas inspiradas em TCC (diário de pensamentos, preocupação, ativação comportamental), relaxamento e mindfulness. Inclua ou retire técnicas conforme seu critério. -->
- Como o agente deve agir: acolher em uma frase ("faz sentido você estar assim"), perguntar como o corpo e a mente estão agora, ensinar UMA ou DUAS técnicas por vez em passos claros e lembrar que, se os sintomas persistirem ou piorarem, o paciente deve falar com a clínica. Nunca diagnosticar, nunca conduzir "sessão de terapia", nunca orientar medicação.
- Antes das técnicas: se houver dor no peito, falta de ar importante, desmaio ou pensamentos de se machucar, não ensinar técnica: seguir as orientações de urgência.
- Respiração lenta: sentar confortável; inspirar pelo nariz contando 4 segundos e soltar o ar pela boca contando 6 (a expiração mais longa tende a acalmar o corpo); repetir por 2 a 5 minutos. Não forçar nem prender o ar; se sentir tontura, voltar a respirar normalmente.
- Aterramento 5-4-3-2-1: nomear 5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira e 1 que saboreia. Traz a atenção para o presente e interrompe o ciclo de pensamentos.
- Relaxamento muscular progressivo: dos pés à cabeça, contrair cada grupo muscular por 5 segundos e soltar por 10, percebendo a diferença. Quem tem dor ou lesão numa região pula essa região.
- Diário de pensamentos (base da TCC, a terapia cognitivo-comportamental): escrever (1) a situação, (2) o pensamento que veio, (3) a emoção e a intensidade de 0 a 10, (4) as evidências a favor e contra o pensamento, (5) um pensamento alternativo mais realista, (6) como a emoção ficou depois. Distorções comuns: catastrofizar ("vai dar tudo errado"), adivinhar o futuro, leitura mental, tudo ou nada.
- Preocupação sem fim: separar o que tem solução (escolher um passo pequeno e marcar quando fazer) do que não tem (praticar aceitar a incerteza). Reservar um "horário de preocupação" de 15 minutos por dia e, fora dele, anotar a preocupação para depois.
- Mindfulness de 3 minutos: escolher um ponto de atenção (a respiração ou os pés no chão); quando surgir um pensamento, notar "isso é um pensamento" e voltar ao ponto, sem se criticar. A mente vai se distrair; voltar é o exercício.
- Ativação comportamental: quando a ansiedade ou o desânimo travam, fazer uma atividade pequena (caminhar 10 minutos, tomar um banho, falar com alguém). A ação costuma vir antes da vontade.
- Crise de pânico: o pico costuma durar poucos minutos e o desconforto, embora forte, passa. Evitar fugir do lugar, usar respiração lenta e aterramento. Se for a primeira crise, se as crises forem frequentes ou se houver dor no peito ou desmaio, procurar a clínica ou urgência.
- O que piora a ansiedade: excesso de cafeína, álcool, pouco sono e pular refeições. Orientar reduzir.
- Avisar a clínica quando: os sintomas passam de 2 semanas, atrapalham trabalho, sono ou relações, as crises de pânico se repetem, há uso de álcool ou outras substâncias para lidar, desesperança, ou piora depois de mudar algum remédio.

# Hidratação: quanto de água beber
<!-- REVISAR (Dr. Renato): regra prática de 35 mL por kg por dia (faixa de 30 a 40 mL/kg). É referência geral, não vem de uma única diretriz. Confirme a conta, o teto de 4 litros e as exclusões. -->
- Conta de referência para adultos saudáveis: 35 mL por kg de peso por dia (faixa de 30 a 40). A conta inclui água, chás, café e sopas. Tabela pronta: 50 kg = 1,75 L; 60 kg = 2,1 L; 70 kg = 2,45 L; 80 kg = 2,8 L; 90 kg = 3,15 L; 100 kg = 3,5 L; 110 kg = 3,85 L; 120 kg ou mais = cerca de 4 L (teto prático). Para outros pesos, multiplicar o peso por 35 mL e mostrar a conta.
- Ajustes: em dias de calor, acrescentar cerca de 500 mL; no treino, acrescentar cerca de 500 mL por hora de atividade; em caso de febre, diarreia ou vômitos, aumentar líquidos e avisar a clínica se não conseguir manter líquidos.
- Como beber: ao longo do dia, em goles, e não tudo de uma vez. Urina amarelo-clara indica boa hidratação; escura sugere pouca água. Quem usa tirzepatida ou semaglutida pode sentir menos sede e deve programar lembretes.
- Não calcular, e encaminhar à clínica, para quem tem doença dos rins ou do coração, usa diuréticos ou tem restrição de líquidos; gestantes e quem amamenta também falam com a clínica.
- Para fazer a conta, o agente pode pedir apenas o peso e se o paciente treina.

# Retenção de líquido (inchaço)
<!-- REVISAR (Dr. Renato): o módulo ensina medidas gerais e prioriza sinais de alerta, porque inchaço também pode vir de doença do coração, rim, fígado ou tireoide. -->
- Causas comuns de retenção leve: muito sal e ultraprocessados, pouco movimento, ficar muito tempo sentado ou em pé, calor, fase pré-menstrual e alguns medicamentos.
- O que ajuda: reduzir sal e ultraprocessados (temperos prontos, embutidos, salgadinhos); comer alimentos ricos em potássio (banana, laranja, feijão, folhas); beber água conforme o módulo de hidratação (beber pouco não resolve a retenção); caminhar e mexer as pernas ao longo do dia; elevar as pernas por 15 a 20 minutos no fim do dia.
- Oscilações de 1 a 2 kg ao longo do mês, principalmente na fase pré-menstrual, são frequentes e dizem pouco sobre gordura. Comparar o peso na mesma fase do ciclo e olhar a tendência de 2 a 4 semanas.
- Procurar a clínica logo (e urgência se houver falta de ar ou dor no peito) quando: inchaço só em um lado ou só em uma perna, com dor ou vermelhidão; falta de ar; ganho de peso rápido em poucos dias; diminuição da urina ou urina muito escura; inchaço no rosto ou nos olhos; inchaço que não melhora em poucos dias.

# Chás: usos e cuidados
<!-- REVISAR (Dr. Renato): conteúdo escrito a partir de conhecimento geral sobre plantas medicinais e das contraindicações mais conhecidas (por exemplo, as do Memento Fitoterápico da Farmacopeia Brasileira). Ainda não conferi item por item nas fontes oficiais. Confira, principalmente, gestação e lactação. -->
- Princípios: chá não substitui tratamento; "natural" não significa sem risco; muitas plantas têm contraindicações e interagem com remédios. Antes de sugerir qualquer chá, seguir a regra de perguntas das instruções (gestação ou amamentação, doenças, remédios em uso).
- Em geral, 2 a 3 xícaras por dia, por poucos dias seguidos. Chás com efeito diurético ou laxante não devem virar uso diário prolongado.
- Chás que podem ser sugeridos a adultos sem as condições acima:
  - Camomila: relaxante leve. Evitar se tiver alergia a plantas da família da margarida; na gestação, pedir orientação da clínica.
  - Erva-cidreira ou capim-limão: relaxante leve, bom à noite. Cuidado com pressão baixa.
  - Gengibre: ajuda em enjoo e digestão. Evitar em quem usa anticoagulante ou tem pedras na vesícula; em gestantes, só com orientação.
  - Hortelã: digestão e gases. Pode piorar refluxo e azia; evitar na gestação em grande quantidade.
  - Erva-doce (funcho): gases e inchaço abdominal. Evitar na gestação e na amamentação em grande quantidade.
  - Chá verde, chá preto, mate: contêm cafeína, que conta no limite de 300 mg por dia da clínica; não tomar depois das 15h; podem causar azia e reduzir a absorção de ferro se tomados junto às refeições.
  - Hibisco: efeito diurético leve e pode reduzir a pressão. Evitar se a pressão é baixa, se usa remédio para pressão e na gestação.
  - Cavalinha: diurética. Evitar se tem doença nos rins ou no coração, e na gestação; uso por poucos dias.
- NÃO sugerir (explicar o motivo e encaminhar à clínica):
  - Sene e cáscara-sagrada (laxantes fortes, comuns em chás "emagrecedores"): irritam o intestino, causam dependência e perda de potássio no uso prolongado; contraindicados na gestação e na amamentação.
  - Erva-de-são-joão: interage com antidepressivos, anticoncepcionais, anticoagulantes e muitos outros remédios.
  - Alcaçuz: pode elevar a pressão e reduzir o potássio.
  - Boldo, carqueja e espinheira-santa: evitar na gestação e na amamentação; boldo também em quem tem doença no fígado ou nas vias biliares; uso só por poucos dias.
  - Valeriana, passiflora e melissa em uso medicinal: causam sonolência e interagem com ansiolíticos, antidepressivos, remédios para dormir e álcool; não dirigir depois.
  - Chás "detox" e "emagrecedores" comprados prontos: a composição costuma ter laxantes e diuréticos; desencorajar o uso.
- Se aparecer diarreia, tontura, palpitação, alergia ou piora de algum sintoma depois de um chá, parar e falar com a clínica.

# Psyllium: formas de usar
- Dose padrão dos planos: 5 g. Sempre acompanhar de bastante água (pelo menos 1 copo por porção), senão pode causar desconforto ou entupimento.
- Formas práticas: misturado ao arroz cozido (forma padrão da clínica, com limão); em iogurte ou coalhada; em vitamina ou shake; em água ou suco, tomando logo depois de misturar, porque engrossa rápido; em sopa, purê ou feijão.
- Começar aos poucos, se nunca usou, porque pode dar gases no início.
- Tomar com pelo menos 1 hora de diferença de outros remédios, porque o psyllium pode reduzir a absorção deles; quem usa remédio contínuo (por exemplo, para tireoide ou diabetes) confirma com a clínica.
- Avisar a clínica se houver dor abdominal forte, dificuldade para engolir, vômitos ou constipação que piora.

# Situações comuns durante o emagrecimento
<!-- REVISAR (Dr. Renato): orientações gerais para regular o paciente; sempre com encaminhamento à clínica. Sem exames ou suplementos. -->
- Tontura ou fraqueza: levantar devagar, beber água, manter as refeições regulares e não pular refeições. Avisar a clínica se persistir, com palpitação, ou se desmaiar (urgência).
- Queda de cabelo: é comum de 2 a 4 meses depois de uma perda de peso mais rápida e costuma ser temporária. Ajuda manter proteína adequada e não cortar calorias demais. Avisar a clínica para avaliar, sem o agente indicar suplementos ou exames.
- Cãibras: hidratar, alongar com suavidade e usar calor local. Se forem frequentes, avisar a clínica.
- Dor de cabeça: beber água, manter refeições e horário de sono, evitar excesso de cafeína. Procurar urgência se for a pior dor da vida, de início súbito, com febre e rigidez no pescoço, ou com fraqueza, confusão ou alteração na fala.
- Gases e inchaço abdominal: comer devagar, mastigar bem, evitar bebidas gaseificadas e chiclete, caminhar depois das refeições, introduzir fibras e psyllium aos poucos. Chá de erva-doce ou hortelã, se não houver restrição. Sinais de alerta estão no módulo de sinais de alerta.
- Calor: aumentar a água, treinar no começo da manhã ou no fim da tarde, usar roupas leves. Avisar se houver tontura intensa, confusão ou pele muito quente e seca (urgência).

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
