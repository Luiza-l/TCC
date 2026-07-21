export type AgeGroup = 'child' | 'elderly';

export interface UserSettings {
  fontSizeMultiplier: number; // 1.0 (normal), 1.2 (large), 1.5 (extra large)
  highContrast: boolean;
  vLibrasVisible: boolean;
  ttsEnabled: boolean;
  hapticsEnabled: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  gender: string;
  ageGroup: AgeGroup;
  avatar: string;
  literacyLevel: 1 | 2 | 3 | null; // null represents not assessed yet
  completedExercises: string[]; // List of completed exercise IDs
  settings: UserSettings;
}

export type ExerciseType =
  | 'association_sound_letter'
  | 'syllable_assembly'
  | 'interactive_story_reading'
  | 'daily_symbol_recognition'
  | 'label_reading'
  | 'camera_ocr_integration';

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  title: string;
  instruction: string;
  audioPrompt: string; // The audio spoken aloud (expo-speech)
  feedbackSuccessSound: string; // audio file name (e.g. 'sparkle.mp3')
}

export interface AssociationSoundLetterExercise extends BaseExercise {
  type: 'association_sound_letter';
  options: string[];
  correctAnswer: string;
}

export interface SyllableAssemblyExercise extends BaseExercise {
  type: 'syllable_assembly';
  availableSyllables: string[];
  correctSequence: string[];
}

export interface InteractiveStoryReadingExercise extends BaseExercise {
  type: 'interactive_story_reading';
  storyText: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface DailySymbolRecognitionExercise extends BaseExercise {
  type: 'daily_symbol_recognition';
  options: string[];
  correctAnswer: string;
}

export interface LabelReadingExercise extends BaseExercise {
  type: 'label_reading';
  options: string[];
  correctAnswer: string;
}

export interface CameraOcrIntegrationExercise extends BaseExercise {
  type: 'camera_ocr_integration';
  action: 'open_camera_ocr';
}

export type Exercise =
  | AssociationSoundLetterExercise
  | SyllableAssemblyExercise
  | InteractiveStoryReadingExercise
  | DailySymbolRecognitionExercise
  | LabelReadingExercise
  | CameraOcrIntegrationExercise;

export interface AssessmentQuestion {
  id: string;
  questionText: string;
  audioPrompt: string;
  options: string[];
  correctAnswer: string;
}

export interface AppState {
  // Auth and Profile States
  usersList: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Assessment (Nivelamento) States
  assessmentActive: boolean;
  currentAssessmentQuestionIndex: number;
  assessmentAnswers: Record<string, string>; // Maps questionId to selectedOption
  assessmentScore: number;

  // Auth and Profile Actions
  registerUser: (
    username: string,
    name: string,
    gender: string,
    ageGroup: AgeGroup,
    avatar: string
  ) => Promise<User>;
  loginUser: (username: string) => Promise<boolean>;
  logout: () => void;
  deleteUser: (userId: string) => void;
  updateUserSettings: (settings: Partial<UserSettings>) => void;

  // Assessment Actions
  startAssessment: () => void;
  answerAssessmentQuestion: (questionId: string, answer: string) => void;
  finishAssessment: () => void;
  resetAssessment: () => void;

  // Learning Progress Actions
  completeExercise: (exerciseId: string) => void;
  setLiteracyLevel: (level: 1 | 2 | 3) => void;
  resetProgress: () => void;

  // Global Accessibility Helpers & Toggles
  toggleVLibras: () => void;
  toggleTts: () => void;
  toggleHaptics: () => void;
  setFontSizeMultiplier: (multiplier: number) => void;
  toggleHighContrast: () => void;

  // Action to play general feedback
  playSuccessFeedback: (soundName: string) => Promise<void>;
  speakText: (text: string) => Promise<void>;
  triggerHaptic: () => void;
}
