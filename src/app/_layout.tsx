import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { Slot } from 'expo-router';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserProvider, useUser } from '../context/UserContext';
import { scheduleAllNotifications } from '../services/notificationService';

function AppContent({ children }: { children: React.ReactNode }) {
  const { userId } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      if (!userId) {
        setLoading(false);
        return;
      }

      const alreadyScheduled = await AsyncStorage.getItem('notificationsScheduled');

      if (!alreadyScheduled) {
        await scheduleAllNotifications(userId);
        await AsyncStorage.setItem('notificationsScheduled', 'true');
        console.log('📅 Notificações agendadas!');
      }

      setLoading(false);
    }

    init();
  }, [userId]);

  if (loading) {
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

      <LinearGradient
        colors={['#2980B9', '#8198CF']}
        style={{
          height: StatusBar.currentHeight ?? 0,
          width: '100%',
          position: 'absolute',
          top: 0,
        }}
      />

      <UserProvider>
        <AppContent>
          <Slot />
        </AppContent>
      </UserProvider>
    </GestureHandlerRootView>
  );
}
