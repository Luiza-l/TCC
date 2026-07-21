import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/useAppStore';
import { AccessibleButton } from '../components/AccessibleButton';
import { AgeGroup } from '../types';
import { assessmentQuestions } from '../data/assessmentData';

const AVATARS = ['🐱', '🐻', '🦁', '🐼', '🌸', '☕', '🌳', '🌟'];

export const OnboardingScreen: React.FC = () => {
  const {
    currentUser,
    assessmentActive,
    currentAssessmentQuestionIndex,
    registerUser,
    startAssessment,
    answerAssessmentQuestion,
    resetAssessment,
    speakText,
    triggerHaptic,
    logout,
  } = useAppStore();

  // Onboarding Steps: 0 = Welcome Screen, 1 = Profile Setup, 2 = Leveling Test (managed by store or screen)
  const [formStep, setFormStep] = useState<0 | 1 | 2>(0);
  
  // Local Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [avatar, setAvatar] = useState('');

  // Speak initial greeting on Step 0 mount
  useEffect(() => {
    if (formStep === 0) {
      speakText('Olá! Seja bem-vindo ao Alfabetiza Mais. Toque no botão principal no centro da tela para começar agora.');
    }
  }, [formStep]);

  const handleSelectAgeGroup = (group: AgeGroup) => {
    setAgeGroup(group);
    triggerHaptic();
    const text = group === 'child' ? 'Perfil Criança selecionado.' : 'Perfil Idoso selecionado.';
    speakText(text);
  };

  const handleSelectAvatar = (selectedAvatar: string) => {
    setAvatar(selectedAvatar);
    triggerHaptic();
    speakText(`Bonequinho ${selectedAvatar} selecionado.`);
  };

  const handleStartOnboarding = () => {
    setFormStep(1);
    speakText('Digite seu nome no campo de texto e selecione se você é Criança ou Idoso.');
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      speakText('Atenção. Por favor, digite o seu nome antes de continuar.');
      Alert.alert('Nome Obrigatório', 'Por favor, digite seu nome ou apelido para continuar.');
      return;
    }
    if (!ageGroup) {
      speakText('Atenção. Escolha se você é Criança ou Idoso.');
      Alert.alert('Perfil Obrigatório', 'Por favor, escolha entre Criança ou Idoso.');
      return;
    }
    if (!avatar) {
      speakText('Atenção. Escolha um bonequinho para representar seu perfil.');
      Alert.alert('Avatar Obrigatório', 'Por favor, selecione um avatar.');
      return;
    }

    try {
      const username = `${name.toLowerCase().trim()}_${Date.now().toString().slice(-4)}`;
      await registerUser(username, name, gender || 'Não Informado', ageGroup as AgeGroup, avatar);
      
      setFormStep(2);
      startAssessment();
    } catch (error: any) {
      Alert.alert('Erro no Cadastro', error.message || 'Houve um problema ao criar seu perfil.');
    }
  };

  // Determine active age group
  const activeAgeGroup: AgeGroup = (ageGroup || currentUser?.ageGroup || 'child') as AgeGroup;
  
  // Decide if we should render in High Contrast mode
  const isHighContrast = currentUser?.settings?.highContrast || (activeAgeGroup === 'elderly' && formStep > 0);

  // Dynamic Theme Colors for premium Dark Mode / Glassmorphism
  const getColors = () => {
    if (isHighContrast) {
      return {
        background: '#000000',
        text: '#FFFFFF',
        textSecondary: '#E2E8F0',
        cardBg: '#000000',
        borderColor: '#FFFFFF',
        primary: '#FFFFFF',
        secondary: '#FFFFFF',
        inputBg: '#000000',
        activeCard: '#FFFFFF',
        activeText: '#000000',
        progressFiller: '#FFFFFF',
        progressTrack: '#334155',
        gradientBg: ['#000000', '#000000'] as string[],
      };
    }

    if (activeAgeGroup === 'elderly') {
      return {
        background: '#0F172A',
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        cardBg: 'rgba(30, 41, 59, 0.7)', // Translucent Glassmorphism
        borderColor: 'rgba(255, 255, 255, 0.08)',
        primary: '#3B82F6',
        secondary: '#1E293B',
        inputBg: 'rgba(15, 23, 42, 0.6)',
        activeCard: 'rgba(59, 130, 246, 0.15)',
        activeText: '#3B82F6',
        progressFiller: '#3B82F6',
        progressTrack: 'rgba(255, 255, 255, 0.08)',
        gradientBg: ['#0B0F19', '#1E1B4B'] as string[], // Deep dark blue-violet gradient
      };
    }

    // Kids vibrant dark theme (Deep space purple with neon overlays)
    return {
      background: '#0B0A1A',
      text: '#F8FAFC',
      textSecondary: '#A78BFA',
      cardBg: 'rgba(31, 26, 58, 0.65)', // Glassmorphism dark purple
      borderColor: 'rgba(255, 255, 255, 0.08)',
      primary: '#8B5CF6',
      secondary: '#1E1B4B',
      inputBg: 'rgba(15, 12, 30, 0.5)',
      activeCard: 'rgba(139, 92, 246, 0.15)',
      activeText: '#C084FC',
      progressFiller: '#8B5CF6',
      progressTrack: 'rgba(255, 255, 255, 0.08)',
      gradientBg: ['#080515', '#160D33'] as string[],
    };
  };

  const colors = getColors();
  const fontSizeMultiplier = currentUser?.settings?.fontSizeMultiplier || 1.0;
  const baseTitleSize = activeAgeGroup === 'elderly' ? 26 : 24;
  const baseBodySize = activeAgeGroup === 'elderly' ? 17 : 15;

  // Visual Stepper Progress Bar
  const getProgressWidth = () => {
    if (currentUser && !assessmentActive && currentUser.literacyLevel !== null) return '100%';
    if (currentUser && assessmentActive) {
      const qProgress = (currentAssessmentQuestionIndex / assessmentQuestions.length) * 33;
      return `${66 + qProgress}%`;
    }
    if (formStep === 1) return '33%';
    return '8%';
  };

  const styles = StyleSheet.create({
    webBackground: {
      flex: 1,
      backgroundColor: Platform.OS === 'web' ? '#030712' : colors.background,
      justifyContent: 'center',
    },
    // Strict Mobile Frame Container (maxWidth: 430, centered on Web/Desktop)
    mobileContainer: {
      alignSelf: 'center',
      width: '100%',
      backgroundColor: colors.background,
      ...Platform.select({
        web: {
          maxWidth: 430,
          height: 850,
          borderRadius: 40,
          borderWidth: 8,
          borderColor: '#1E293B', // Slate Bezel
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.25,
          shadowRadius: 24,
          elevation: 10,
          overflow: 'hidden' as const,
        },
        default: {
          flex: 1,
        },
      }),
    },
    gradientBg: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 22,
      paddingVertical: 20,
      justifyContent: 'space-between',
    },
    // Visual Progress Bar Track
    progressTrack: {
      height: 6,
      backgroundColor: colors.progressTrack,
      borderRadius: 3,
      width: '100%',
      marginBottom: 20,
      overflow: 'hidden',
    },
    progressFiller: {
      height: '100%',
      backgroundColor: colors.progressFiller,
      width: getProgressWidth() as any,
      borderRadius: 3,
    },
    header: {
      alignItems: 'center',
      marginVertical: 10,
    },
    // Circular Emoji Container L80xW80
    avatarCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1.5,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    headerIcon: {
      fontSize: 42,
    },
    headerTitle: {
      fontSize: baseTitleSize * fontSizeMultiplier,
      fontWeight: '900',
      color: colors.text,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 15 * fontSizeMultiplier,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 6,
    },
    card: {
      backgroundColor: colors.cardBg,
      borderRadius: 20,
      padding: 22,
      borderWidth: isHighContrast ? 3 : 1,
      borderColor: colors.borderColor,
      marginVertical: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 22 * fontSizeMultiplier,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    cardSubtitle: {
      fontSize: 15 * fontSizeMultiplier,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 22,
    },
    label: {
      fontSize: (baseBodySize + 1) * fontSizeMultiplier,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.inputBg,
      borderWidth: 1.5,
      borderColor: colors.borderColor,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: baseBodySize * fontSizeMultiplier,
      color: colors.text,
      marginBottom: 18,
      minHeight: 56,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 18,
    },
    selectionCard: {
      flex: 1,
      minHeight: 76,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.borderColor,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      marginHorizontal: 5,
      padding: 10,
    },
    selectionCardActive: {
      backgroundColor: colors.activeCard,
      borderColor: colors.primary,
      borderWidth: 3,
    },
    selectionText: {
      fontSize: (baseBodySize + 1) * fontSizeMultiplier,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
    },
    selectionTextActive: {
      color: colors.text,
    },
    avatarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginVertical: 6,
    },
    avatarItem: {
      width: 58,
      height: 58,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.borderColor,
      borderRadius: 29,
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      margin: 5,
    },
    avatarItemActive: {
      backgroundColor: colors.activeCard,
      borderColor: colors.primary,
      borderWidth: 3,
    },
    avatarEmoji: {
      fontSize: 28,
    },
    questionHeader: {
      alignItems: 'center',
      marginBottom: 16,
    },
    progressIndicator: {
      fontSize: (baseBodySize - 1) * fontSizeMultiplier,
      color: colors.textSecondary,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    questionText: {
      fontSize: 22 * fontSizeMultiplier,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      lineHeight: 28,
    },
    soundButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1.5,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginVertical: 14,
      alignSelf: 'center',
    },
    soundButtonText: {
      fontSize: baseBodySize * fontSizeMultiplier,
      fontWeight: '700',
      color: colors.text,
      marginLeft: 6,
    },
    resultWrapper: {
      alignItems: 'center',
      paddingVertical: 8,
    },
    avatarResult: {
      fontSize: 80,
      marginVertical: 12,
    },
    badge: {
      paddingHorizontal: 26,
      paddingVertical: 12,
      backgroundColor: colors.primary,
      borderRadius: 24,
      marginVertical: 12,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: (baseBodySize + 2) * fontSizeMultiplier,
      fontWeight: 'bold',
    },
    logoutLink: {
      marginTop: 20,
      padding: 8,
      alignSelf: 'center',
    },
    logoutLinkText: {
      fontSize: baseBodySize * fontSizeMultiplier,
      color: colors.textSecondary,
      textDecorationLine: 'underline',
      fontWeight: 'bold',
    },
  });

  // STEP 0: Welcome Screen / Hero Step
  const renderWelcomeStep = () => (
    <View style={styles.card}>
      <View style={{ alignItems: 'center', marginVertical: 10 }}>
        <View style={styles.avatarCircle}>
          <Text style={styles.headerIcon}>🎒</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>Sua jornada de leitura começa aqui</Text>
      <Text style={styles.cardSubtitle}>
        Um aplicativo amigável, falado e adaptado para ajudar você a aprender a ler de forma simples, divertida e 100% gratuita.
      </Text>
      <View style={{ marginTop: 6 }}>
        <AccessibleButton
          onPress={handleStartOnboarding}
          title="Começar Agora"
          variant="primary"
          speakTextValue="Começar agora. Toque duas vezes para prosseguir."
        />
      </View>
    </View>
  );

  // STEP 1: Profile Setup Form
  const renderProfileStep = () => (
    <View style={styles.card}>
      <Text style={styles.label}>Como quer ser chamado(a)?</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Digite seu nome..."
        placeholderTextColor={colors.textSecondary}
        accessible={true}
        accessibilityLabel="Escreva seu nome no campo de texto"
      />

      <Text style={styles.label}>Quem está usando o aplicativo?</Text>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => handleSelectAgeGroup('child')}
          style={[
            styles.selectionCard,
            ageGroup === 'child' && styles.selectionCardActive,
          ]}
          accessible={true}
          accessibilityLabel="Opção Criança. Toque duas vezes para selecionar."
        >
          <Text
            style={[
              styles.selectionText,
              ageGroup === 'child' && styles.selectionTextActive,
            ]}
          >
            👦 Criança {ageGroup === 'child' ? ' ✓' : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSelectAgeGroup('elderly')}
          style={[
            styles.selectionCard,
            ageGroup === 'elderly' && styles.selectionCardActive,
          ]}
          accessible={true}
          accessibilityLabel="Opção Idoso. Toque duas vezes para selecionar."
        >
          <Text
            style={[
              styles.selectionText,
              ageGroup === 'elderly' && styles.selectionTextActive,
            ]}
          >
            👴 Idoso {ageGroup === 'elderly' ? ' ✓' : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Escolha um bonequinho:</Text>
      <View style={styles.avatarGrid}>
        {AVATARS.map((av) => (
          <TouchableOpacity
            key={av}
            onPress={() => handleSelectAvatar(av)}
            style={[
              styles.avatarItem,
              avatar === av && styles.avatarItemActive,
            ]}
            accessible={true}
            accessibilityLabel={`Avatar boneco ${av}`}
          >
            <Text style={styles.avatarEmoji}>
              {av}
              {avatar === av ? '✓' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: 18 }}>
        <AccessibleButton
          onPress={handleRegister}
          title="Próximo: Teste"
          variant="primary"
          speakTextValue="Próximo: Teste. Toque duas vezes para continuar."
        />
      </View>
    </View>
  );

  // STEP 2: Leveling Assessment
  const renderAssessmentStep = () => {
    const question = assessmentQuestions[currentAssessmentQuestionIndex];
    if (!question) return null;

    return (
      <View style={styles.card}>
        <View style={styles.questionHeader}>
          <Text style={styles.progressIndicator}>
            Pergunta {currentAssessmentQuestionIndex + 1} de {assessmentQuestions.length}
          </Text>
          <Text style={styles.questionText}>{question.questionText}</Text>

          {/* Repeat Question Audio Button */}
          <TouchableOpacity
            onPress={() => speakText(question.audioPrompt)}
            style={styles.soundButton}
            accessible={true}
            accessibilityLabel="Ouvir a pergunta em áudio novamente"
          >
            <Text style={{ fontSize: 20 }}>🔊</Text>
            <Text style={styles.soundButtonText}>Ouvir Pergunta</Text>
          </TouchableOpacity>
        </View>

        {question.options.map((opt) => (
          <AccessibleButton
            key={opt}
            onPress={() => answerAssessmentQuestion(question.id, opt)}
            title={opt}
            speakTextValue={`Opção: ${opt}`}
            variant="secondary"
          />
        ))}
      </View>
    );
  };

  // STEP 3: Assessment Completed / Results Page
  const renderResultStep = () => (
    <View style={[styles.card, styles.resultWrapper]}>
      <Text style={styles.cardTitle}>Tudo pronto, {currentUser?.name}!</Text>
      <Text style={styles.avatarResult}>{currentUser?.avatar}</Text>
      <Text style={styles.headerSubtitle}>
        De acordo com o teste diagnóstico, você começará no:
      </Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Nível {currentUser?.literacyLevel}</Text>
      </View>

      <Text style={[styles.headerSubtitle, { paddingHorizontal: 12, lineHeight: 22 }]}>
        {currentUser?.literacyLevel === 1 && 'Nível 1: Não lê nem reconhece letras (Analfabetismo Absoluto)'}
        {currentUser?.literacyLevel === 2 && 'Nível 2: Reconhece vogais e sílabas simples (Alfabetismo Emergente)'}
        {currentUser?.literacyLevel === 3 && 'Nível 3: Lê palavras curtas e frases simples (Analfabetismo Funcional)'}
      </Text>

      <View style={{ width: '100%', marginTop: 24 }}>
        <AccessibleButton
          onPress={() => {
            speakText('Entrando na trilha adaptada. Ótimos estudos!');
            Alert.alert('Sucesso', 'Você está pronto para começar as lições!');
          }}
          title="Iniciar Trilhas"
          variant="primary"
        />
      </View>

      <TouchableOpacity onPress={logout} style={styles.logoutLink}>
        <Text style={styles.logoutLinkText}>Criar outro perfil</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.webBackground}>
      <View style={styles.mobileContainer}>
        <LinearGradient
          colors={colors.gradientBg}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientBg}
        >
          <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {/* Visual Stepper Progress Bar */}
              <View style={styles.progressTrack}>
                <View style={styles.progressFiller} />
              </View>

              {/* Universal Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Alfabetiza+ Acessível</Text>
                <Text style={styles.headerSubtitle}>
                  Acessibilidade e Aprendizado no seu tempo
                </Text>
              </View>

              {/* Dynamic steps rendering */}
              {!currentUser && formStep === 0 && renderWelcomeStep()}
              {!currentUser && formStep === 1 && renderProfileStep()}
              {currentUser && assessmentActive && renderAssessmentStep()}
              {currentUser && !assessmentActive && currentUser.literacyLevel !== null && renderResultStep()}
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </View>
  );
};
