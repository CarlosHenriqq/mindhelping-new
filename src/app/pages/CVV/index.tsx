import { router } from 'expo-router';
import { ChevronLeft, Phone } from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ImmediatePhoneCall from 'react-native-immediate-phone-call';

const Call = () => {
  // 1. Hook useFocusEffect para o modo imersivo
  // É mais adequado para efeitos visuais que devem ser aplicados/removidos quando a tela ganha/perde foco.
 ImmediatePhoneCall.immediatePhoneCall('188');


  // 2. Função para realizar a ligação
  async function makePhoneCall() {
    const phoneNumber = '188'; // CVV

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permissão Negada', 'Você precisa conceder permissão para fazer ligações.');
          return;
        }
        console.log('talvez funcionou')
      } catch (err) {
        console.log(err);
        return;
      }
    }
    
    // Se a permissão foi concedida (ou se for iOS), faz a ligação.
    ImmediatePhoneCall.immediatePhoneCall(phoneNumber);
  }
  
  // 3. Função de navegação corrigida
  const handleGoBack = () => {
    // No Expo Router, é mais comum usar `router.back()` para voltar.
    // Se quiser ir para uma rota específica, use o caminho do arquivo, ex: '/home'
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home'); // Rota de fallback
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
        <TouchableOpacity style={styles.containerCall} onPress={makePhoneCall}>
          <Phone color={'white'} size={24} />
          <Text style={styles.callButtonText}>APERTE AQUI PARA LIGAR</Text>
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
    justifyContent: 'space-between', // Distribui o espaço
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
    marginTop: -40, // Compensa o espaço do footer
  },
  title: {
    fontSize: 20,
    fontFamily: 'Nunito',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Nunito',
    textAlign: 'center',
  },
  mainActionText: {
    fontSize: 25,
    marginTop: '10%',
    fontFamily: 'Nunito',
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '80%',
    height: '45%',
    marginTop: '5%',
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
  callButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  availabilityText: {
    color: 'black',
    marginTop: '5%',
    fontFamily: 'Nunito',
    fontSize:16
  },
});
