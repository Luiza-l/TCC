import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { AppState, User, UserSettings, AgeGroup } from '../types';
import { assessmentQuestions } from '../data/assessmentData';

// Map of sound files (will need these in the assets/sounds directory)
// To prevent app crash, we wrap the Audio API with a try-catch block.
const soundMap: Record<string, any> = {
  'victory_kids.mp3': null,
  'sparkle.mp3': null,
  'cheer.mp3': null,
  'chime_gentle.mp3': null,
  'correct_subtle.mp3': null,
  'read_complete.mp3': null,
};

const DEFAULT_SETTINGS: Record<AgeGroup, UserSettings> = {
  child: {
    fontSizeMultiplier: 1.0,
    highContrast: false,
    vLibrasVisible: false,
    ttsEnabled: true,
    hapticsEnabled: true,
  },
  elderly: {
    fontSizeMultiplier: 1.2, // Larger font size for elderly
    highContrast: true, // Default high contrast for elderly
    vLibrasVisible: false,
    ttsEnabled: true,
    hapticsEnabled: true,
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth & Profile State
      usersList: [],
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,

      // Assessment (Nivelamento) State
      assessmentActive: false,
      currentAssessmentQuestionIndex: 0,
      assessmentAnswers: {},
      assessmentScore: 0,

      // Auth & Profile Actions
      registerUser: async (username, name, gender, ageGroup, avatar) => {
        set({ isLoading: true });
        
        // Check if username already exists
        const state = get();
        const existingUser = state.usersList.find((u) => u.username === username);
        if (existingUser) {
          set({ isLoading: false });
          throw new Error('Nome de usuário já existe');
        }

        const newUser: User = {
          id: Date.now().toString(),
          username,
          name,
          gender,
          ageGroup,
          avatar,
          literacyLevel: null,
          completedExercises: [],
          settings: { ...DEFAULT_SETTINGS[ageGroup] },
        };

        set((state) => ({
          usersList: [...state.usersList, newUser],
          currentUser: newUser,
          isAuthenticated: true,
          isLoading: false,
        }));

        const welcomeText = `Bem-vindo ${name}! Vamos começar sua jornada.`;
        await get().speakText(welcomeText);

        return newUser;
      },

      loginUser: async (username) => {
        set({ isLoading: true });
        const state = get();
        const user = state.usersList.find((u) => u.username === username);
        if (user) {
          set({
            currentUser: user,
            isAuthenticated: true,
            isLoading: false,
          });
          const welcomeText = `Olá de volta, ${user.name}!`;
          await get().speakText(welcomeText);
          return true;
        }
        set({ isLoading: false });
        return false;
      },

      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
        });
        Speech.stop();
      },

      deleteUser: (userId) => {
        set((state) => {
          const updatedList = state.usersList.filter((u) => u.id !== userId);
          const isLoggingOut = state.currentUser?.id === userId;
          return {
            usersList: updatedList,
            currentUser: isLoggingOut ? null : state.currentUser,
            isAuthenticated: isLoggingOut ? false : state.isAuthenticated,
          };
        });
      },

      updateUserSettings: (newSettings) => {
        const state = get();
        if (!state.currentUser) return;

        const updatedUser = {
          ...state.currentUser,
          settings: {
            ...state.currentUser.settings,
            ...newSettings,
          },
        };

        set((state) => ({
          currentUser: updatedUser,
          usersList: state.usersList.map((u) =>
            u.id === updatedUser.id ? updatedUser : u
          ),
        }));
      },

      // Assessment Actions
      startAssessment: () => {
        set({
          assessmentActive: true,
          currentAssessmentQuestionIndex: 0,
          assessmentAnswers: {},
          assessmentScore: 0,
        });

        // Speak the first question prompt
        const firstQuestion = assessmentQuestions[0];
        if (firstQuestion) {
          get().speakText(firstQuestion.audioPrompt);
        }
      },

      answerAssessmentQuestion: (questionId, answer) => {
        const state = get();
        const question = assessmentQuestions.find((q) => q.id === questionId);
        if (!question) return;

        const isCorrect = answer === question.correctAnswer;
        const newScore = isCorrect ? state.assessmentScore + 1 : state.assessmentScore;
        const nextIndex = state.currentAssessmentQuestionIndex + 1;
        const updatedAnswers = {
          ...state.assessmentAnswers,
          [questionId]: answer,
        };

        set({
          assessmentAnswers: updatedAnswers,
          assessmentScore: newScore,
          currentAssessmentQuestionIndex: nextIndex,
        });

        // Trigger light haptic on answer selection
        get().triggerHaptic();

        // Speak next question prompt or complete assessment
        if (nextIndex < assessmentQuestions.length) {
          const nextQuestion = assessmentQuestions[nextIndex];
          get().speakText(nextQuestion.audioPrompt);
        } else {
          get().finishAssessment();
        }
      },

      finishAssessment: () => {
        const state = get();
        if (!state.currentUser) return;

        // Map score to literacy level:
        // 0-1 correct -> Level 1 (Analfabetismo Absoluto)
        // 2 correct -> Level 2 (Alfabetismo Emergente)
        // 3 correct -> Level 3 (Analfabetismo Funcional)
        let calculatedLevel: 1 | 2 | 3 = 1;
        if (state.assessmentScore === 2) {
          calculatedLevel = 2;
        } else if (state.assessmentScore >= 3) {
          calculatedLevel = 3;
        }

        const updatedUser: User = {
          ...state.currentUser,
          literacyLevel: calculatedLevel,
        };

        set((state) => ({
          currentUser: updatedUser,
          usersList: state.usersList.map((u) =>
            u.id === updatedUser.id ? updatedUser : u
          ),
          assessmentActive: false,
        }));

        const feedbackText = `Avaliação concluída! Você foi direcionado para o nível ${calculatedLevel}.`;
        get().speakText(feedbackText);
        get().playSuccessFeedback('read_complete.mp3');
      },

      resetAssessment: () => {
        set({
          assessmentActive: false,
          currentAssessmentQuestionIndex: 0,
          assessmentAnswers: {},
          assessmentScore: 0,
        });
      },

      // Learning Progress Actions
      completeExercise: (exerciseId) => {
        const state = get();
        if (!state.currentUser) return;

        // Add if not already completed
        if (!state.currentUser.completedExercises.includes(exerciseId)) {
          const updatedUser: User = {
            ...state.currentUser,
            completedExercises: [...state.currentUser.completedExercises, exerciseId],
          };

          set((state) => ({
            currentUser: updatedUser,
            usersList: state.usersList.map((u) =>
              u.id === updatedUser.id ? updatedUser : u
            ),
          }));
        }
      },

      setLiteracyLevel: (level) => {
        const state = get();
        if (!state.currentUser) return;

        const updatedUser: User = {
          ...state.currentUser,
          literacyLevel: level,
        };

        set((state) => ({
          currentUser: updatedUser,
          usersList: state.usersList.map((u) =>
            u.id === updatedUser.id ? updatedUser : u
          ),
        }));
      },

      resetProgress: () => {
        const state = get();
        if (!state.currentUser) return;

        const updatedUser: User = {
          ...state.currentUser,
          completedExercises: [],
          literacyLevel: null,
        };

        set((state) => ({
          currentUser: updatedUser,
          usersList: state.usersList.map((u) =>
            u.id === updatedUser.id ? updatedUser : u
          ),
        }));
      },

      // Global Accessibility Toggles
      toggleVLibras: () => {
        const state = get();
        if (!state.currentUser) return;
        get().updateUserSettings({
          vLibrasVisible: !state.currentUser.settings.vLibrasVisible,
        });
        get().triggerHaptic();
      },

      toggleTts: () => {
        const state = get();
        if (!state.currentUser) return;
        const newTts = !state.currentUser.settings.ttsEnabled;
        get().updateUserSettings({ ttsEnabled: newTts });
        get().triggerHaptic();
        if (!newTts) {
          Speech.stop();
        } else {
          get().speakText("Leitura de tela ativada.");
        }
      },

      toggleHaptics: () => {
        const state = get();
        if (!state.currentUser) return;
        const newHaptics = !state.currentUser.settings.hapticsEnabled;
        get().updateUserSettings({ hapticsEnabled: newHaptics });
        if (newHaptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      },

      setFontSizeMultiplier: (multiplier) => {
        get().updateUserSettings({ fontSizeMultiplier: multiplier });
        get().triggerHaptic();
      },

      toggleHighContrast: () => {
        const state = get();
        if (!state.currentUser) return;
        get().updateUserSettings({
          highContrast: !state.currentUser.settings.highContrast,
        });
        get().triggerHaptic();
      },

      // Accessibility Helpers
      speakText: async (text) => {
        const state = get();
        // If user setting has TTS enabled
        if (state.currentUser?.settings.ttsEnabled ?? true) {
          try {
            await Speech.stop();
            Speech.speak(text, {
              language: 'pt-BR',
              rate: state.currentUser?.ageGroup === 'elderly' ? 0.85 : 1.0, // Slower for elderly
            });
          } catch (e) {
            console.warn('Speech synthesis not available/failed', e);
          }
        }
      },

      triggerHaptic: () => {
        const state = get();
        if (state.currentUser?.settings.hapticsEnabled ?? true) {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (e) {
            console.warn('Haptics not available/failed', e);
          }
        }
      },

      playSuccessFeedback: async (soundName) => {
        // Trigger haptics and play sound
        get().triggerHaptic();
        const state = get();
        try {
          const soundFile = soundMap[soundName];
          if (soundFile) {
            const { sound } = await Audio.Sound.createAsync(soundFile);
            await sound.playAsync();
            
            // Auto unload sound from memory when finished
            sound.setOnPlaybackStatusUpdate((status) => {
              if (status.isLoaded && status.didJustFinish) {
                sound.unloadAsync();
              }
            });
          }
        } catch (e) {
          console.warn('Failed to play audio feedback', e);
        }
      },
    }),
    {
      name: 'tcc-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        usersList: state.usersList,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
