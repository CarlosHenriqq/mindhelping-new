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
  View,
} from 'react-native';
import { useCustomAlert } from '../../../components/CustomAlert';
import { API_BASE_URL, ENDPOINTS } from '../../../config/api';
import { useUser } from '../../../context/UserContext';

const Call = () => {
  const { userId } = useUser();
  const { showSuccess, showError, showWarning, hideAlert, showConfirm } = useCustomAlert();

  const callStartTime = useRef<Date | null>(null);
  const appState = useRef(AppState.currentState);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [timeoutSeconds, setTimeoutSeconds] = useState(0);

  // ===== AppState Listener =====
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // Android: app voltou do background
      if (Platform.OS === 'android' && appState.current === 'background' && nextAppState === 'active') {
        if (isCallInProgress && callStartTime.current) {
          handleCallReturn();
        }
      }

      // iOS: app voltou do discador
      if (Platform.OS === 'ios' && appState.current === 'inactive' && nextAppState === 'active') {
        if (isCallInProgress && callStartTime.current) {
          handleCallReturn();
        }
      }

      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isCallInProgress]);

  // ===== Timeout automático como fallback =====
  useEffect(() => {
    let interval: NodeJS.Timer;

    if (isCallInProgress) {
      interval = setInterval(() => setTimeoutSeconds(prev => prev + 1), 1000);

      const timeoutDuration = Platform.OS === 'android' ? 120000 : 300000; // fallback 2/5 min

      timeoutRef.current = setTimeout(() => {
        if (callStartTime.current) {
          showWarning(
            'Tempo limite atingido',
            'A ligação foi encerrada automaticamente pelo tempo máximo permitido.'
          );
          resetCallState();
        }
      }, timeoutDuration);
    }

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isCallInProgress]);

  // ===== Função chamada ao voltar da ligação =====
  function handleCallReturn() {
    if (!callStartTime.current) return;

    const endTime = new Date();
    const durationInSeconds = Math.floor((endTime.getTime() - callStartTime.current.getTime()) / 1000);

    if (durationInSeconds >= 3) {
      saveCallRecord(callStartTime.current, endTime, durationInSeconds);
    } else {
      showWarning('Ligação muito curta', 'A ligação foi encerrada antes de 3 segundos e não será registrada.');
    }

    resetCallState();
  }

  // ===== Resetar estado =====
  function resetCallState() {
    setIsCallInProgress(false);
    callStartTime.current = null;
    setTimeoutSeconds(0);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  // ===== Salvar registro no backend =====
  async function saveCallRecord(startTime: Date, endTime: Date, durationSeconds: number) {
    if (!userId) return;

    try {
      const dateCalled = startTime.toISOString().split('T')[0];
      const hours = Math.floor(durationSeconds / 3600);
      const minutes = Math.floor((durationSeconds % 3600) / 60);
      const seconds = durationSeconds % 60;
      const timeCalled = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      const callData = { dateCalled, timeCalled };

      const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.CVV_CALLS(userId)}`, callData);
      console.log('[CVV] ✅ Registro salvo:', response.data);

      showSuccess('Ligação registrada', `Duração: ${Math.floor(durationSeconds / 60)}min ${durationSeconds % 60}s`);
    } catch (error: any) {
      console.error('[CVV] ❌ Erro ao salvar:', error.response?.data || error.message);
      showError('Erro ao salvar', 'Não foi possível registrar a ligação.');
    }
  }

  // ===== Iniciar ligação =====
  async function makePhoneCall() {
    const phoneNumber = '188';
    const phoneURL = Platform.OS === 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;

    try {
      console.log('Tentando abrir a URL:', phoneURL);
      const supported = await Linking.canOpenURL(phoneURL);
      console.log('supported?', supported);

      if (!supported) {
        showError('Erro', 'Não foi possível iniciar a ligação neste dispositivo.');
        return;
      }

      callStartTime.current = new Date();
      setIsCallInProgress(true);
      console.log('[CVV] 📞 Ligando...');
      await Linking.openURL(phoneURL);
    } catch (error) {
      console.error('[CVV] ❌ Erro ao ligar:', error);
      showError('Erro', 'Não foi possível iniciar a ligação.');
      resetCallState();
    }
  }

  // ===== Cancelar registro =====
  function handleCancelCall() {
    showConfirm(
      'Cancelar registro?',
      'Deseja cancelar o registro desta ligação?',
      () => resetCallState(), // confirma cancelamento
      hideAlert, // cancela o cancelamento
      'warning',
      'Sim, cancelar',
      'Não'
    );
  }

  const formatElapsedTime = () => {
    const minutes = Math.floor(timeoutSeconds / 60);
    const seconds = timeoutSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleGoBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/pages/Home');
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

        {isCallInProgress && (
          <View style={styles.callProgressContainer}>
            <Text style={styles.callProgressText}>🔴 Ligação em andamento</Text>
            <Text style={styles.callProgressTimer}>{formatElapsedTime()}</Text>
            <Text style={styles.callProgressHint}>
              A ligação será registrada automaticamente ao retornar ao app
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {isCallInProgress ? (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelCall}>
            <Text style={styles.cancelButtonText}>CANCELAR REGISTRO</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.containerCall} onPress={makePhoneCall}>
            <Phone color="white" size={24} />
            <Text style={styles.callButtonText}>APERTE AQUI PARA LIGAR</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.availabilityText}>Ligações disponíveis 24h</Text>
      </View>
    </View>
  );
};

export default Call;

// ===== Estilos =====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'space-between' },
  header: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 15, zIndex: 10 },
  botaoVoltar: { flexDirection: 'row', alignItems: 'center' },
  textoVoltar: { fontSize: 16, color: '#333' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, marginTop: -40 },
  title: { marginTop: '20%', fontSize: 18, fontFamily: 'Nunito', textAlign: 'center' },
  subtitle: { fontSize: 16, fontWeight: 'bold', fontFamily: 'Nunito', textAlign: 'center' },
  mainActionText: { fontSize: 22, marginTop: '10%', fontFamily: 'Nunito', fontWeight: 'bold' },
  imageContainer: { width: '70%', height: '45%', marginTop: '-5%' },
  imagem: { width: '100%', height: '100%' },
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
  callProgressText: { fontSize: 18, fontWeight: 'bold', color: '#E65100', marginBottom: 10 },
  callProgressTimer: { fontSize: 32, fontWeight: 'bold', color: '#FF5722', marginBottom: 10, fontFamily: 'monospace' },
  callProgressHint: { fontSize: 12, color: '#666', textAlign: 'center', fontStyle: 'italic' },
  footer: { paddingBottom: 40, alignItems: 'center' },
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
  callButtonText: { fontSize: 18, color: 'white', fontWeight: 'bold', marginLeft: 10 },
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
  cancelButtonText: { fontSize: 18, color: 'white', fontWeight: 'bold' },
  availabilityText: { color: 'black', marginBottom: '20%', marginTop: 15, fontFamily: 'Nunito', fontSize: 16 },
});
