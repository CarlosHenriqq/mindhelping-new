import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Calendar as CalendarIcon, ChevronLeft, Clock, Mail, MapPin, Phone } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Calendar, DateObject } from "react-native-calendars";
import { CustomAlert, useCustomAlert } from "../../../../components/CustomAlert";
import { API_BASE_URL, ENDPOINTS } from "../../../../config/api";
import { useUser } from "../../../../context/UserContext";

export interface Professional {
  name: string;
  email: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  uf: string;
}

export interface Vaga {
  date: string;
  hours: string[];
}

export default function AgendarConsulta() {
  const { id, returnTo } = useLocalSearchParams();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [horarios, setHorarios] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [visibleDate, setVisibleDate] = useState(new Date());
  const { userId } = useUser();
  const { alertConfig, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();
  const [modalVisible, setModalVisible] = useState(false);
  const [hourSelected, setHourSelected] = useState<string | null>(null);
  const [selectedHourlyMap, setSelectedHourlyMap] = useState<Map<string, any> | null>(null);

  useEffect(() => {
    async function fetchProf() {
      try {
        const url = `${API_BASE_URL}${ENDPOINTS.PROFESSIONAL_ID(id)}`;
        console.log("🔗 URL chamada:", url);
        const response = await axios.get(url);
        setProfessional(response.data.professional);
      } catch (error) {
        console.log("Erro ao buscar profissional:", error);
      }
    }
    if (id) fetchProf();
  }, [id]);

  async function fetchSchedules() {
    try {
      const url = `${API_BASE_URL}${ENDPOINTS.SCHEDULES_GET(id)}`;
      console.log("🔗 URL chamada schedules:", url);
      console.log("📋 ID do profissional:", id);

      const response = await axios.get(url);
      console.log("✅ Resposta schedules:", response.data);

      const schedulesData = response.data.schedules;

      if (!schedulesData || schedulesData.length === 0) {
        console.log("⚠️ Nenhuma agenda cadastrada para este profissional");
        setSchedules([]);
        setVagas([]);
        setMarkedDates({});
        return;
      }

      setSchedules(schedulesData);

      const vagasConvertidas: Vaga[] = [];
      schedulesData.forEach((sch: any) => {
        if (!sch.initialTime) return;
        const [date] = sch.initialTime.split("T");
        const existing = vagasConvertidas.find((v) => v.date === date);
        if (!existing) {
          vagasConvertidas.push({ date, hours: [] });
        }
      });

      setVagas(vagasConvertidas);

      const marks: any = {};
      vagasConvertidas.forEach((vaga) => {
        marks[vaga.date] = {
          customStyles: {
            container: { backgroundColor: '#0ea5e9', borderRadius: 12 },
            text: { color: "white", fontWeight: "bold" },
          },
        };
      });
      setMarkedDates(marks);
    } catch (error: any) {
      console.log("❌ Erro ao buscar schedules:", error);
      if (error.response?.status === 404) {
        console.log("⚠️ Endpoint não encontrado ou sem agendas para este profissional");
        setSchedules([]);
        setVagas([]);
        setMarkedDates({});
      }
    }
  }

  useEffect(() => {
    if (!id) return;
    setSchedules([]);
    setVagas([]);
    setMarkedDates({});
    setSelectedDate(null);
    setHorarios([]);
    fetchSchedules();
  }, [id]);

  async function onDayPress(day: DateObject) {
    setSelectedDate(day.dateString);
    setHorarios([]);

    const schedule = schedules.find((sch: any) =>
      sch.initialTime?.startsWith(day.dateString)
    );
    if (!schedule) {
      console.log("⚠️ Nenhuma agenda para este dia:", day.dateString);
      return;
    }

    try {
      const url = `${API_BASE_URL}${ENDPOINTS.HOUR_GET(schedule.id)}`;
      console.log("🔗 Chamando hour_get:", url);

      const response = await axios.get(url);
      const hourlies = response.data.hourlies;
      const availableHourlies = hourlies.filter((h: any) => !h.isOcuped);

      const hourlyMap = new Map(
        availableHourlies.map((h: any) => [h.hour, h])
      );

      setSelectedHourlyMap(hourlyMap);

      const availableHours = availableHourlies.map((h: any) => h.hour);
      setHorarios(availableHours);

      console.log("✅ Hourlies disponíveis:", availableHourlies);
    } catch (error) {
      console.log("Erro ao buscar horários:", error);
    }
  }

  async function confirmScheduling() {
    if (!selectedDate || !hourSelected) return;

    const schedule = schedules.find((sch: any) =>
      sch.initialTime?.startsWith(selectedDate)
    );

    if (!schedule) {
      console.warn("Nenhum schedule encontrado para o dia:", selectedDate);
      return;
    }

    const hourly = selectedHourlyMap?.get(hourSelected);

    if (!hourly) {
      console.error("❌ Hourly não encontrado para o horário:", hourSelected);
      showError('Erro', 'Não foi possível encontrar informações do horário selecionado');
      return;
    }

    console.log("💾 Hourly selecionado:", hourly);

    try {
      const payload = {
        professionalPersonId: id,
        userPersonId: userId,
        scheduleId: schedule.id,
        hourlyId: hourly.id,
        hour: hourSelected,
        date: selectedDate,
      };

      console.log("📤 Enviando agendamento:", payload);

      const response = await axios.post(
        `${API_BASE_URL}${ENDPOINTS.SCHEDULING}`,
        payload
      );

      console.log("✅ Agendamento realizado:", response.data);

      const cacheData = {
        hourlyId: hourly.id,
        date: selectedDate,
        hour: hourSelected,
        professionalId: id,
        userId: userId,
        scheduleId: schedule.id,
        createdAt: new Date().toISOString()
      };

      const cacheKey = `appointment_${userId}_${selectedDate}_${hourSelected}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));

      console.log("💾 Cache salvado:", cacheKey);

      setModalVisible(false);

      setTimeout(() => {
        showSuccess('Sucesso!', 'Agendamento realizado com sucesso!');
      }, 150);

      setHorarios((prev) => prev.filter((h) => h !== hourSelected));

      await new Promise((res) => setTimeout(res, 500));
      await fetchSchedules();

    } catch (error: any) {
      console.log("❌ Erro ao agendar:", error.response?.status);

      if (error.response?.status === 500) {
        setModalVisible(false);
        setTimeout(() => {
          showError(
            'Erro no Agendamento',
            'Não é possível agendar uma consulta em horário retroativo.'
          );
        }, 300);

        setSchedules([]);
        setVagas([]);
        setMarkedDates({});
        setSelectedDate(null);  
        setHorarios([]);        
        setHourSelected(null);  
        setSelectedHourlyMap(null); 
      }

      console.error("❌ Erro:", error);
    }
  }
  // Adicione este useEffect após os outros useEffects
useEffect(() => {
  // Quando o modal fecha e não há data selecionada, recarrega as agendas
  if (!modalVisible && !selectedDate && schedules.length === 0) {
    fetchSchedules();
  }
}, [modalVisible]);

  function formatDateBR(dateString: string) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }

  useEffect(() => {
    const marks: any = {};
    vagas.forEach((vaga) => {
      marks[vaga.date] = {
        customStyles: {
          container: { backgroundColor: '#0ea5e9', borderRadius: 12 },
          text: { color: "white", fontWeight: "bold" },
        },
      };
    });
    setMarkedDates(marks);
  }, [vagas]);

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleGoBack = () => {
    if (returnTo) {
      router.replace(returnTo as any);
    } else {
      router.replace('/pages/Home');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#f0f9ff', '#e0f2fe', '#bae6fd']} style={{ flex: 1 }}>
        <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header com botão voltar */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.botaoVoltar}>
              <ChevronLeft color="#0f172a" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Agendar Consulta</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.screen}>
            {/* Card do profissional aprimorado */}
            {professional ? (
              <View style={styles.card}>
                <View style={styles.cardHeader}>

                  <View style={styles.profInfo}>
                    <Text style={styles.profName}>{professional.name}</Text>
                    <Text style={styles.profTitle}>Psicólogo(a)</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.contactInfo}>
                  <View style={styles.infoRow}>
                    <Mail size={16} color="#64748b" />
                    <Text style={styles.infoText}>{professional.email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Phone size={16} color="#64748b" />
                    <Text style={styles.infoText}>{professional.phone}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MapPin size={16} color="#64748b" />
                    <Text style={styles.infoText}>
                      {`${professional.address}, ${professional.neighborhood}`}
                    </Text>
                  </View>
                  <View style={[styles.infoRow, { paddingLeft: 22 }]}>
                    <Text style={styles.infoText}>
                      {`${professional.city} - ${professional.uf}`}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.loadingCard}>
                <Text style={styles.loadingText}>Carregando informações...</Text>
              </View>
            )}

            {/* Calendário aprimorado */}
            <View style={styles.agendaContainer}>
              <View style={styles.calendarHeader}>
                <CalendarIcon size={20} color="#0284c7" />
                <Text style={styles.calendarTitle}>Selecione uma data</Text>
              </View>

              <View style={styles.calendarWrapper}>
                <Calendar
                  onDayPress={onDayPress}
                  markedDates={{
                    ...markedDates,
                    ...(selectedDate && {
                      [selectedDate]: {
                        selected: true,
                        selectedColor: "#0284c7",
                        marked: markedDates[selectedDate]?.marked,
                        dotColor: markedDates[selectedDate]?.dotColor,
                      },
                    }),
                  }}
                  markingType="custom"
                  current={visibleDate.toISOString().split('T')[0]}
                  renderHeader={(date) => {
                    const mes = meses[date.getMonth()];
                    const ano = date.getFullYear();
                    return <Text style={styles.calendarHeaderText}>{`${mes} ${ano}`}</Text>;
                  }}
                  onMonthChange={(month) => {
                    setVisibleDate(new Date(month.dateString));
                  }}
                  theme={{
                    todayTextColor: "#0284c7",
                    arrowColor: "#0284c7",
                    textMonthFontSize: 18,
                    textMonthFontWeight: "bold",
                    textDayFontSize: 15,
                    textDayFontWeight: "500",
                  }}
                  style={styles.calendar}
                />
              </View>

              {/* Horários disponíveis */}
              {selectedDate && (
                <View style={styles.horariosContainer}>
                  <View style={styles.horariosHeader}>
                    <Clock size={20} color="#0284c7" />
                    <Text style={styles.horariosTitle}>
                      Horários em {formatDateBR(selectedDate)}
                    </Text>
                  </View>

                  {horarios.length > 0 ? (
                    <FlatList
                      scrollEnabled={false}
                      data={horarios}
                      keyExtractor={(item, index) => index.toString()}
                      numColumns={3}
                      columnWrapperStyle={styles.horariosGrid}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.horaBtn}
                          onPress={() => {
                            setHourSelected(item);
                            setModalVisible(true);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.horaText}>{item}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  ) : (
                    <View style={styles.noHorariosContainer}>
                      <Text style={styles.noHorariosText}>Sem horários disponíveis</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Modal aprimorado */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <View style={styles.modalIconContainer}>
                <CalendarIcon size={32} color="#0284c7" />
              </View>

              <Text style={styles.modalTitle}>Confirmar Agendamento</Text>

              <View style={styles.modalInfoBox}>
                <View style={styles.modalInfoRow}>
                  <CalendarIcon size={18} color="#64748b" />
                  <Text style={styles.modalInfoText}>
                    {selectedDate ? formatDateBR(selectedDate) : ""}
                  </Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Clock size={18} color="#64748b" />
                  <Text style={styles.modalInfoText}>{hourSelected}</Text>
                </View>
              </View>

              <Text style={styles.modalSubtext}>
                Deseja confirmar este agendamento?
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnCancel]}
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalBtnTextCancel}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnConfirm]}
                  onPress={confirmScheduling}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#0284c7', '#0369a1']}
                    style={styles.btnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.modalBtnTextConfirm}>Confirmar</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <CustomAlert
          visible={alertConfig.visible}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={hideAlert}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  foto: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  profInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  profTitle: {
    fontSize: 14,
    color: '#0284c7',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 16,
  },
  contactInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
    lineHeight: 20,
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 15,
    color: '#64748b',
  },
  agendaContainer: {
    flex: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  calendarWrapper: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  calendar: {
    paddingVertical: 10,
  },
  calendarHeaderText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  horariosContainer: {
    marginTop: 24,
  },
  horariosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  horariosTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  horariosGrid: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  horaBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  horaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  noHorariosContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  noHorariosText: {
    fontSize: 15,
    color: '#64748b',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInfoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalSubtext: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalBtnCancel: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalBtnConfirm: {},
  btnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalBtnTextCancel: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 16,
  },
  modalBtnTextConfirm: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});