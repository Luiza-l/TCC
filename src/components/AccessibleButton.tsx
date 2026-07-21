import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/useAppStore';
import { AgeGroup } from '../types';

export interface AccessibleButtonProps {
  onPress: () => void;
  title: string;
  speakTextValue?: string; // What TTS will read. If omitted, uses title.
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: 'primary' | 'secondary' | 'outline';
  ageGroupOverride?: AgeGroup;
  highContrastOverride?: boolean;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  onPress,
  title,
  speakTextValue,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
  ageGroupOverride,
  highContrastOverride,
}) => {
  const currentUser = useAppStore((state) => state.currentUser);
  const speakText = useAppStore((state) => state.speakText);
  const triggerHaptic = useAppStore((state) => state.triggerHaptic);

  // Resolve active theme preferences
  const ageGroup = ageGroupOverride || currentUser?.ageGroup || 'child';
  const highContrast =
    highContrastOverride !== undefined
      ? highContrastOverride
      : currentUser?.settings?.highContrast || false;
  const fontSizeMultiplier = currentUser?.settings?.fontSizeMultiplier || 1.0;

  // Handles playing speech synthesis for this button's label
  const handleSpeak = () => {
    const textToSpeak = speakTextValue || title;
    speakText(textToSpeak);
  };

  // Handles clicking the main button
  const handlePress = () => {
    triggerHaptic();
    onPress();
  };

  // Theme Styles Resolution for Premium Dark Mode
  const getThemeStyles = () => {
    // 1. High Contrast Palette (Strict B&W for accessibility)
    if (highContrast) {
      const isPrimary = variant === 'primary';
      
      return {
        container: {
          backgroundColor: isPrimary ? '#000000' : '#FFFFFF',
          borderColor: '#000000',
          borderWidth: 3,
        },
        speakerBtn: {
          backgroundColor: '#FFFFFF',
          borderColor: '#000000',
          borderWidth: 3,
        },
        text: {
          color: isPrimary ? '#FFFFFF' : '#000000',
          fontWeight: '900' as const,
        },
        speakerText: {
          color: '#000000',
          fontWeight: '900' as const,
        },
      };
    }

    // 2. Dark Mode Palette for both Kids and Elderly
    // Kids uses vibrant neon borders/backgrounds, Elderly uses deep slate/blue colors.
    const isPrimary = variant === 'primary';
    const isSecondary = variant === 'secondary';

    if (ageGroup === 'elderly') {
      const stylesByVariant = {
        primary: {
          container: {
            borderColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: '#FFFFFF',
            fontWeight: '800' as const,
          },
        },
        secondary: {
          container: {
            backgroundColor: '#1E293B', // Slate 800
            borderColor: '#334155', // Slate 700
            borderWidth: 1.5,
          },
          text: {
            color: '#F1F5F9', // Slate 100
            fontWeight: '800' as const,
          },
        },
        outline: {
          container: {
            backgroundColor: 'transparent',
            borderColor: '#3B82F6', // Neon Blue
            borderWidth: 2,
          },
          text: {
            color: '#3B82F6',
            fontWeight: '800' as const,
          },
        },
      };

      return {
        ...stylesByVariant[variant],
        speakerBtn: {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          borderWidth: 1,
        },
        speakerText: {
          color: '#3B82F6',
        },
      };
    }

    // Kids Playful Dark Mode
    const stylesByVariantChild = {
      primary: {
        container: {
          borderColor: 'transparent',
          borderWidth: 0,
        },
        text: {
          color: '#FFFFFF',
          fontWeight: '800' as const,
        },
      },
      secondary: {
        container: {
          backgroundColor: '#1F1A3A', // Dark purple card
          borderColor: '#8B5CF6', // Purple border
          borderWidth: 1.5,
        },
        text: {
          color: '#F3E8FF',
          fontWeight: '800' as const,
        },
      },
      outline: {
        container: {
          backgroundColor: 'transparent',
          borderColor: '#EC4899', // Hot Pink
          borderWidth: 2,
        },
        text: {
          color: '#EC4899',
          fontWeight: '800' as const,
        },
      },
    };

    return {
      container: stylesByVariantChild[variant].container,
      text: stylesByVariantChild[variant].text,
      speakerBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
      },
      speakerText: {
        color: '#A78BFA', // Violet 400
      },
    };
  };

  const theme = getThemeStyles();
  const baseFontSize = ageGroup === 'elderly' ? 20 : 15;
  const scaledFontSize = baseFontSize * fontSizeMultiplier;

  // Decide if we should render LinearGradient (only for primary variant when NOT in highContrast mode)
  const isGradient = variant === 'primary' && !highContrast;

  const renderButtonContent = () => {
    const textElement = (
      <Text
        style={[
          styles.buttonText,
          theme.text,
          { fontSize: scaledFontSize },
          textStyle,
        ]}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {title.toUpperCase()}
      </Text>
    );

    if (isGradient) {
      // Different gradients for Kids and Elderly
      const gradientColors = ageGroup === 'elderly'
        ? ['#1E3A8A', '#1E1B4B'] as const
        : ['#8B5CF6', '#3B82F6'] as const;

      return (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.mainButton, theme.container]}
        >
          {textElement}
        </LinearGradient>
      );
    }

    return (
      <View style={[styles.mainButton, theme.container]}>
        {textElement}
      </View>
    );
  };

  return (
    <View style={styles.outerContainer}>
      {/* Main Action Touch Target with conditional Gradient/Solid layout */}
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        accessible={true}
        accessibilityLabel={`${title}. Botão. Toque duas vezes para escolher.`}
        accessibilityRole="button"
        style={[
          styles.mainButtonTouch,
          disabled && styles.disabled,
          style,
        ]}
      >
        {renderButtonContent()}
      </TouchableOpacity>

      <View style={styles.spacer} />

      {/* Speaker TTS Touch Target (48x48px circle, transparent glass background) */}
      <TouchableOpacity
        onPress={handleSpeak}
        disabled={disabled}
        accessible={true}
        accessibilityLabel={`Ouvir em voz alta: ${speakTextValue || title}`}
        accessibilityRole="button"
        style={[
          styles.speakerButton,
          theme.speakerBtn,
          disabled && styles.disabled,
        ]}
      >
        <Text
          style={[
            styles.speakerIcon,
            theme.speakerText,
            { fontSize: scaledFontSize + 1 },
          ]}
        >
          🔊
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 6,
  },
  mainButtonTouch: {
    flex: 1,
  },
  mainButton: {
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16, // Strict 16dp border radius
    overflow: 'hidden',
  },
  buttonText: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  spacer: {
    width: 12,
  },
  speakerButton: {
    width: 48,
    height: 48,
    borderRadius: 24, // Circular 48x48
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  speakerIcon: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
