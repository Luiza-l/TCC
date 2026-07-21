import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { OnboardingScreen } from './src/screens/OnboardingScreen';

export default function App() {
  return (
    <>
      <OnboardingScreen />
      <StatusBar style="auto" />
    </>
  );
}
