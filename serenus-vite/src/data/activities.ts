export interface ActivityStep {
  title: string
  instruction: string
  duration?: string
  tip?: string
}

export interface Activity {
  id: string
  title: string
  duration: string
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink'
  description: string
  intro: string
  steps: ActivityStep[]
  benefits: string[]
}

export const activities: Record<string, Activity> = {
  breathing: {
    id: 'breathing',
    title: 'Respiração Consciente',
    duration: '3-10 min',
    icon: '🌬️',
    color: 'green',
    description: 'Uma técnica simples e poderosa para acalmar a mente e o corpo através da respiração intencional.',
    intro: 'Apenas você e um lugar tranquilo. Pode ser sentada ou deitada, o importante é estar confortável.',
    steps: [
      {
        title: 'Encontre sua posição',
        instruction: 'Sente-se confortavelmente ou deite-se. Coloque uma mão no peito e outra na barriga.',
        tip: 'Não precisa ser perfeito. O importante é estar confortável.'
      },
      {
        title: 'Observe sua respiração natural',
        instruction: 'Apenas observe como você está respirando agora, sem mudar nada. Note o ar entrando e saindo.',
        duration: '30 segundos',
        tip: 'Não force. Apenas observe com curiosidade.'
      },
      {
        title: 'Respire pelo nariz',
        instruction: 'Inspire suavemente pelo nariz contando até 4. Sinta o ar enchendo seus pulmões.',
        duration: '4 segundos',
        tip: 'Imagine que você está cheirando uma flor.'
      },
      {
        title: 'Segure gentilmente',
        instruction: 'Segure a respiração por 4 segundos. Não force, apenas uma pausa natural.',
        duration: '4 segundos',
        tip: 'Se sentir desconforto, segure menos tempo.'
      },
      {
        title: 'Expire devagar',
        instruction: 'Solte o ar pela boca contando até 6. Deixe ir toda a tensão junto com o ar.',
        duration: '6 segundos',
        tip: 'Expire como se estivesse soprando uma vela suavemente.'
      },
      {
        title: 'Continue o ciclo',
        instruction: 'Repita este ciclo por alguns minutos. Inspire (4), segure (4), expire (6).',
        duration: '2-5 minutos',
        tip: 'Sua mente vai vagar, e está tudo bem. Quando perceber, volte para a respiração.'
      },
      {
        title: 'Finalize com calma',
        instruction: 'Volte à respiração natural. Note como seu corpo se sente agora. Abra os olhos devagar.',
        tip: 'Não se levante rápido. Permita-se alguns momentos para voltar.'
      }
    ],
    benefits: [
      'Reduz ansiedade e estresse imediatamente',
      'Melhora o foco e clareza mental',
      'Acalma o sistema nervoso'
    ]
  },

  meditation: {
    id: 'meditation',
    title: 'Meditação Guiada',
    duration: '5-15 min',
    icon: '🧘‍♀️',
    color: 'blue',
    description: 'Uma prática de atenção plena para conectar você com o momento presente e cultivar paz interior.',
    intro: 'Você vai precisar de um lugar silencioso e alguns minutos sem interrupções. Pode usar fones de ouvido se quiser.',
    steps: [
      {
        title: 'Prepare seu espaço',
        instruction: 'Encontre um lugar tranquilo. Sente-se confortavelmente com a coluna reta mas relaxada.',
        tip: 'Pode sentar em uma cadeira, almofada ou no chão. O importante é estar confortável.'
      },
      {
        title: 'Ajuste sua postura',
        instruction: 'Apoie as mãos nas coxas ou no colo. Relaxe os ombros. Deixe o queixo levemente inclinado para baixo.',
        tip: 'Imagine um fio puxando suavemente o topo da sua cabeça para cima.'
      },
      {
        title: 'Feche os olhos',
        instruction: 'Suavemente, deixe suas pálpebras se fecharem. Ou, se preferir, mantenha o olhar baixo e suave.',
        tip: 'Não force. Se sentir desconforto de olhos fechados, mantenha-os entreabertos.'
      },
      {
        title: 'Escaneie seu corpo',
        instruction: 'Leve sua atenção para cada parte do corpo, dos pés à cabeça. Note sensações sem julgar.',
        duration: '1-2 minutos',
        tip: 'Onde há tensão, imagine que está respirando para essa área.'
      },
      {
        title: 'Foque na respiração',
        instruction: 'Leve sua atenção para a respiração. Observe o ar entrando e saindo. Não precisa mudar nada.',
        duration: '3-5 minutos',
        tip: 'Quando a mente vagar (e ela VAI vagar), volte gentilmente para a respiração.'
      },
      {
        title: 'Abrace os pensamentos',
        instruction: 'Pensamentos vão surgir. Não lute contra eles. Apenas observe e deixe passar, como nuvens no céu.',
        tip: 'Você não está tentando "não pensar". Está apenas observando sem se prender.'
      },
      {
        title: 'Amplie sua consciência',
        instruction: 'Amplie sua atenção para sons ao redor, sensações do corpo, e simplesmente "seja" aqui e agora.',
        duration: '2-3 minutos'
      },
      {
        title: 'Retorne gentilmente',
        instruction: 'Aos poucos, traga movimento aos dedos e ao corpo. Abra os olhos devagar. Sorria para si mesma.',
        tip: 'Não tenha pressa. Aprecie este momento de paz que você criou.'
      }
    ],
    benefits: [
      'Reduz estresse e ansiedade a longo prazo',
      'Melhora concentração e memória',
      'Aumenta autoconhecimento e compaixão'
    ]
  },

  mindful: {
    id: 'mindful',
    title: 'Pausa Mindful',
    duration: '2-5 min',
    icon: '🌸',
    color: 'purple',
    description: 'Uma pausa rápida e consciente para reconectar com o momento presente, ideal para qualquer hora do dia.',
    intro: 'Você pode fazer isso em qualquer lugar - no trabalho, em casa, até na fila do mercado!',
    steps: [
      {
        title: 'Pause tudo',
        instruction: 'Pare o que estiver fazendo. Largue o celular, afaste-se da tela. Este momento é só seu.',
        tip: 'Se estiver trabalhando, minimize as janelas. Crie uma pausa real.'
      },
      {
        title: 'Respire fundo 3 vezes',
        instruction: 'Inspire profundamente pelo nariz, expire pela boca. Faça isso 3 vezes, bem devagar.',
        duration: '30 segundos',
        tip: 'Coloque toda sua atenção nessas 3 respirações.'
      },
      {
        title: 'Técnica 5-4-3-2-1',
        instruction: '5 coisas que VEJO, 4 que TOCO, 3 que OUÇO, 2 que CHEIRO, 1 que SINTO no corpo.',
        duration: '2 minutos',
        tip: 'Não corra. Realmente observe cada coisa com curiosidade.'
      },
      {
        title: 'Observe sem julgar',
        instruction: 'Note seus pensamentos e emoções neste momento. Não são bons nem ruins, apenas são.',
        duration: '1 minuto',
        tip: '"Estou sentindo ansiedade" em vez de "Não deveria estar ansioso"'
      },
      {
        title: 'Escolha intencional',
        instruction: 'Pergunte-se: "O que EU preciso agora?" e "Como quero me sentir?". Respire e retorne.',
        tip: 'Você sempre tem a escolha de como responder ao momento.'
      }
    ],
    benefits: [
      'Reduz reatividade emocional',
      'Aumenta clareza mental rapidamente',
      'Ajuda a lidar com momentos difíceis'
    ]
  },

  journaling: {
    id: 'journaling',
    title: 'Escrita Terapêutica',
    duration: '10-20 min',
    icon: '📖',
    color: 'orange',
    description: 'Escrita livre e sem julgamento para processar emoções, pensamentos e ganhar clareza sobre si mesma.',
    intro: 'Pegue um caderno (ou abra um documento), uma caneta, e prepare-se para um encontro com você mesma.',
    steps: [
      {
        title: 'Prepare o ambiente',
        instruction: 'Encontre um lugar confortável e privado. Pegue seu caderno ou abra um documento no computador.',
        tip: 'Este é um momento sagrado só seu. Garanta que não será interrompida.'
      },
      {
        title: 'Respire e chegue',
        instruction: 'Antes de começar, feche os olhos e respire fundo 3 vezes. Chegue verdadeiramente aqui.',
        duration: '30 segundos',
        tip: 'Deixe as preocupações do dia de lado. Agora é momento de voltar para si.'
      },
      {
        title: 'Escreva data e hora',
        instruction: 'Anote a data, hora, e onde você está. Isso cria um marco temporal do seu momento.',
        tip: 'No futuro, você vai poder revisitar este momento e ver sua evolução.'
      },
      {
        title: 'Comece com um prompt',
        instruction: 'Escolha um: "Agora estou sentindo..." ou "O que mais pesa em mim hoje é..." ou "Gostaria de..."',
        tip: 'Não pense muito. Escolha o primeiro que ressoar com você.'
      },
      {
        title: 'Escreva livremente',
        instruction: 'Escreva sem parar por 5-10 minutos. Não corrija, não julgue, não censure. Apenas escreva.',
        duration: '5-10 minutos',
        tip: 'Não existe certo ou errado. Se travar, escreva "não sei o que escrever" até algo vir.'
      },
      {
        title: 'Explore as camadas',
        instruction: 'Releia o que escreveu. Pergunte: "E por baixo disso, o que tem?" Escreva mais se quiser.',
        duration: '3-5 minutos',
        tip: 'Às vezes a primeira camada esconde emoções mais profundas.'
      },
      {
        title: 'Finalize com gratidão ou intenção',
        instruction: 'Termine com: 3 gratidões do dia OU uma intenção de como quer se sentir amanhã.',
        tip: 'Isso ajuda a fechar o processo com uma nota positiva.'
      },
      {
        title: 'Honre seu processo',
        instruction: 'Feche o caderno ou arquivo. Respire fundo. Agradeça a si mesma por esse tempo de autocuidado.',
        tip: 'Você acabou de fazer algo muito importante por você. Celebre isso!'
      }
    ],
    benefits: [
      'Processa emoções difíceis de forma saudável',
      'Aumenta autoconhecimento profundo',
      'Reduz rumor mental e ansiedade'
    ]
  },

  grounding: {
    id: 'grounding',
    title: 'Técnica de Ancoragem',
    duration: '3-7 min',
    icon: '🌿',
    color: 'green',
    description: 'Práticas de grounding para quando você se sentir desconectada, ansiosa ou sobrecarregada.',
    intro: 'Ideal para momentos de ansiedade, pânico ou quando sentir que está "saindo do corpo".',
    steps: [
      {
        title: 'Reconheça o momento',
        instruction: 'Perceba que você está se sentindo desconectada ou ansiosa. Isso já é um grande passo.',
        tip: 'Diga para si: "Estou me sentindo [emoção] e está tudo bem. Vou me ancorar."'
      },
      {
        title: 'Plante os pés no chão',
        instruction: 'Se estiver sentada, coloque os dois pés firmes no chão. Se em pé, sinta seu peso sendo sustentado.',
        tip: 'Imagine raízes crescendo dos seus pés para dentro da terra.'
      },
      {
        title: 'Pressione e solte',
        instruction: 'Pressione os pés com força no chão por 5 segundos. Solte. Repita 3 vezes.',
        duration: '30 segundos',
        tip: 'Sinta a firmeza do chão sustentando você. Você está segura.'
      },
      {
        title: 'Toque texturas',
        instruction: 'Toque algo perto de você - mesa, roupa, parede. Sinta a textura, temperatura, peso.',
        duration: '1 minuto',
        tip: 'Descreva mentalmente: "Isso é liso/áspero/quente/frio..."'
      },
      {
        title: 'Use água fria',
        instruction: 'Se possível, lave o rosto ou punhos com água fria. Ou segure algo gelado nas mãos.',
        tip: 'O frio "acorda" o sistema nervoso e traz você de volta ao corpo.'
      },
      {
        title: 'Nomeie 5 coisas',
        instruction: '5 coisas que vê, 5 que ouve, 5 que pode tocar. Diga em voz alta ou mentalmente.',
        duration: '2 minutos',
        tip: 'Isso tira você da mente e traz para o presente sensorial.'
      },
      {
        title: 'Afirmação de presença',
        instruction: 'Diga: "Eu estou aqui. Eu estou segura. Este momento vai passar. Eu posso com isso."',
        tip: 'Repita quantas vezes precisar. Sua voz é uma âncora poderosa.'
      }
    ],
    benefits: [
      'Alivia crises de ansiedade e pânico',
      'Reconecta você com o corpo e presente',
      'Cria sensação de segurança e controle'
    ]
  }
}
