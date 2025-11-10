import axios from 'axios';
import { router } from 'expo-router';
import { ChevronLeft, Phone } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useCustomAlert } from '../../../components/CustomAlert';
import { API_BASE_URL, ENDPOINTS } from '../../../config/api';
import { useUser } from '../../../context/UserContext';

const Call = () => {
  const { userId } = useUser();
  const { alertConfig, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();
  const callStartTime = useRef<Date | null>(null);
  const backgroundTime = useRef<Date | null>(null);
  const appState = useRef(AppState.currentState);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [timeoutSeconds, setTimeoutSeconds] = useState(0);

  // ====== MONITORAMENTO DE APPSTATE ======
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      console.log(`[CVV] 🔄 AppState: "${appState.current}" → "${nextAppState}"`);

      // ===== ANDROID: FOI PRO BACKGROUND =====
      if (Platform.OS === 'android' && nextAppState === 'background' && isCallInProgress) {
        backgroundTime.current = new Date();
        console.log('[CVV] 📴 ANDROID: App foi pro background (ligação iniciada)');
        console.log(`[CVV] 🕐 Início real: ${backgroundTime.current.toLocaleTimeString('pt-BR')}`);
      }

      // ===== ANDROID: VOLTOU DO BACKGROUND =====
      if (Platform.OS === 'android' && appState.current === 'background' && nextAppState === 'active') {
        console.log('[CVV] 📱 ANDROID: App voltou do background');

        if (isCallInProgress && backgroundTime.current) {
          const endTime = new Date();
          const durationInSeconds = Math.floor(
            (endTime.getTime() - backgroundTime.current.getTime()) / 1000
          );

          console.log(`[CVV] ⏱️ Duração: ${durationInSeconds}s`);

          // Só salva se a ligação durou pelo menos 3 segundos
          if (durationInSeconds >= 3) {
            saveCallRecord(backgroundTime.current, endTime, durationInSeconds);
          } else {
            console.log('[CVV] ⚠️ Ligação muito curta, não salvando');
            showWarning(
              'Ligação não registrada',
              'A ligação foi muito curta (menos de 3 segundos).'
            );
          }

          // Reseta tudo
          resetCallState();
        }
      }

      // ===== iOS: TRATAMENTO ESPECÍFICO =====
      if (Platform.OS === 'ios') {
        // iOS volta do inactive quando fecha o discador
        if (appState.current === 'inactive' && nextAppState === 'active') {
          console.log('[CVV] 📱 iOS: Voltou do discador');

          if (isCallInProgress && backgroundTime.current) {
            const endTime = new Date();
            const durationInSeconds = Math.floor(
              (endTime.getTime() - backgroundTime.current.getTime()) / 1000
            );

            if (durationInSeconds >= 3) {
              saveCallRecord(backgroundTime.current, endTime, durationInSeconds);
            }

            resetCallState();
          }
        }

        // iOS marca background quando liga de verdade
        if (nextAppState === 'background' && isCallInProgress) {
          backgroundTime.current = new Date();
          console.log('[CVV] 📴 iOS: Ligação real iniciada');
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isCallInProgress]);

  // ====== TIMEOUT AUTOMÁTICO (FALLBACK) ======
  useEffect(() => {
    if (isCallInProgress) {
      // Inicia contagem regressiva
      const interval = setInterval(() => {
        setTimeoutSeconds(prev => prev + 1);
      }, 1000);

      // Timeout de 2 minutos para Android, 5 minutos para iOS
      const timeoutDuration = Platform.OS === 'android' ? 120000 : 300000;

      timeoutRef.current = setTimeout(() => {
        console.log('[CVV] ⏰ TIMEOUT: Resetando estado automaticamente');
        
        if (backgroundTime.current) {
          const endTime = new Date();
          const durationInSeconds = Math.floor(
            (endTime.getTime() - backgroundTime.current.getTime()) / 1000
          );

          if (durationInSeconds >= 3) {
            saveCallRecord(backgroundTime.current, endTime, durationInSeconds);
          }
        }

        showWarning(
          'Ligação finalizada automaticamente',
          Platform.OS === 'android' 
            ? 'A ligação foi finalizada após 2 minutos. Se ainda está em ligação, ignore esta mensagem.'
            : 'A ligação foi finalizada após 5 minutos.'
        );

        resetCallState();
      }, timeoutDuration);

      return () => {
        clearInterval(interval);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else {
      setTimeoutSeconds(0);
    }
  }, [isCallInProgress]);

  // ====== RESET COMPLETO DO ESTADO ======
  function resetCallState() {
    setIsCallInProgress(false);
    callStartTime.current = null;
    backgroundTime.current = null;
    setTimeoutSeconds(0);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  // ====== SALVAR REGISTRO NO BACKEND ======
  async function saveCallRecord(startTime: Date, endTime: Date, durationSeconds: number) {
    if (!userId) {
      console.error('[CVV] ❌ Sem userId para salvar registro');
      return;
    }

    try {
      const dateCalled = startTime.toISOString().split('T')[0];
      
      const hours = Math.floor(durationSeconds / 3600);
      const minutes = Math.floor((durationSeconds % 3600) / 60);
      const seconds = durationSeconds % 60;
      
      const timeCalled = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      const callData = {
        dateCalled: dateCalled,
        timeCalled: timeCalled
      };

      console.log('[CVV] 💾 Salvando registro:', callData);
      console.log(`[CVV] 📊 Duração: ${Math.floor(durationSeconds / 60)}min ${durationSeconds % 60}s`);

      const response = await axios.post(
        `${API_BASE_URL}${ENDPOINTS.CVV_CALLS(userId)}`, 
        callData
      );

      console.log('[CVV] ✅ Registro salvo:', response.data);
      
      Alert.alert(
        'Ligação registrada! ✅',
        `Duração: ${Math.floor(durationSeconds / 60)}min ${durationSeconds % 60}s`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('[CVV] ❌ Erro ao salvar:', error.response?.data || error.message);
      
      Alert.alert(
        'Erro ao salvar',
        'Não foi possível registrar a ligação, mas ela foi realizada normalmente.'
      );
    }
  }

  // ====== REALIZAR LIGAÇÃO ======
  async function makePhoneCall() {
    const phoneNumber = '188';
    
    const phoneURL = Platform.OS === 'ios' 
      ? `telprompt:${phoneNumber}`
      : `tel:${phoneNumber}`;

    try {
      const supported = await Linking.canOpenURL(phoneURL);
      
      if (supported) {
        callStartTime.current = new Date();
        setIsCallInProgress(true);
        
        console.log('[CVV] 📞 Iniciando ligação');
        console.log(`[CVV] 🕐 Horário: ${callStartTime.current.toLocaleString('pt-BR')}`);
        console.log(`[CVV] 📱 Plataforma: ${Platform.OS}`);
        
        await Linking.openURL(phoneURL);
        
      } else {
        showError(
          'Não é possível ligar',
          'Seu dispositivo não suporta ligações telefônicas.'
        );
      }
    } catch (error) {
      console.error('[CVV] ❌ Erro ao ligar:', error);
      showError(
        'Erro',
        'Não foi possível iniciar a ligação. Tente discar 188 manualmente.'
      );
      
      resetCallState();
    }
  }

  // ====== BOTÃO DE CANCELAR (CONFIRMAÇÃO) ======
  function handleCancelCall() {
    showWarning(
      'Cancelar registro?',
      'Deseja cancelar o registro desta ligação?',
      [
        { text: 'Não', onPress: hideAlert },
        { 
          text: 'Sim, cancelar', 
          onPress: () => {
            console.log('[CVV] ❌ Ligação cancelada pelo usuário');
            resetCallState();
            hideAlert();
          }
        }
      ]
    );
  }
  
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/pages/Home');
    }
  };

  // Formata o tempo decorrido
  const formatElapsedTime = () => {
    const minutes = Math.floor(timeoutSeconds / 60);
    const seconds = timeoutSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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

        {/* INDICADOR DE LIGAÇÃO EM ANDAMENTO */}
        {isCallInProgress && (
          <View style={styles.callProgressContainer}>
            <Text style={styles.callProgressText}>
              🔴 Ligação em andamento
            </Text>
            <Text style={styles.callProgressTimer}>
              {formatElapsedTime()}
            </Text>
            <Text style={styles.callProgressHint}>
              {Platform.OS === 'android' 
                ? 'Volte para o app após encerrar a ligação'
                : 'A ligação será registrada automaticamente'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {isCallInProgress ? (
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancelCall}
          >
            <Text style={styles.cancelButtonText}>
              CANCELAR REGISTRO
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.containerCall} 
            onPress={makePhoneCall}
          >
            <Phone color={'white'} size={24} />
            <Text style={styles.callButtonText}>
              APERTE AQUI PARA LIGAR
            </Text>
          </TouchableOpacity>
        )}
        
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
  callProgressContainer: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF9800',
    width: '90%',
  },
  callProgressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 10,
  },
  callProgressTimer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF5722',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  callProgressHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  containerCall: {
    borderRadius: 30,
    backgroundColor: '#00BBF4',
    width: '80%',
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  callButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  cancelButton: {
    borderRadius: 30,
    backgroundColor: '#FF5252',
    width: '80%',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cancelButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  availabilityText: {
    color: 'black',
    marginBottom: '20%',
    marginTop: 15,
    fontFamily: 'Nunito',
    fontSize: 16,
  },
});