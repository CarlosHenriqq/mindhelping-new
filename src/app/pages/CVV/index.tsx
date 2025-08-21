import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { ChevronLeft, Phone } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ImmediatePhoneCall from 'react-native-immediate-phone-call';
import ImmersiveMode from 'react-native-immersive-mode';

const Call = () => {
  const [legenda , setLegenda] = useState(false)
  const navigation = useNavigation();

  // 1) valor animado para controlar a posição Y da legenda (deslizando)
  const slideAnim = useRef(new Animated.Value(100)).current;  // Começa fora da tela, abaixo

  // 2) animação para deslizar a legenda quando a tela for carregada
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,  // Move para a posição normal
      duration: 500,  // Duração da animação
      useNativeDriver: true,
    }).start();
    setLegenda(true)
  }, []);  // Apenas quando o componente é montado

  useFocusEffect(
    React.useCallback(() => {
      ;
      ImmersiveMode.setBarMode('Bottom');
      return () => ImmersiveMode.setBarMode('Normal');
    }, [])
  );

  async function ligar188() {
    if (Platform.OS === 'android') {
      const ok = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CALL_PHONE
      );
      if (ok !== PermissionsAndroid.RESULTS.GRANTED) {
        return Alert.alert('Permissão negada');
      }
    }
    ImmediatePhoneCall.immediatePhoneCall('188');
  }

  return (
    <View style={styles.container}>
      <View style={styles.Seta}>
        <TouchableOpacity onPress={() => router.replace('/pages/Home')} style={styles.botaoVoltar}>
          <ChevronLeft/>
          <Text style={styles.textoVoltar}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <View style={{marginTop:'20%'}}>
        <Text style={{ fontSize: 20, fontFamily:'Nunito'}}>NÃO ESTÁ SE SENTINDO BEM</Text>
        <Text style={{ fontSize: 20, fontWeight: 'bold', alignSelf: 'center',fontFamily:'Nunito' }}>E PRECISA CONVERSAR?</Text>
        <Text style={{ fontSize: 25, top: 35, alignSelf: 'center', fontFamily:'Nunito' }}>LIGUE PARA O CVV</Text>

        <View style={styles.ContainerImagem}>
          <Image
            source={require('../../../../assets/images/cvv.png')}
            style={styles.imagem}
            resizeMode="cover"
          />
        </View>
      </View>

      <View>
        <TouchableOpacity style={styles.containerCall} onPress={ligar188}>
          <Phone color={'white'}/>
          <Text style={styles.texto}> APERTE AQUI PARA LIGAR</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ color: 'black', bottom:40,fontFamily:'Nunito' }}>Ligações disponíveis 24h</Text>

      
   
    </View>
  );
};

export default Call;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'#ffffff'
  },
  Seta: {
    position: 'absolute',
    top: '5%',
    left: 10,
    alignItems: 'flex-start',
  },
  botaoVoltar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagemSetaHeader: {
    width: 20,
    height: 30,
    marginTop: 10,
    marginBottom: 10,
    marginRight: 5,
    transform: [{ scaleX: -1 }],
  },
  textoVoltar: {
    fontSize: 16,
  },
  ContainerImagem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagem: {
    width: '100%',
    height: '60%',
    padding: 20,
    borderRadius:20,
    borderWidth:1,
    shadowColor: '#000000',
        shadowRadius: 8,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
        borderColor:'transparent'
  },
  containerCall: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00BBF4',
    backgroundColor: '#00BBF4',
    width: 293,
    height: 34,
    flexDirection: 'row',
    gap:5,
    bottom: 40,
    marginBottom:'5%',
    alignItems:'center',
    justifyContent:'center',
    shadowColor: '#000000',
        shadowRadius: 8,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
  },
  imgPhone: {
    width: 30,
    height: 30,
  },
  texto: {
    fontSize: 18,
    color: 'white',
    textAlignVertical: 'center',
    fontWeight: 'bold',
    fontFamily:'Roboto'
  },
  iconWrapper: {
    borderRadius:20,
    borderWidth:2,
    position: 'absolute',
    bottom: 40,
    right: 20,
    alignItems: 'center',
    borderColor:'transparent',
    padding:10,
    backgroundColor:'#ffffff',
    shadowColor: '#000000',
        shadowRadius: 8,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
  },
  tooltip: {
    marginTop: 8,
    fontSize: 14,
    color: 'gray',
  },
});
