import axios from 'axios';
import { router } from 'expo-router';
import { ChevronLeft, Phone } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { API_BASE_URL, ENDPOINTS } from '../../../config/api';
import { useUser } from '../../../context/UserContext';

const Call = () => {
  const { userId } = useUser();
  const callStartTime = useRef<Date | null>(null);
  const backgroundTime = useRef<Date | null>(null); // ← NOVO: Marca quando foi pro background
  const appState = useRef(AppState.currentState);
  const [isCallInProgress, setIsCallInProgress] = useState(false);

  // Monitora mudanças no estado do app (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      console.log(`[CVV] 🔄 AppState mudou de "${appState.current}" para "${nextAppState}"`);

      // Se o app foi pro BACKGROUND (ligação realmente começou)
      if (nextAppState === 'background' && isCallInProgress) {
        backgroundTime.current = new Date(); // ← MARCA O TEMPO REAL DA LIGAÇÃO
        console.log('[CVV] 📴 App foi pro BACKGROUND (usuário está em ligação)');
        console.log(`[CVV] 🕐 Início REAL da ligação: ${backgroundTime.current.toLocaleTimeString('pt-BR')}`);
      }

      // Se o app estava no BACKGROUND e voltou pro foreground
      if (appState.current === 'background' && nextAppState === 'active') {
        console.log('[CVV] 📱 App voltou do BACKGROUND (ligação real)');

        // Se havia uma ligação em andamento E temos o tempo do background
        if (isCallInProgress && backgroundTime.current) {
          const endTime = new Date();
          const durationInSeconds = Math.floor(
            (endTime.getTime() - backgroundTime.current.getTime()) / 1000
          );

          console.log('[CVV] 📞 Ligação finalizada');
          console.log(`[CVV] ⏱️ Duração REAL estimada: ${durationInSeconds}s`);

          // Usa o tempo do background como início da ligação
          saveCallRecord(backgroundTime.current, endTime, durationInSeconds);

          // Reseta o estado
          setIsCallInProgress(false);
          callStartTime.current = null;
          backgroundTime.current = null;
        }
      }

      // Se voltou apenas do inactive (discador iOS), ignora
      if (appState.current === 'inactive' && nextAppState === 'active') {
        console.log('[CVV] ⚠️ Voltou do inactive (só abriu o discador, ainda não ligou)');
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isCallInProgress]);

  // Salva o registro no backend
  async function saveCallRecord(startTime: Date, endTime: Date, durationSeconds: number) {
    if (!userId) {
      console.error('[CVV] ❌ Sem userId para salvar registro');
      return;
    }

    try {
      // Formata a data como "YYYY-MM-DD"
      const dateCalled = startTime.toISOString().split('T')[0];
      
      // Formata a DURAÇÃO como "HH:MM:SS"
      const hours = Math.floor(durationSeconds / 3600);
      const minutes = Math.floor((durationSeconds % 3600) / 60);
      const seconds = durationSeconds % 60;
      
      const timeCalled = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      const callData = {
        dateCalled: dateCalled,  // "2025-10-22"
        timeCalled: timeCalled   // "00:12:35" (duração)
      };

      console.log('[CVV] 💾 Salvando registro da ligação:', callData);
      console.log(`[CVV] 📊 Duração: ${Math.floor(durationSeconds / 60)}min ${durationSeconds % 60}s`);

      const response = await axios.post(
        `${API_BASE_URL}${ENDPOINTS.CVV_CALLS(userId)}`, 
        callData
      );

      console.log('[CVV] ✅ Registro salvo com sucesso:', response.data);
      
      // Mostra feedback pro usuário
      Alert.alert(
        'Ligação registrada',
        `Duração: ${Math.floor(durationSeconds / 60)}min ${durationSeconds % 60}s`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('[CVV] ❌ Erro ao salvar registro:', error.response?.data || error.message);
    }
  }

  // Função para realizar a ligação
  async function makePhoneCall() {
    const phoneNumber = '188'; // CVV
    
    const phoneURL = Platform.OS === 'ios' 
      ? `telprompt:${phoneNumber}`
      : `tel:${phoneNumber}`;

    try {
      const supported = await Linking.canOpenURL(phoneURL);
      
      if (supported) {
        // Aguarda um pouquinho antes de marcar o início
        // Para evitar que o AppState dispare antes do discador abrir
        setTimeout(() => {
          callStartTime.current = new Date();
          setIsCallInProgress(true);
          
          console.log('[CVV] 📞 Ligação iniciada');
          console.log(`[CVV] 🕐 Horário: ${callStartTime.current.toLocaleString('pt-BR')}`);
        }, 500);
        
        await Linking.openURL(phoneURL);
        
        // Timeout de segurança: 5 minutos
        setTimeout(() => {
          if (isCallInProgress) {
            console.log('[CVV] ⚠️ Timeout: resetando estado');
            setIsCallInProgress(false);
            callStartTime.current = null;
          }
        }, 300000); // 5 minutos
        
      } else {
        Alert.alert(
          'Não é possível ligar',
          'Seu dispositivo não suporta ligações telefônicas.'
        );
      }
    } catch (error) {
      console.error('[CVV] ❌ Erro ao tentar ligar:', error);
      Alert.alert(
        'Erro',
        'Não foi possível iniciar a ligação. Tente discar 188 manualmente.'
      );
      
      setIsCallInProgress(false);
      callStartTime.current = null;
    }
  }
  
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/pages/Home');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.botaoVoltar}>
          <ChevronLeft color="#333" size={28} />
          <Text style={styles.textoVoltar}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>NÃO ESTÁ SE SENTINDO BEM</Text>
        <Text style={styles.subtitle}>E PRECISA CONVERSAR?</Text>
        <Text style={styles.mainActionText}>LIGUE PARA O CVV</Text>

        <View style={styles.imageContainer}>
          <Image
            source={require('../../../../assets/images/cvv.png')}
            style={styles.imagem}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.containerCall, isCallInProgress && styles.containerCallDisabled]} 
          onPress={makePhoneCall}
          disabled={isCallInProgress}
        >
          <Phone color={'white'} size={24} />
          <Text style={styles.callButtonText}>
            {isCallInProgress ? 'LIGAÇÃO EM ANDAMENTO...' : 'APERTE AQUI PARA LIGAR'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.availabilityText}>Ligações disponíveis 24h</Text>
      </View>
    </View>
  );
};

export default Call;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 15,
    zIndex: 10,
  },
  botaoVoltar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoVoltar: {
    fontSize: 18,
    color: '#333',
    marginLeft: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -40,
  },
  title: {
    marginTop: '20%',
    fontSize: 18,
    fontFamily: 'Nunito',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Nunito',
    textAlign: 'center',
  },
  mainActionText: {
    fontSize: 22,
    marginTop: '10%',
    fontFamily: 'Nunito',
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '70%',
    height: '45%',
    marginTop: '-5%',
  },
  imagem: {
    width: '100%',
    height: '100%',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  containerCall: {
    borderRadius: 30,
    backgroundColor: '#00BBF4',
    width: '80%',
    paddingVertical: '2%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  containerCallDisabled: {
    backgroundColor: '#7CB9D4',
    opacity: 0.7,
  },
  callButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  availabilityText: {
    color: 'black',
    marginBottom: '20%',
    fontFamily: 'Nunito',
    fontSize: 16,
  },
});