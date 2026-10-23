import { AttributeKey } from '../hooks/useDiceRoller';

// ============================================================================
// 1. AS 28 PERÍCIAS OFICIAIS (Capítulo 05, pág. 40)
// ============================================================================
export interface SkillDefinition {
  key: string;
  label: string;
  attr: AttributeKey;
  altAttr?: AttributeKey;
}

export const ALL_ANE_SKILLS: SkillDefinition[] = [
  { key: 'Acrobacia', label: 'Acrobacia', attr: 'AGI' },
  { key: 'Adestramento', label: 'Adestramento', attr: 'PRE' },
  { key: 'Agricultura', label: 'Agricultura', attr: 'INT' },
  { key: 'Artes', label: 'Artes', attr: 'PRE' },
  { key: 'Atletismo', label: 'Atletismo', attr: 'FOR', altAttr: 'AGI' },
  { key: 'Atualidades', label: 'Atualidades', attr: 'INT' },
  { key: 'Ciencias', label: 'Ciências', attr: 'INT' },
  { key: 'Cozinha', label: 'Cozinha', attr: 'INT' },
  { key: 'Crime', label: 'Crime', attr: 'AGI' },
  { key: 'Diplomacia', label: 'Diplomacia', attr: 'PRE' },
  { key: 'Enganacao', label: 'Enganação', attr: 'PRE' },
  { key: 'Fortitude', label: 'Fortitude', attr: 'VIG' },
  { key: 'Furtividade', label: 'Furtividade', attr: 'AGI' },
  { key: 'Informatica', label: 'Informática', attr: 'INT' },
  { key: 'Intimidacao', label: 'Intimidação', attr: 'PRE', altAttr: 'FOR' },
  { key: 'Investigacao', label: 'Investigação', attr: 'INT' },
  { key: 'Lideranca', label: 'Liderança', attr: 'PRE' },
  { key: 'Luta', label: 'Luta', attr: 'FOR', altAttr: 'AGI' },
  { key: 'Mecanica', label: 'Mecânica', attr: 'INT' },
  { key: 'Medicina', label: 'Medicina', attr: 'INT' },
  { key: 'Percepcao', label: 'Percepção', attr: 'PRE' },
  { key: 'Pilotagem', label: 'Pilotagem', attr: 'AGI' },
  { key: 'Pontaria', label: 'Pontaria', attr: 'AGI' },
  { key: 'Reflexos', label: 'Reflexos', attr: 'AGI' },
  { key: 'Religiao', label: 'Religião', attr: 'INT' },
  { key: 'Sobrevivencia', label: 'Sobrevivência', attr: 'INT' },
  { key: 'Tatica', label: 'Tática', attr: 'INT' },
  { key: 'Vontade', label: 'Vontade', attr: 'PRE' },
];

// ============================================================================
// 2. AS 35 ORIGENS OFICIAIS (Capítulo 04, págs. 32–37)
// ============================================================================
export interface OriginOption {
  id: string;
  title: string;
  subtitle: string;
  abilityName: string;
  abilityDescription: string;
  fixedSkills: string[];
  choiceCount: number;
  choicePool: string[]; // Se vazio, permite qualquer uma das 28 perícias
}

const ALL_SKILL_KEYS = ALL_ANE_SKILLS.map((s) => s.key);

export const ANE_ORIGINS: OriginOption[] = [
  {
    id: 'academico',
    title: 'Acadêmico',
    subtitle: 'Universidade, pesquisa ou anos de estudo ensinaram você a procurar informação e comparar fontes.',
    abilityName: 'Área de Estudo',
    abilityDescription: 'Uma vez por cena, quando realizar um teste de INT diretamente relacionado à sua área de formação, receba +2.',
    fixedSkills: ['Atualidades'],
    choiceCount: 3,
    choicePool: ['Artes', 'Ciencias', 'Informatica', 'Investigacao', 'Percepcao', 'Vontade'],
  },
  {
    id: 'agente-saude',
    title: 'Agente de Saúde',
    subtitle: 'Técnico de enfermagem, enfermeiro ou agente comunitário acostumado a observar pacientes e tratamentos.',
    abilityName: 'Cuidado Contínuo',
    abilityDescription: 'Quando acompanhar o tratamento de um personagem durante descanso/recuperação, conceda +2 no primeiro teste relacionado à recuperação ou Complicação.',
    fixedSkills: ['Medicina', 'Percepcao'],
    choiceCount: 2,
    choicePool: ['Ciencias', 'Diplomacia', 'Fortitude', 'Vontade'],
  },
  {
    id: 'artista',
    title: 'Artista',
    subtitle: 'Música, fotografia, pintura, teatro ou escrita faziam parte da sua vida.',
    abilityName: 'Expressão',
    abilityDescription: 'Quando usar arte ou performance durante uma cena segura, um personagem que recuperar SAN nessa cena recupera +1 SAN adicional (máx. 1x por cena).',
    fixedSkills: ['Artes', 'Percepcao'],
    choiceCount: 2,
    choicePool: ['Diplomacia', 'Enganacao', 'Atualidades', 'Vontade'],
  },
  {
    id: 'atleta',
    title: 'Atleta',
    subtitle: 'Esporte profissional ou treinamento constante ensinaram disciplina e coordenação.',
    abilityName: 'Condicionamento',
    abilityDescription: 'Uma vez por cena, depois de falhar em um teste físico de Atletismo, Acrobacia ou Fortitude, você pode repetir o teste.',
    fixedSkills: ['Atletismo', 'Fortitude'],
    choiceCount: 2,
    choicePool: ['Acrobacia', 'Reflexos', 'Vontade', 'Luta'],
  },
  {
    id: 'autodidata',
    title: 'Autodidata',
    subtitle: 'Livros, tentativa e erro e projetos pessoais foram sua sala de aula.',
    abilityName: 'Aprender Sozinho',
    abilityDescription: 'Uma vez por sessão, após falhar em uma Perícia na qual seja Destreinado, pode estudar o problema por alguns minutos para receber +2 na próxima tentativa semelhante.',
    fixedSkills: [],
    choiceCount: 4,
    choicePool: ALL_SKILL_KEYS,
  },
  {
    id: 'bombeiro',
    title: 'Bombeiro',
    subtitle: 'Treinado para entrar em incêndios, desabamentos, fumaça e resgates.',
    abilityName: 'Treinado para o Perigo',
    abilityDescription: 'Receba +2 em testes para agir durante incêndios, desabamentos, fumaça intensa ou resgates físicos quando o perigo ambiental for relevante.',
    fixedSkills: ['Atletismo', 'Fortitude', 'Reflexos'],
    choiceCount: 1,
    choicePool: ['Medicina', 'Mecanica', 'Percepcao'],
  },
  {
    id: 'cacador',
    title: 'Caçador',
    subtitle: 'Especialista em rastrear pegadas, sangue, vegetação quebrada e silêncio incomum.',
    abilityName: 'Rastreador',
    abilityDescription: 'Determina direção e recência de rastros claros sem teste. Quando os sinais forem difíceis, recebe +2 no teste para rastreá-los.',
    fixedSkills: ['Sobrevivencia', 'Adestramento', 'Percepcao', 'Furtividade'],
    choiceCount: 0,
    choicePool: [],
  },
  {
    id: 'cientista',
    title: 'Cientista',
    subtitle: 'Laboratório, pesquisa de campo e método científico.',
    abilityName: 'Método Científico',
    abilityDescription: 'Após observar um fenômeno desconhecido por alguns minutos e formular uma hipótese verificável, receba +2 no primeiro teste de INT para investigá-lo.',
    fixedSkills: ['Ciencias', 'Investigacao'],
    choiceCount: 2,
    choicePool: ['Agricultura', 'Atualidades', 'Informatica', 'Medicina'],
  },
  {
    id: 'comerciante',
    title: 'Comerciante',
    subtitle: 'Compreende valor, escassez e o que o outro lado está disposto a entregar.',
    abilityName: 'Negociador',
    abilityDescription: 'Uma vez por negociação, após descobrir o que a outra parte quer ou teme perder, receba +2 em um teste de Diplomacia ou Enganação relacionado ao acordo.',
    fixedSkills: ['Diplomacia', 'Percepcao'],
    choiceCount: 2,
    choicePool: ['Atualidades', 'Enganacao', 'Lideranca'],
  },
  {
    id: 'cozinheiro',
    title: 'Cozinheiro',
    subtitle: 'Armazenamento, higiene, preparo e aproveitamento máximo de alimentos.',
    abilityName: 'Aproveitar Tudo',
    abilityDescription: 'Uma vez por cena de preparo com recursos limitados, aproveita partes descartadas para completar uma porção incompleta de alimento.',
    fixedSkills: ['Cozinha', 'Percepcao'],
    choiceCount: 2,
    choicePool: ['Agricultura', 'Ciencias', 'Fortitude', 'Sobrevivencia'],
  },
  {
    id: 'criminoso',
    title: 'Criminoso',
    subtitle: 'Furto, invasão, contrabando e percepção de vigilância.',
    abilityName: 'Mãos Leves',
    abilityDescription: 'Receba +2 em Crime para furtar objetos pequenos, ocultá-los no corpo ou manipular discretamente bolsos e compartimentos.',
    fixedSkills: ['Crime', 'Furtividade'],
    choiceCount: 2,
    choicePool: ['Enganacao', 'Intimidacao', 'Percepcao', 'Reflexos'],
  },
  {
    id: 'desgarrado',
    title: 'Desgarrado',
    subtitle: 'Acostumado a lugares temporários, pouco conforto e recursos escassos.',
    abilityName: 'Pouco é o Bastante',
    abilityDescription: 'A primeira vez a cada dia que falta de conforto, abrigo improvisado ou refeição ruim impuser penalidade circunstancial, reduza-a em 2.',
    fixedSkills: ['Sobrevivencia', 'Fortitude'],
    choiceCount: 2,
    choicePool: ['Furtividade', 'Percepcao', 'Crime', 'Vontade'],
  },
  {
    id: 'engenheiro',
    title: 'Engenheiro',
    subtitle: 'Estruturas, projetos, materiais e planejamento técnico.',
    abilityName: 'Projeto',
    abilityDescription: 'Quando planejar uma construção, reparo ou modificação antes do trabalho começar, escolha um participante para receber +2 no primeiro teste do projeto.',
    fixedSkills: ['Ciencias', 'Atualidades'],
    choiceCount: 2,
    choicePool: ['Informatica', 'Mecanica', 'Tatica'],
  },
  {
    id: 'escoteiro',
    title: 'Escoteiro',
    subtitle: 'Orientação, acampamento, primeiros cuidados e atividades ao ar livre.',
    abilityName: 'Sempre Preparado',
    abilityDescription: 'Quando tiver alguns minutos para preparar um acampamento ou abrigo temporário, receba +2 no teste principal relacionado ao local.',
    fixedSkills: ['Sobrevivencia', 'Adestramento'],
    choiceCount: 2,
    choicePool: ['Atletismo', 'Fortitude', 'Medicina', 'Percepcao', 'Vontade'],
  },
  {
    id: 'estudante',
    title: 'Estudante',
    subtitle: 'Escola, curso técnico ou faculdade; facilidade para absorver assuntos novos.',
    abilityName: 'Aprendizado Rápido',
    abilityDescription: 'Uma vez por sessão, após observar alguém realizar com sucesso uma tarefa em que você seja Destreinado, receba +2 na primeira tentativa semelhante.',
    fixedSkills: ['Atualidades', 'Investigacao'],
    choiceCount: 2,
    choicePool: ALL_SKILL_KEYS,
  },
  {
    id: 'ex-detento',
    title: 'Ex-Detento',
    subtitle: 'Aprendeu a observar antes de agir, perceber ameaça e controlar o que demonstra.',
    abilityName: 'Não Demonstre Fraqueza',
    abilityDescription: 'Uma vez por cena, quando sofrer tentativa de Intimidação ou coerção direta, receba +2 no teste para resistir.',
    fixedSkills: ['Crime', 'Intimidacao'],
    choiceCount: 2,
    choicePool: ['Enganacao', 'Fortitude', 'Luta', 'Percepcao', 'Vontade'],
  },
  {
    id: 'executivo',
    title: 'Executivo',
    subtitle: 'Coordenava pessoas, recursos e decisões sob pressão.',
    abilityName: 'Delegar',
    abilityDescription: 'Uma vez por cena, quando orientar claramente um aliado sobre uma tarefa que acompanha, ele recebe +2 no primeiro teste para executá-la.',
    fixedSkills: ['Lideranca', 'Diplomacia'],
    choiceCount: 2,
    choicePool: ['Atualidades', 'Enganacao', 'Investigacao', 'Tatica'],
  },
  {
    id: 'explorador',
    title: 'Explorador',
    subtitle: 'Trilhas, expedições e viagens longe da infraestrutura urbana.',
    abilityName: 'Acostumado ao Terreno',
    abilityDescription: 'Quando atravessar terreno natural difícil durante exploração ou viagem, receba +2 no primeiro teste para superar dificuldade do terreno.',
    fixedSkills: ['Sobrevivencia', 'Furtividade'],
    choiceCount: 2,
    choicePool: ['Acrobacia', 'Adestramento', 'Atletismo', 'Fortitude', 'Percepcao', 'Reflexos'],
  },
  {
    id: 'explorador-urbano',
    title: 'Explorador Urbano',
    subtitle: 'Prédios abandonados, acessos de manutenção e passagens secundárias.',
    abilityName: 'Entrada Alternativa',
    abilityDescription: 'Após examinar o exterior de uma construção, receba +2 no primeiro teste para encontrar passagem secundária ou entrada não evidente.',
    fixedSkills: ['Furtividade', 'Percepcao'],
    choiceCount: 2,
    choicePool: ['Acrobacia', 'Atletismo', 'Crime', 'Investigacao', 'Reflexos'],
  },
  {
    id: 'investigador',
    title: 'Investigador',
    subtitle: 'Procurar vestígios, comparar relatos e perceber inconsistências.',
    abilityName: 'Olhar Investigativo',
    abilityDescription: 'Após examinar cuidadosamente uma cena e ter sucesso em Investigação, pode fazer ao Mestre uma pergunta objetiva adicional sobre os vestígios.',
    fixedSkills: ['Investigacao', 'Percepcao'],
    choiceCount: 2,
    choicePool: ['Atualidades', 'Ciencias', 'Diplomacia', 'Vontade'],
  },
  {
    id: 'jornalista',
    title: 'Jornalista',
    subtitle: 'Entrevistas, fontes, apuração de rumores e comparação de versões.',
    abilityName: 'Fontes',
    abilityDescription: 'Em uma comunidade ou grupo organizado, após conversar com pessoas, receba +2 no primeiro teste para descobrir rumores ou quem possui uma informação.',
    fixedSkills: ['Investigacao', 'Diplomacia'],
    choiceCount: 2,
    choicePool: ['Atualidades', 'Enganacao', 'Lideranca', 'Percepcao', 'Vontade'],
  },
  {
    id: 'lutador',
    title: 'Lutador',
    subtitle: 'Artes marciais, boxe ou luta competitiva.',
    abilityName: 'Punhos Treinados',
    abilityDescription: 'Seus ataques desarmados causam 1d6 de dano e você pode utilizar FOR ou AGI em ataques desarmados.',
    fixedSkills: ['Luta', 'Atletismo'],
    choiceCount: 2,
    choicePool: ['Acrobacia', 'Fortitude', 'Intimidacao', 'Reflexos'],
  },
  {
    id: 'marinheiro',
    title: 'Marinheiro',
    subtitle: 'Navegação, manutenção e trabalho físico em embarcações.',
    abilityName: 'Homem do Mar',
    abilityDescription: 'Recebe +2 em testes diretamente relacionados à operação de embarcações, navegação aquática ou trabalho em condições marítimas.',
    fixedSkills: ['Pilotagem', 'Sobrevivencia'],
    choiceCount: 2,
    choicePool: ['Atletismo', 'Fortitude', 'Mecanica', 'Percepcao'],
  },
  {
    id: 'mecanico',
    title: 'Mecânico',
    subtitle: 'Motores, ferramentas, peças e diagnóstico de falhas.',
    abilityName: 'Gambiarra',
    abilityDescription: 'Ao realizar reparo temporário com ferramentas ou materiais inadequados, reduza em 2 uma penalidade circunstancial causada pela improvisação.',
    fixedSkills: ['Mecanica', 'Investigacao'],
    choiceCount: 2,
    choicePool: ['Ciencias', 'Pilotagem', 'Informatica', 'Percepcao'],
  },
  {
    id: 'medico',
    title: 'Médico',
    subtitle: 'Treinado para diagnosticar traumas graves e tratar pacientes sob pressão.',
    abilityName: 'Diagnóstico',
    abilityDescription: 'Após examinar um paciente por alguns minutos, determina sem teste a gravidade aparente de seus Ferimentos. Quando exigir teste de Medicina, recebe +2.',
    fixedSkills: ['Medicina', 'Ciencias'],
    choiceCount: 2,
    choicePool: ['Investigacao', 'Percepcao', 'Vontade', 'Diplomacia'],
  },
  {
    id: 'militar',
    title: 'Militar',
    subtitle: 'Disciplina, reação sob pressão, condicionamento e procedimentos táticos.',
    abilityName: 'Treinamento de Combate',
    abilityDescription: 'Você recebe +2 em Iniciativa na primeira rodada de um combate, desde que não esteja Surpreendido.',
    fixedSkills: ['Pontaria', 'Tatica'],
    choiceCount: 2,
    choicePool: ['Atletismo', 'Fortitude', 'Lideranca', 'Luta', 'Sobrevivencia'],
  },
  {
    id: 'motorista',
    title: 'Motorista',
    subtitle: 'Anos de experiência profissional nas ruas e estradas.',
    abilityName: 'Ao Volante',
    abilityDescription: 'Uma vez por cena, ao falhar em Pilotagem conduzindo veículo terrestre, reduz em um grau a consequência imediata da falha.',
    fixedSkills: ['Pilotagem', 'Reflexos'],
    choiceCount: 2,
    choicePool: ['Mecanica', 'Percepcao', 'Atualidades', 'Sobrevivencia'],
  },
  {
    id: 'nomade',
    title: 'Nômade',
    subtitle: 'Estradas, mudanças constantes e estadias temporárias.',
    abilityName: 'Na Estrada',
    abilityDescription: 'Durante viagens, receba +2 no primeiro teste da cena relacionado a escolher rota, reconhecer problema no trajeto ou achar local de parada.',
    fixedSkills: ['Sobrevivencia', 'Pilotagem'],
    choiceCount: 2,
    choicePool: ['Mecanica', 'Percepcao', 'Fortitude', 'Atualidades'],
  },
  {
    id: 'operario',
    title: 'Operário',
    subtitle: 'Construção, indústria, carga pesada e uso eficiente de ferramentas.',
    abilityName: 'Trabalho Pesado',
    abilityDescription: 'Receba +2 em testes de FOR para erguer, empurrar, puxar ou sustentar objetos quando utilizar postura e apoio adequados.',
    fixedSkills: ['Atletismo', 'Fortitude'],
    choiceCount: 2,
    choicePool: ['Mecanica', 'Luta', 'Percepcao', 'Profissao', 'Ciencias'],
  },
  {
    id: 'perito-criminal',
    title: 'Perito Criminal',
    subtitle: 'Sangue, posição de objetos e vestígios reconstrõem o que ninguém viu.',
    abilityName: 'Leitura da Cena',
    abilityDescription: 'Ao examinar cena com vestígios físicos de violência ou invasão, receba +2 no primeiro teste de Investigação para reconstruir o ocorrido.',
    fixedSkills: ['Investigacao', 'Ciencias'],
    choiceCount: 2,
    choicePool: ['Medicina', 'Percepcao', 'Crime', 'Atualidades'],
  },
  {
    id: 'policial',
    title: 'Policial',
    subtitle: 'Observar comportamento, abordar ameaças e reagir rapidamente à violência.',
    abilityName: 'Procedimento de Abordagem',
    abilityDescription: 'Ao iniciar interação com ameaça imediata, receba +2 no primeiro teste de Percepção, Diplomacia ou Intimidação antes do início de um combate.',
    fixedSkills: ['Percepcao', 'Pontaria'],
    choiceCount: 2,
    choicePool: ['Diplomacia', 'Intimidacao', 'Reflexos', 'Tatica', 'Luta'],
  },
  {
    id: 'professor',
    title: 'Professor',
    subtitle: 'Organizar informação, adaptar explicações e ensinar aliados.',
    abilityName: 'Ensinar',
    abilityDescription: 'Após 1 hora instruindo um aliado em uma Perícia na qual você seja Treinado/Especialista, ele recebe +2 no primeiro teste daquela Perícia no mesmo dia.',
    fixedSkills: ['Diplomacia', 'Lideranca'],
    choiceCount: 2,
    choicePool: ALL_SKILL_KEYS,
  },
  {
    id: 'profissional-ti',
    title: 'Profissional de TI',
    subtitle: 'Computadores, redes, bancos de dados e sistemas locais.',
    abilityName: 'Acesso de Emergência',
    abilityDescription: 'Ao tentar acessar sistema digital funcional sem credenciais, receba +2 no primeiro teste de Informática.',
    fixedSkills: ['Informatica', 'Investigacao'],
    choiceCount: 2,
    choicePool: ['Atualidades', 'Ciencias', 'Mecanica', 'Percepcao'],
  },
  {
    id: 'psicologo',
    title: 'Psicólogo',
    subtitle: 'Comportamento humano, escuta e manejo de traumas e Rupturas.',
    abilityName: 'Palavras de Conforto',
    abilityDescription: 'Durante cena adequada de recuperação de SAN, você pode trabalhar uma Ruptura de outro personagem, concedendo 1 Progresso para superá-la.',
    fixedSkills: ['Diplomacia', 'Vontade'],
    choiceCount: 2,
    choicePool: ['Lideranca', 'Percepcao', 'Ciencias', 'Investigacao'],
  },
  {
    id: 'religioso',
    title: 'Religioso',
    subtitle: 'Fé, tradição, liderança espiritual e amparo diante do desespero.',
    abilityName: 'Proteção Divina',
    abilityDescription: 'Uma vez por cena, quando você ou um aliado próximo fizer teste de Vontade contra medo ou desespero, ofereça palavras/oração para conceder +2.',
    fixedSkills: ['Religiao', 'Vontade'],
    choiceCount: 2,
    choicePool: ['Diplomacia', 'Lideranca', 'Atualidades', 'Percepcao'],
  },
  {
    id: 'sobrevivencialista',
    title: 'Sobrevivencialista',
    subtitle: 'Preparava-se para o colapso da infraestrutura antes mesmo de acontecer.',
    abilityName: 'Preparado para Isso',
    abilityDescription: 'Uma vez por cena de exploração/viagem, pode declarar que trouxe um item pequeno e comum de sobrevivência, desde que caiba no inventário.',
    fixedSkills: ['Sobrevivencia', 'Vontade'],
    choiceCount: 2,
    choicePool: ['Adestramento', 'Agricultura', 'Fortitude', 'Medicina', 'Mecanica', 'Pontaria', 'Tatica'],
  },
  {
    id: 'socorrista',
    title: 'Socorrista',
    subtitle: 'Treinado para os primeiros minutos críticos de uma emergência.',
    abilityName: 'Primeiros Minutos',
    abilityDescription: 'Na primeira vez em uma cena que realizar Medicina para estabilizar ou atender alguém recém-ferido, receba +2.',
    fixedSkills: ['Medicina', 'Reflexos'],
    choiceCount: 2,
    choicePool: ['Atletismo', 'Fortitude', 'Percepcao', 'Pilotagem'],
  },
  {
    id: 'tecnico',
    title: 'Técnico',
    subtitle: 'Instalação, manutenção prática, diagnóstico e reparo de equipamentos.',
    abilityName: 'Manutenção Preventiva',
    abilityDescription: 'Após inspecionar um equipamento com ferramentas adequadas, receba +2 no primeiro teste relacionado a falha mecânica ou elétrica dele na cena.',
    fixedSkills: ['Mecanica'],
    choiceCount: 3,
    choicePool: ['Ciencias', 'Informatica', 'Investigacao', 'Percepcao', 'Atletismo', 'Fortitude'],
  },
  {
    id: 'trabalhador-rural',
    title: 'Trabalhador Rural',
    subtitle: 'Plantio, manejo de solo, ferramentas e criação de animais.',
    abilityName: 'Vida no Campo',
    abilityDescription: 'Receba +2 em testes relacionados diretamente ao cultivo, manejo de plantações, avaliação de solo ou cuidado rotineiro de animais.',
    fixedSkills: ['Agricultura', 'Adestramento'],
    choiceCount: 2,
    choicePool: ['Sobrevivencia', 'Fortitude', 'Mecanica', 'Percepcao', 'Medicina'],
  },
  {
    id: 'veterinario',
    title: 'Veterinário',
    subtitle: 'Reconhecer doença, trauma e dor em animais domésticos ou fauna.',
    abilityName: 'Medicina Animal',
    abilityDescription: 'Pode utilizar Medicina em animais sem penalidade e recebe +2 para reconhecer doenças, Ferimentos e sinais de dor em animais.',
    fixedSkills: ['Medicina', 'Adestramento'],
    choiceCount: 2,
    choicePool: ['Ciencias', 'Percepcao', 'Agricultura', 'Sobrevivencia'],
  },
  {
    id: 'vida-nas-ruas',
    title: 'Vida nas Ruas',
    subtitle: 'Conhecia abrigos improvisados, horários e redes informais da cidade.',
    abilityName: 'Onde Ninguém Olha',
    abilityDescription: 'Quando procurar abrigo discreto, passagem esquecida ou pequenos recursos em ambiente urbano, receba +2 em Percepção ou Sobrevivência.',
    fixedSkills: ['Furtividade', 'Percepcao'],
    choiceCount: 2,
    choicePool: ['Crime', 'Sobrevivencia', 'Diplomacia', 'Fortitude', 'Atualidades'],
  },
  {
    id: 'vitima',
    title: 'Vítima',
    subtitle: 'Sobreviveu a uma experiência extrema antes mesmo do apocalipse.',
    abilityName: 'Já Passei por Pior',
    abilityDescription: 'Uma vez por sessão, após falhar em um teste de Vontade ou Fortitude provocado por dor, medo ou trauma, você pode repetir o teste.',
    fixedSkills: ['Vontade', 'Fortitude'],
    choiceCount: 2,
    choicePool: ALL_SKILL_KEYS,
  },
];

// ============================================================================
// 3. TIPOS DE MOCHILAS OFICIAIS (Capítulo 15, pág. 127)
// ============================================================================
export interface BackpackDefinition {
  id: string;
  name: string;
  cols: number;
  rows: number;
  specialFeature: string;
}

export const ANE_BACKPACKS: BackpackDefinition[] = [
  { id: 'esportiva', name: 'Mochila Esportiva', cols: 8, rows: 1, specialFeature: 'Compacta (8×1)' },
  { id: 'escolar', name: 'Mochila Escolar', cols: 8, rows: 2, specialFeature: 'Pequena (8×2)' },
  { id: 'comum', name: 'Mochila Comum', cols: 8, rows: 3, specialFeature: 'Uso geral (8×3)' },
  { id: 'medica', name: 'Mochila Médica', cols: 8, rows: 3, specialFeature: '8×3 + Compartimento Médico 3×2' },
  { id: 'trilha', name: 'Mochila de Trilha', cols: 8, rows: 4, specialFeature: '8×4 + 2L de Hidratação (4 Porções)' },
  { id: 'militar', name: 'Mochila Militar', cols: 8, rows: 4, specialFeature: '8×4 + Suporte de Arma e 3 PM' },
  { id: 'expedicao', name: 'Mochila de Expedição', cols: 8, rows: 6, specialFeature: '8×6 + Suporte p/ Barraca e Saco de Dormir' },
];

// ============================================================================
// 4. BESTIÁRIO OFICIAL: OS 10 INFECTADOS (Capítulo 20, págs. 176–178)
// ============================================================================
export interface InfectedTemplate {
  id: string;
  name: string;
  pv: number;
  def: number;
  mov: string;
  ini: number;
  attr_for: number;
  attr_agi: number;
  attr_pre: number;
  attr_vig: number;
  photosensitive: boolean;
  skillsSummary: string;
  attacksSummary: string;
  abilitiesSummary: string;
}

export const ANE_INFECTED_TEMPLATES: InfectedTemplate[] = [
  {
    id: 'infectado-comum',
    name: 'Infectado Comum',
    pv: 24,
    def: 10,
    mov: '6 m',
    ini: 0,
    attr_for: 3,
    attr_agi: 1,
    attr_pre: 1,
    attr_vig: 3,
    photosensitive: false,
    skillsSummary: 'Percepção +2, Fortitude +5, Luta +2',
    attacksSummary: 'Golpe: 1d6+2 Impacto | Mordida: 1d8+2 (exige oportunidade)',
    abilitiesSummary: 'Persistente • Estímulo Simples • Mordedor (tende a Agarrar antes de morder)',
  },
  {
    id: 'infectado-recente',
    name: 'Infectado Recente',
    pv: 28,
    def: 12,
    mov: '9 m',
    ini: 2,
    attr_for: 3,
    attr_agi: 2,
    attr_pre: 1,
    attr_vig: 3,
    photosensitive: false,
    skillsSummary: 'Percepção +2, Fortitude +5, Luta +2, Reflexos +2',
    attacksSummary: 'Golpe: 1d6+2 Impacto | Mordida: 1d8+2',
    abilitiesSummary: 'Coordenação Residual • Impulso Violento (+2 para Agarrar na 1ª rodada)',
  },
  {
    id: 'corredor',
    name: 'Corredor',
    pv: 28,
    def: 13,
    mov: '12 m',
    ini: 3,
    attr_for: 3,
    attr_agi: 3,
    attr_pre: 1,
    attr_vig: 2,
    photosensitive: false,
    skillsSummary: 'Percepção +2, Luta +2, Reflexos +5',
    attacksSummary: 'Golpe: 1d6+2 Impacto | Mordida: 1d8+2',
    abilitiesSummary: 'Arrancada (Move até 24m como Ação Completa e tenta Agarrar) • Impaciente',
  },
  {
    id: 'rastejante',
    name: 'Rastejante',
    pv: 20,
    def: 12,
    mov: '6 m',
    ini: 1,
    attr_for: 2,
    attr_agi: 2,
    attr_pre: 1,
    attr_vig: 2,
    photosensitive: false,
    skillsSummary: 'Furtividade +2, Percepção +2, Luta +2',
    attacksSummary: 'Garra Baixa: 1d6+1 Impacto | Mordida: 1d8+1',
    abilitiesSummary: 'Ataque às Pernas (Pode abrir mão do dano para Derrubar) • Perfil Baixo',
  },
  {
    id: 'bruto',
    name: 'Bruto',
    pv: 55,
    def: 11,
    mov: '6 m',
    ini: -1,
    attr_for: 5,
    attr_agi: 1,
    attr_pre: 1,
    attr_vig: 5,
    photosensitive: false,
    skillsSummary: 'Fortitude +5, Luta +5, Percepção +0',
    attacksSummary: 'Golpe Pesado: 2d8+4 Impacto | Esmagar (alvo agarrado): 2d6+4 Impacto',
    abilitiesSummary: 'Massa (+2 resistir Derrubar/Arrastar) • Força Bruta (Destrói portas e barricadas)',
  },
  {
    id: 'gritador',
    name: 'Gritador',
    pv: 22,
    def: 11,
    mov: '6 m',
    ini: 1,
    attr_for: 2,
    attr_agi: 1,
    attr_pre: 3,
    attr_vig: 2,
    photosensitive: false,
    skillsSummary: 'Percepção +5, Vontade +2',
    attacksSummary: 'Golpe: 1d6 Impacto | Grito (Ação Padrão — Som Extremo)',
    abilitiesSummary: 'Grito (Atrai infectados existentes na região) • Alerta Instintivo',
  },
  {
    id: 'inchado',
    name: 'Inchado',
    pv: 36,
    def: 10,
    mov: '6 m',
    ini: -1,
    attr_for: 3,
    attr_agi: 1,
    attr_pre: 1,
    attr_vig: 4,
    photosensitive: false,
    skillsSummary: 'Fortitude +5, Percepção +0',
    attacksSummary: 'Golpe: 1d6+2 Impacto | Ruptura Contaminada (Especial)',
    abilitiesSummary: 'Ruptura Contaminada (Ao sofrer Ferimento Crítico no Torso ou ser destruído, espalha fluido contaminado)',
  },
  {
    id: 'cuspidor',
    name: 'Cuspidor',
    pv: 26,
    def: 12,
    mov: '6 m',
    ini: 2,
    attr_for: 2,
    attr_agi: 2,
    attr_pre: 2,
    attr_vig: 2,
    photosensitive: false,
    skillsSummary: 'Pontaria +2, Percepção +2, Reflexos +2',
    attacksSummary: 'Golpe: 1d6 Impacto | Cuspe Contaminado (Pontaria a curta distância)',
    abilitiesSummary: 'Cuspe Contaminado (Exposição à Infecção à distância) • Recuo Instintivo',
  },
  {
    id: 'espreitador',
    name: 'Espreitador',
    pv: 32,
    def: 14,
    mov: '9 m',
    ini: 5,
    attr_for: 3,
    attr_agi: 4,
    attr_pre: 3,
    attr_vig: 3,
    photosensitive: true,
    skillsSummary: 'Furtividade +5, Percepção +5, Luta +5, Reflexos +5',
    attacksSummary: 'Garra: 1d8+2 | Mordida: 1d8+2',
    abilitiesSummary: 'Fotossensível (Repelido por UV; 2d10/4d10 ao sol) • Bote • Caçador de Oportunidade',
  },
  {
    id: 'predador-noturno',
    name: 'Predador Noturno',
    pv: 65,
    def: 15,
    mov: '12 m',
    ini: 6,
    attr_for: 5,
    attr_agi: 4,
    attr_pre: 4,
    attr_vig: 5,
    photosensitive: true,
    skillsSummary: 'Furtividade +5, Fortitude +5, Luta +5, Percepção +5, Reflexos +5',
    attacksSummary: 'Garras: 2d8+3 | Mordida: 2d10+3',
    abilitiesSummary: 'Fotossensível (Repelido por UV; 2d10/4d10 ao sol) • Salto Predatório (12m + Agarrar e Derrubar) • Caçador Alfa',
  },
];

// ============================================================================
// 5. AS 18 CONDIÇÕES DO APÊNDICE A (págs. 246–247)
// ============================================================================
export interface ConditionInfo {
  id: string;
  name: string;
  summary: string;
}

export const ANE_CONDITIONS: ConditionInfo[] = [
  { id: 'caido', name: 'Caído', summary: 'Mov. metade; ataques corpo a corpo contra você +2; seus ataques à distância -2.' },
  { id: 'desprevenido', name: 'Desprevenido', summary: '-2 DEF contra ataques da ameaça que não percebeu.' },
  { id: 'vulneravel', name: 'Vulnerável', summary: '-2 DEF.' },
  { id: 'imovel', name: 'Imóvel', summary: 'Movimento 0.' },
  { id: 'atordoado', name: 'Atordoado', summary: 'Não usa Reações; -2 em testes.' },
  { id: 'indefeso', name: 'Indefeso', summary: 'DEF é 5; não usa Reações; exposto a Mordidas.' },
  { id: 'inconsciente', name: 'Inconsciente', summary: 'Indefeso, Caído, sem ações ou Reações.' },
  { id: 'cego', name: 'Cego', summary: 'Falha em tarefas visuais; -5 em ataques e Percepção visual; -2 DEF.' },
  { id: 'ofuscado', name: 'Ofuscado', summary: '-2 em ataques e Percepção visual.' },
  { id: 'surdo', name: 'Surdo', summary: 'Falha em audição; -2 na Iniciativa dependente de som.' },
  { id: 'lento', name: 'Lento', summary: 'Movimento reduzido à metade.' },
  { id: 'enredado', name: 'Enredado', summary: 'Fica Lento e sofre -2 em testes de AGI.' },
  { id: 'paralisado', name: 'Paralisado', summary: 'Imóvel, Indefeso, sem ações físicas ou Reações.' },
  { id: 'asfixiado', name: 'Asfixiado', summary: '-2 em FOR e AGI; não recupera PV com Descanso.' },
  { id: 'cercado', name: 'Cercado', summary: 'Rotas bloqueadas; precisa abrir caminho ou escapar.' },
  { id: 'pendurado', name: 'Pendurado', summary: 'Sem Mov. normal; -2 em testes físicos; mãos ocupadas.' },
  { id: 'em-chamas', name: 'Em Chamas', summary: '1d6 dano de Fogo no fim do turno (ignora PR). Apagar: Ação Completa + AGI + Reflexos DT 10.' },
  { id: 'agarrado', name: 'Agarrado', summary: 'Movimento 0; -2 DEF contra terceiros; cria oportunidade de Mordida.' },
];

// ============================================================================
// 6. HELPERS DE ESTÁGIOS DE INFECÇÃO E SANIDADE (Capítulos 13 e 14)
// ============================================================================
export function getInfectionStageInfo(pct: number) {
  if (pct >= 100) {
    return {
      stage: 'Transformação (100%)',
      forBonus: 3,
      intPenalty: -5,
      socialPenalty: -5,
      description: 'Ponto sem retorno (1d6 horas até controle do Mestre).',
    };
  }
  if (pct >= 80) {
    return {
      stage: 'Terminal (80–99%)',
      forBonus: 3,
      intPenalty: -5,
      socialPenalty: -5,
      description: '+3 FOR | -5 INT | -5 Diplomacia/Liderança | 1 Porção/6h | Sono Precário',
    };
  }
  if (pct >= 60) {
    return {
      stage: 'Avançado (60–79%)',
      forBonus: 2,
      intPenalty: -2,
      socialPenalty: -2,
      description: '+2 FOR | -2 INT | -2 Diplomacia/Liderança | 1 Porção/6h | Sono exige 8h',
    };
  }
  if (pct >= 40) {
    return {
      stage: 'Infectado (40–59%)',
      forBonus: 2,
      intPenalty: 0,
      socialPenalty: 0,
      description: '+2 FOR | 1 Porção a cada 6h | Compulsão por Carne Crua (Vontade DT 15)',
    };
  }
  if (pct >= 20) {
    return {
      stage: 'Contaminado (20–39%)',
      forBonus: 1,
      intPenalty: 0,
      socialPenalty: 0,
      description: '+1 em testes de FOR. Sinais iniciais discretos.',
    };
  }
  return {
    stage: 'Estável (0–19%)',
    forBonus: 0,
    intPenalty: 0,
    socialPenalty: 0,
    description: 'Sem alterações mecânicas.',
  };
}

export function getSanityStateInfo(sanCurrent: number, sanMax: number) {
  if (sanCurrent <= 0) {
    return { state: 'Insano', color: 'text-primary-blood', desc: '0 SAN — Ruptura Final (Role 2d20)!' };
  }
  const ratio = sanCurrent / Math.max(1, sanMax);
  if (ratio <= 0.25) {
    return { state: 'Colapso', color: 'text-primary-blood', desc: 'Fragilidade extrema; próximo de 0 SAN.' };
  }
  if (ratio <= 0.5) {
    return { state: 'Perturbado', color: 'text-warning-rust', desc: 'Desgaste severo; entrar aqui gera Ruptura.' };
  }
  if (ratio <= 0.75) {
    return { state: 'Abalado', color: 'text-warning-rust', desc: 'Pressão acumulada; entrar aqui gera Ruptura.' };
  }
  return { state: 'Estável', color: 'text-secondary-uv', desc: 'Funcionamento psicológico preservado.' };
}

// ============================================================================
// 7. HABILIDADES GERAIS OFICIAIS (Para adicionar à Ficha e Mostrar no Chat)
// ============================================================================
export interface GeneralAbilityInfo {
  id: string;
  name: string;
  category: 'Combate' | 'Sobrevivência' | 'Medicina & Ciência' | 'Furtividade & Mobilidade' | 'Mental & Liderança';
  prerequisite: string;
  description: string;
}

export const ANE_GENERAL_ABILITIES: GeneralAbilityInfo[] = [
  {
    id: 'golpe-brutal',
    name: 'Golpe Brutal',
    category: 'Combate',
    prerequisite: 'FOR 2, Luta Treinado',
    description: 'Seus ataques corpo a corpo com armas de duas mãos ou contundentes causam +2 de dano e aumentam em +1 a dificuldade para o alvo resistir a Derrubar.',
  },
  {
    id: 'tiro-preciso',
    name: 'Tiro Preciso',
    category: 'Combate',
    prerequisite: 'AGI 2, Pontaria Treinado',
    description: 'Quando realiza a ação Mirar antes de disparar, além do bônus normal, você ignora penalidades de cobertura leve e recebe +2 no dano do disparo.',
  },
  {
    id: 'reflexo-de-combate',
    name: 'Reflexo de Combate',
    category: 'Combate',
    prerequisite: 'AGI 2, Reflexos Treinado',
    description: 'Na primeira rodada de qualquer combate, você recebe +2 na Iniciativa e pode sacar uma arma como Ação Livre mesmo se estiver Desprevenido.',
  },
  {
    id: 'combate-aproximado',
    name: 'Combate Aproximado',
    category: 'Combate',
    prerequisite: 'FOR 2 ou AGI 2, Luta Treinado',
    description: 'Você recebe +2 para escapar de Agarrar e, quando um infectado erra uma tentativa de Agarrar contra você, ele fica Vulnerável contra seu próximo golpe.',
  },
  {
    id: 'cirurgiao-de-campo',
    name: 'Cirurgião de Campo',
    category: 'Medicina & Ciência',
    prerequisite: 'INT 2, Medicina Treinado',
    description: 'Ao realizar Primeiros Socorros ou Estancar Sangramento com suprimento médico, você soma seu INT aos PV recuperados e reduz a DT de tratamento em 2.',
  },
  {
    id: 'protocolo-de-descontaminacao',
    name: 'Protocolo de Descontaminação',
    category: 'Medicina & Ciência',
    prerequisite: 'INT 2, Ciência ou Medicina Treinado',
    description: 'Quando limpa uma ferida imediatamente após exposição a sangue ou mordida superficial, reduz o ganho de Infecção em 5% (mínimo 1%).',
  },
  {
    id: 'improvisador-nato',
    name: 'Improvisador Nato',
    category: 'Sobrevivência',
    prerequisite: 'INT 2, Fabricação Treinado',
    description: 'Você cria itens improvisados (bandagens, tochas, barricadas leves) na metade do tempo e gasta 1 material básico a menos uma vez por cena.',
  },
  {
    id: 'estomago-de-ferro',
    name: 'Estômago de Ferro',
    category: 'Sobrevivência',
    prerequisite: 'VIG 2, Fortitude Treinado',
    description: 'Você recebe +5 em testes de Fortitude contra água/comida duvidosa, toxinas e fumaça, e demora +4 horas antes de sofrer efeitos de Fome.',
  },
  {
    id: 'passo-fantasma',
    name: 'Passo Fantasma',
    category: 'Furtividade & Mobilidade',
    prerequisite: 'AGI 2, Furtividade Treinado',
    description: 'Você pode se mover em deslocamento normal enquanto Furtivo sem sofrer a penalidade padrão de velocidade.',
  },
  {
    id: 'corredor-de-telhados',
    name: 'Corredor de Telhados',
    category: 'Furtividade & Mobilidade',
    prerequisite: 'AGI 2, Acrobacia e Atletismo Treinados',
    description: 'Reduz o dano de quedas em 2d6 e recebe +2 em testes de Perseguição em ambientes urbanos com obstáculos.',
  },
  {
    id: 'manejo-ultravioleta',
    name: 'Manejo Ultravioleta',
    category: 'Sobrevivência',
    prerequisite: 'Percepção ou Sobrevivência Treinado',
    description: 'Ao usar lanternas ou sinalizadores UV contra criaturas Fotossensíveis, você otimiza a bateria/carga e impõe -2 adicional no ataque da criatura.',
  },
  {
    id: 'sangue-frio',
    name: 'Sangue Frio',
    category: 'Mental & Liderança',
    prerequisite: 'PRE 2, Vontade Treinado',
    description: 'Uma vez por cena, ao sofrer perda de Sanidade (SAN), você reduz a perda em um valor igual ao seu PRE + 2.',
  },
  {
    id: 'voz-de-comando',
    name: 'Voz de Comando',
    category: 'Mental & Liderança',
    prerequisite: 'PRE 2, Liderança Treinado',
    description: 'Como Ação de Movimento, escolha um aliado que possa ouvir você; ele recebe +2 no próximo teste de ataque ou Vontade até o fim do turno dele.',
  },
];

