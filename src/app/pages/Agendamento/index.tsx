import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { Filter, Mail, MapPin, Phone, Search, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
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
  const [filterActive, setFilterActive] = useState(false);
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

  const cidades = Array.from(new Set(professionals.map(p => p.city))).sort();

  function filtrarPorCidade(cidade: string) {
    if (!cidade) {
      setFilteredProfessionals(professionals);
      setFilterActive(false);
      return;
    }
    const filtrados = professionals.filter(p =>
      p.city.toLowerCase().includes(cidade.toLowerCase())
    );
    setFilteredProfessionals(filtrados);
    setFilterActive(true);
  }

  function handleSelecionarCidade(cidade: string) {
    filtrarPorCidade(cidade);
    setShowModal(false);
    setSearchCity('');
  }

  function limparFiltro() {
    setFilteredProfessionals(professionals);
    setShowModal(false);
    setSearchCity('');
    setFilterActive(false);
  }

  return (
    <LinearGradient colors={['#f0f9ff', '#e0f2fe', '#bae6fd']} style={styles.container}>
      <View style={styles.content}>
        {/* Header com título */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profissionais</Text>
          <Text style={styles.headerSubtitle}>
            {filteredProfessionals.length} {filteredProfessionals.length === 1 ? 'profissional' : 'profissionais'}
          </Text>
        </View>

        {/* Barra de busca aprimorada */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Search size={20} color="#64748b" style={styles.searchIcon} />
            <TextInput
              placeholder='Buscar por nome...'
              placeholderTextColor='#94a3b8'
              style={styles.searchInput}
              value={nameProf}
              onChangeText={setNameProf}
              onSubmitEditing={buscarProfissional}
            />
            {nameProf.length > 0 && (
              <TouchableOpacity onPress={() => setNameProf('')}>
                <X size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={[styles.filterButton, filterActive && styles.filterButtonActive]}
          >
            <Filter size={20} color={filterActive ? "#fff" : "#1e293b"} />
            {filterActive && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>

        {/* Indicador de filtro ativo */}
        {filterActive && (
          <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>Filtro ativo</Text>
            <TouchableOpacity onPress={limparFiltro}>
              <X size={14} color="#0284c7" />
            </TouchableOpacity>
          </View>
        )}

        {/* Modal melhorado */}
        <Modal visible={showModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filtrar por cidade</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <X size={24} color="#1e293b" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalSearchWrapper}>
                <Search size={18} color="#64748b" />
                <TextInput
                  placeholder="Pesquisar cidade..."
                  placeholderTextColor="#94a3b8"
                  value={searchCity}
                  onChangeText={setSearchCity}
                  style={styles.modalSearchInput}
                />
              </View>

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
                    <MapPin size={18} color="#0284c7" />
                    <Text style={styles.cityText}>{item}</Text>
                  </TouchableOpacity>
                )}
                style={styles.cityList}
              />

              <TouchableOpacity onPress={limparFiltro} style={styles.btnLimpar}>
                <Text style={styles.txtLimpar}>Limpar filtro</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Lista de profissionais aprimorada */}
        {filteredProfessionals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhum profissional encontrado</Text>
            <Text style={styles.emptySubtitle}>Tente ajustar sua busca ou filtros</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProfessionals}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                 
                  <View style={styles.cardInfo}>
                    <Text style={styles.nome}>{item.name}</Text>
                    <View style={styles.infoRow}>
                      <MapPin size={14} color="#64748b" />
                      <Text style={styles.infoText}>{item.city} - {item.uf}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Mail size={14} color="#64748b" />
                    <Text style={styles.detailText}>{item.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Phone size={14} color="#64748b" />
                    <Text style={styles.detailText}>{item.phone}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MapPin size={14} color="#64748b" />
                    <Text style={styles.detailText}>
                      {item.address}, {item.neighborhood}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleAgendar(item.id)}
                  style={styles.btnAgendar}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#0284c7', '#0369a1']}
                    style={styles.btnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.txtAgendar}>Agendar Consulta</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginTop: '15%',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
  },
  filterButton: {
    width: 52,
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#0284c7',
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fbbf24',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#e0f2fe',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0284c7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
  },
  cityList: {
    maxHeight: 300,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  cityText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  btnLimpar: {
    marginTop: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 14,
  },
  txtLimpar: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
    color: '#475569',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  foto: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  nome: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  cardDetails: {
    gap: 10,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  btnAgendar: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  btnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  txtAgendar: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});