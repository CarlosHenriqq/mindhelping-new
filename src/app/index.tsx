import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import Logo from '../../assets/logo.svg';
import { useUser } from '../context/UserContext';

export default function First() {
  const router = useRouter();
  const { userId, loadingUser } = useUser();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
  }, []);

  useEffect(() => {
    console.log("[INDEX/SPLASH] 🎬 Iniciando...");
    console.log(`[INDEX/SPLASH] userId: ${userId}`);
    console.log(`[INDEX/SPLASH] loadingUser: ${loadingUser}`);

    // Mostra a splash por pelo menos 2 segundos
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      console.log("[INDEX/SPLASH] ✅ Splash finalizada");
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    // Só navega quando:
    // 1. A splash terminou
    // 2. O user context terminou de carregar
    if (!showSplash && !loadingUser) {
      console.log("[INDEX/SPLASH] 🚀 Navegando...");
      
      if (userId) {
        console.log("[INDEX/SPLASH] ✅ Usuário logado! Indo para Home");
        router.replace('/pages/Home');
      } else {
        console.log("[INDEX/SPLASH] ❌ Usuário não logado. Indo para Login");
        router.replace('/auth/login');
      }
    }
  }, [showSplash, loadingUser, userId]);

  // Mostra a splash screen
  return (
    <View style={styles.container}>
      <Logo />
      {(!showSplash && loadingUser) && (
        <ActivityIndicator 
          size="large" 
          color="#2980B9" 
          style={{ marginTop: 20 }} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0E8F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});