import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { Slot } from 'expo-router';
import React, { useState } from "react";
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserProvider, useUser } from '../context/UserContext';

function AppContent({ children }: { children: React.ReactNode }) {
  const [loadingUser, setLoadingUser] = useState(true);
  const { setUserId } = useUser();

  


  if (!loadingUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2980B9" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'Nunito': require('../../assets/fonts/Nunito.ttf'),
  });

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

      {/* Provider global que envolve todas as telas */}
      <UserProvider>
        <AppContent>
          <Slot />
        </AppContent>
      </UserProvider>
    </GestureHandlerRootView>
  );
}
