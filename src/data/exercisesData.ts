import { Exercise } from '../types';

export interface LearningTracks {
  kids: {
    level_1: Exercise[];
    level_2: Exercise[];
    level_3: Exercise[];
  };
  elderly: {
    level_1: Exercise[];
    level_2: Exercise[];
    level_3: Exercise[];
  };
}

export const exercisesData: LearningTracks = {
  kids: {
    level_1: [
      {
        id: 'kids_l1_ex1',
        type: 'association_sound_letter',
        title: 'Som da Vogal A',
        instruction: "Clique no botão de áudio para ouvir o som da letra 'A' e depois selecione a figura do objeto que começa com esse som.",
        options: ['Bola', 'Abacaxi', 'Gato'],
        correctAnswer: 'Abacaxi',
        audioPrompt: 'Qual destas figuras começa com a letra A?',
        feedbackSuccessSound: 'victory_kids.mp3',
      },
      {
        id: 'kids_l1_ex2',
        type: 'association_sound_letter',
        title: 'Som da Vogal E',
        instruction: "Clique no botão de áudio para ouvir o som da letra 'E' e depois selecione a figura do objeto que começa com esse som.",
        options: ['Escova', 'Dado', 'Uva'],
        correctAnswer: 'Escova',
        audioPrompt: 'Qual destas figuras começa com a letra E?',
        feedbackSuccessSound: 'victory_kids.mp3',
      }
    ],
    level_2: [
      {
        id: 'kids_l2_ex1',
        type: 'syllable_assembly',
        title: "Montando a Palavra 'BOLA'",
        instruction: "Junte as sílabas corretas para formar a palavra 'BOLA'.",
        availableSyllables: ['BO', 'LA', 'CA', 'MA'],
        correctSequence: ['BO', 'LA'],
        audioPrompt: 'Arraste ou toque nas sílabas para formar BO-LA.',
        feedbackSuccessSound: 'sparkle.mp3',
      },
      {
        id: 'kids_l2_ex2',
        type: 'syllable_assembly',
        title: "Montando a Palavra 'DADO'",
        instruction: "Junte as sílabas corretas para formar a palavra 'DADO'.",
        availableSyllables: ['DA', 'DO', 'PE', 'PA'],
        correctSequence: ['DA', 'DO'],
        audioPrompt: 'Arraste ou toque nas sílabas para formar DA-DO.',
        feedbackSuccessSound: 'sparkle.mp3',
      }
    ],
    level_3: [
      {
        id: 'kids_l3_ex1',
        type: 'interactive_story_reading',
        title: 'A História do Ursinho Léo',
        instruction: 'Leia a frase ou toque no botão de ouvir para escutar a história. Depois responda a pergunta.',
        storyText: 'O Ursinho Léo gosta de comer mel na floresta.',
        question: 'O que o Ursinho Léo gosta de comer?',
        options: ['Maçã', 'Mel', 'Peixe'],
        correctAnswer: 'Mel',
        audioPrompt: 'O que o Ursinho Léo gosta de comer?',
        feedbackSuccessSound: 'cheer.mp3',
      },
      {
        id: 'kids_l3_ex2',
        type: 'interactive_story_reading',
        title: 'A Borboleta Bela',
        instruction: 'Leia a frase ou toque no botão de ouvir para escutar a história. Depois responda a pergunta.',
        storyText: 'A borboleta Bela voa alto no jardim colorido.',
        question: 'Onde a borboleta Bela voa?',
        options: ['Na casa', 'No jardim', 'No rio'],
        correctAnswer: 'No jardim',
        audioPrompt: 'Onde a borboleta Bela voa?',
        feedbackSuccessSound: 'cheer.mp3',
      }
    ],
  },
  elderly: {
    level_1: [
      {
        id: 'elderly_l1_ex1',
        type: 'daily_symbol_recognition',
        title: 'Reconhecimento de Vogais no Dia a Dia',
        instruction: "Toque na letra 'O' correspondente ao início da palavra 'ÔNIBUS'.",
        options: ['A', 'O', 'E'],
        correctAnswer: 'O',
        audioPrompt: 'Qual é a primeira letra da palavra Ônibus?',
        feedbackSuccessSound: 'chime_gentle.mp3',
      },
      {
        id: 'elderly_l1_ex2',
        type: 'daily_symbol_recognition',
        title: 'Primeira Letra de Mercado',
        instruction: "Toque na letra correspondente ao início da palavra 'MERCADO'.",
        options: ['M', 'P', 'T'],
        correctAnswer: 'M',
        audioPrompt: 'Qual é a primeira letra da palavra Mercado?',
        feedbackSuccessSound: 'chime_gentle.mp3',
      }
    ],
    level_2: [
      {
        id: 'elderly_l2_ex1',
        type: 'label_reading',
        title: 'Leitura de Embalagem de Remédio',
        instruction: "Identifique qual das palavras abaixo é a sílaba inicial da palavra 'DROGA'.",
        options: ['DRO', 'BA', 'PA'],
        correctAnswer: 'DRO',
        audioPrompt: 'Toque na opção que contém a sílaba DRO.',
        feedbackSuccessSound: 'correct_subtle.mp3',
      },
      {
        id: 'elderly_l2_ex2',
        type: 'label_reading',
        title: 'Leitura de Rótulo de Alimento',
        instruction: "Identifique qual das palavras abaixo é a sílaba inicial da palavra 'FEIJÃO'.",
        options: ['FEI', 'PA', 'CO'],
        correctAnswer: 'FEI',
        audioPrompt: 'Toque na opção que contém a sílaba FEI.',
        feedbackSuccessSound: 'correct_subtle.mp3',
      }
    ],
    level_3: [
      {
        id: 'elderly_l3_ex1',
        type: 'camera_ocr_integration',
        title: 'Desafio do Mundo Real: Leitura com Câmera',
        instruction: 'Aponte a câmera do celular para qualquer conta de luz, bilhete ou embalagem próxima e o aplicativo lerá o texto para você.',
        action: 'open_camera_ocr',
        audioPrompt: 'Toque no botão central abaixo para abrir a câmera e ler qualquer papel na sua frente.',
        feedbackSuccessSound: 'read_complete.mp3',
      },
      {
        id: 'elderly_l3_ex2',
        type: 'camera_ocr_integration',
        title: 'Leitura de Receita Médica',
        instruction: 'Abra a câmera para ler as instruções de uma receita ou bilhete impresso.',
        action: 'open_camera_ocr',
        audioPrompt: 'Abra a câmera para ler as instruções de uma receita ou bilhete impresso.',
        feedbackSuccessSound: 'read_complete.mp3',
      }
    ],
  },
};
