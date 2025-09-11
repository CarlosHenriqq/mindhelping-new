import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { Slot } from 'expo-router';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { addSampleAppointment, initDatabase } from '../services/database'; // ajuste o caminho

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'Nunito': require('../../assets/fonts/Nunito.ttf'),
  });

  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initDatabase(); // inicializa o banco
      await addSampleAppointment(); // opcional: adiciona consulta de exemplo
      setDbReady(true); // banco pronto
    };
    init();
  }, []);

  if (!fontsLoaded || !dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2980B9" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Gradiente no topo */}
      <LinearGradient
        colors={['#2980B9', '#8198CF']}
        style={{
          height: StatusBar.currentHeight ?? 0,
          width: '100%',
          position: 'absolute',
          top: 0,
        }}
      />

      {/* Página atual */}
      <Slot />
    </GestureHandlerRootView>
  );
}
