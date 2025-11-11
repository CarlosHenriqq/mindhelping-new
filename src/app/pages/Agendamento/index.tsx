import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { Filter, Search } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL, ENDPOINTS } from '../../../config/api';
import { useUser } from "../../../context/UserContext";

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  uf: string;
  foto?: string;
}

export default function Profissional() {
  const [nameProf, setNameProf] = useState('');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const router = useRouter();
  const { userId } = useUser();

  async function buscarProfissional() {
    try {
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.PROFESSIONALS}`, {
        params: { search: nameProf }
      });
      console.log(response.data)
      setProfessionals(response.data.professionals);
      setFilteredProfessionals(response.data.professionals);
    } catch (e) {
      console.log("Erro ao buscar profissionais: ", e);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      buscarProfissional();
    }, [])
  );

  function handleAgendar(id: string) {
    router.push({
      pathname: "/pages/Agendamento/Agendar",
      params: {
        id,
        returnTo: '/pages/Agendamento'
      }
    });
  }

  // Cidades únicas retornadas pela API
  const cidades = Array.from(new Set(professionals.map(p => p.city))).sort();

  // Filtro por cidade
  function filtrarPorCidade(cidade: string) {
    if (!cidade) {
      setFilteredProfessionals(professionals);
      return;
    }
    const filtrados = professionals.filter(p =>
      p.city.toLowerCase().includes(cidade.toLowerCase())
    );
    setFilteredProfessionals(filtrados);
  }

  function handleSelecionarCidade(cidade: string) {
    filtrarPorCidade(cidade);
    setShowModal(false);
    setSearchCity('');
  }

  return (
    <LinearGradient colors={['#dbeafe', '#eff6ff']} style={{ flex: 1 }}>
      <View style={{ marginTop: '15%' }}>
        {/* 🔍 Barra de busca e filtro */}
        <View style={styles.searchContainer}>
          <View style={styles.searchProf}>
            <TextInput
              placeholder='Buscar profissional'
              placeholderTextColor={'#4a4a4a'}
              style={{ borderRadius: 20, width: '85%' }}
              value={nameProf}
              onChangeText={setNameProf}
            />
            <TouchableOpacity onPress={buscarProfissional}>
              <Search size={20} color={'#161616ff'} style={styles.icon} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={styles.filterButton}
          >
            <Filter size={22} color="#161616ff" />
          </TouchableOpacity>
        </View>

        {/* 🧩 Modal de filtro por cidade */}
        <Modal visible={showModal} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filtrar por cidade</Text>
              <TextInput
                placeholder="Pesquisar cidade"
                placeholderTextColor="#666"
                value={searchCity}
                onChangeText={setSearchCity}
                style={styles.modalInput}
              />

              <FlatList
                data={cidades.filter(c =>
                  c.toLowerCase().includes(searchCity.toLowerCase())
                )}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.cityItem}
                    onPress={() => handleSelecionarCidade(item)}
                  >
                    <Text style={styles.cityText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />

              <TouchableOpacity
                onPress={() => {
                  setFilteredProfessionals(professionals);
                  setShowModal(false);
                  setSearchCity('');
                }}
                style={styles.btnLimpar}
              >
                <Text style={styles.txtLimpar}>Limpar filtro</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 👩‍⚕️ Lista de profissionais */}
        {filteredProfessionals.length === 0 ? (
          <View style={styles.empty}>
            <Text>Nenhum profissional encontrado.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProfessionals}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: item.foto }} style={styles.foto} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.nome}>{item.name}</Text>
                  <Text style={styles.info}>{item.email}</Text>
                  <Text style={styles.info}>{item.phone}</Text>
                  <Text style={styles.info}>
                    {`${item.address}, ${item.neighborhood}, ${item.city} - ${item.uf}`}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleAgendar(item.id)}
                  style={styles.btnAgendar}
                >
                  <Text style={styles.txtAgendar}>Agendar</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  searchProf: {
    borderWidth: 1,
    borderColor: 'black',
    width: '88%',
    borderRadius: 20,
    paddingHorizontal: 15,
    
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    marginLeft: 5,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'black',
  },
  icon: { 
    top: 0, 
    left:20 },
  empty: { 
    justifyContent: "center", 
    alignItems: "center"
   },
  card: {
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 10,
    paddingLeft: 15,
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
    color: 'black' },
  info: { 
    fontSize: 12,
     color: "#666" },
  btnAgendar: {
    borderWidth: 1,
    borderRadius: 20,
    width: '30%',
    marginTop: 20,
    backgroundColor: '#f0f0f0',
  },
  txtAgendar: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 16,
    color: 'black',
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: '85%',
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    color: "#000",
  },
  cityItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  cityText: {
    fontSize: 15,
    color: "#333",
  },
  btnLimpar: {
    marginTop: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'black',
  },
  txtLimpar: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#000',
  },
});
