import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import React, { useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { API_BASE_URL, ENDPOINTS } from '../../../config/api';
import { useUser } from "../../../context/UserContext";
export interface Professional {

  name: string;
  email: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  uf: string;
}

export default function Profissional() {


  const [nameProf, setNameProf] = useState('');
  const [profissionais, setProfissionais] = useState([]);
  const { userId } = useUser();
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const router = useRouter();

  async function buscarProfissional() {
    const prof = nameProf
    try {
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.PROFESSIONALS}`, {
        params: {
          search: prof
        }
      })
      setProfessionals(response.data.professionals)
      console.log(professionals);

    } catch (e) {

      console.log("Erro ao salvar pesquisaa: ", e);
    }
  }



  useFocusEffect(
    React.useCallback(() => {
      buscarProfissional();
    }, [])
  );

  function handleAgendar(id) {
    router.push({
      pathname: "/pages/Agendamento/Agendar",
      params: {
        id,
        returnTo: '/pages/Agendamento' // ou a rota que você quiser
      }
    })
  }

  return (
    <LinearGradient colors={['#dbeafe', '#eff6ff']} style={{ flex: 1 }}>
      <View style={{ marginTop: '15%' }}>
        <View style={styles.searchProf}>
          <TextInput
            placeholder='Buscar profissional'
            placeholderTextColor={'#4a4a4a'}
            style={{ borderRadius: 20, width: '90%' }}
            value={nameProf}
            onChangeText={setNameProf}
          />
          <TouchableOpacity onPress={buscarProfissional}>
            <Search size={20} color={'#161616ff'} style={styles.icon} />
          </TouchableOpacity>

        </View>
        {professionals.length === 0 ? (
          <View style={styles.empty}>
            <Text>Nenhum profissional encontrado.</Text>
          </View>
        ) : (
          <FlatList
            data={professionals}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: item.foto }} style={styles.foto} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.nome}>{item.name}</Text>
                  <Text style={styles.info}>{item.email}</Text>
                  <Text style={styles.info}>{item.phone}</Text>
                  <Text style={styles.info}>{`${item.address}, ${item.neighborhood}, ${item.city} - ${item.uf}`}</Text>
                </View>
                <TouchableOpacity onPress={() => handleAgendar(item.id)} style={{borderWidth:1, borderRadius:20, width:'30%', marginTop:20, backgroundColor:'#f0f0f0'}}>
                  <Text style={{ fontFamily: 'Nunito', fontWeight: '700', alignSelf:'center', justifyContent:'center', fontSize:16, color:'black',}}>Agendar</Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  empty: {
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 10,
    paddingLeft:15,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000000",
    shadowRadius: 5,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
  },
  
  nome: {
    fontSize: 14,
    fontWeight: "bold",
    color:'black'
  },
  info: {
    fontSize: 12,
    color: "#666",
  },
  searchProf: {
    marginTop: 0,
    borderWidth: 1,
    borderColor: 'black',
    width: '90%',
    borderRadius: 20,
    alignSelf: 'center',
    justifyContent: "center",
    paddingInline: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    marginBottom: '5%'
  },
  icon: {
    top: '25%'
  }
});
