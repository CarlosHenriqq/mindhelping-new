import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import * as NavigationBar from 'expo-navigation-bar';
import { Slot } from 'expo-router';
import React, { useEffect } from "react";
import { ActivityIndicator, Platform, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NotificationProvider } from '../context/NotificationContext';
import { UserProvider } from '../context/UserContext';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'Nunito': require('../../assets/fonts/Nunito.ttf'),
  });

  useEffect(() => {
    const setupNavigationBar = async () => {
      if (Platform.OS === 'android') {
        try {
          // Para Android 10, use 'leanback' ao invés de 'hidden'
          // Isso faz a barra aparecer só quando deslizar de baixo pra cima
          await NavigationBar.setVisibilityAsync('hidden');
          
          // Define cor de fundo combinando com seu gradiente
          await NavigationBar.setBackgroundColorAsync('#dbeafe'); // Cor final do gradiente
          
          // Botões claros (ícones brancos)
          await NavigationBar.setButtonStyleAsync('light');
          
          // Comportamento: aparece ao deslizar
          await NavigationBar.setBehaviorAsync('overlay-swipe');
          
        } catch (error) {
          console.log('⚠️ Erro ao configurar NavigationBar:', error);
        }
      }
    };

    setupNavigationBar();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2980B9" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <LinearGradient
        colors={['#eff6ff', '#dbeafe']}
        style={{
          height: StatusBar.currentHeight ?? 0,
          width: '100%',
          position: 'absolute',
          top: 0,
        }}
      />

      <UserProvider>
        <NotificationProvider>
          <Slot />
        </NotificationProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}