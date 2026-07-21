import { AssessmentQuestion } from '../types';

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 'assess_q1',
    questionText: 'Qual destas letras é a letra "A"?',
    audioPrompt: 'Qual destas letras é a letra A?',
    options: ['B', 'A', 'M'],
    correctAnswer: 'A',
  },
  {
    id: 'assess_q2',
    questionText: 'Qual palavra formamos ao juntar as sílabas "BO" e "LA"?',
    audioPrompt: 'Qual palavra formamos ao juntar as sílabas BO e LA?',
    options: ['CASA', 'BOLA', 'MALA'],
    correctAnswer: 'BOLA',
  },
  {
    id: 'assess_q3',
    questionText: 'Leia a frase: "O gato bebeu o leite". Quem bebeu o leite?',
    audioPrompt: 'Leia a frase: O gato bebeu o leite. Quem bebeu o leite?',
    options: ['O cão', 'O gato', 'O rato'],
    correctAnswer: 'O gato',
  },
];
