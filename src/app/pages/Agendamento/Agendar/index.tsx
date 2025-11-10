import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
  date: string; // formato: "2025-09-05"
  hours: string[]; // horários disponíveis nesse dia
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
  const [selectedHourlyMap, setSelectedHourlyMap] = useState<Map<string, any> | null>(null); // 🔥 NOVO

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

      // Verifica se há schedules
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
            container: { backgroundColor: '#27ae60', borderRadius: 10 },
            text: { color: "white", fontWeight: "bold" },
          },
        };
      });
      setMarkedDates(marks);
    } catch (error: any) {
      console.log("❌ Erro ao buscar schedules:", error);
      console.log("❌ Response:", error.response?.data);
      console.log("❌ Status:", error.response?.status);

      // Se for 404, provavelmente não há agendas cadastradas
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

    // Limpar estados antes de buscar novos dados
    setSchedules([]);
    setVagas([]);
    setMarkedDates({});
    setSelectedDate(null);
    setHorarios([]);

    fetchSchedules();
  }, [id]); // ← Adicionar id como dependência



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

      // 🔥 Criar mapa de hora -> hourly completo
      const hourlyMap = new Map(
        availableHourlies.map((h: any) => [h.hour, h])
      );

      // 🔥 Salvar o mapa
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
    console.log("💾 ID do hourly:", hourly.id);

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

      // 🔥 USAR O HOURLY.ID COMO CHAVE DIRETAMENTE
      // Já que não temos o appointmentId, vamos criar um mapeamento diferente
      const cacheData = {
        hourlyId: hourly.id,
        date: selectedDate,
        hour: hourSelected,
        professionalId: id,
        userId: userId,
        scheduleId: schedule.id,
        createdAt: new Date().toISOString()
      };

      // Salvar usando uma chave composta: userId + date + hour
      const cacheKey = `appointment_${userId}_${selectedDate}_${hourSelected}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));

      console.log("💾 ============ SALVANDO NO CACHE ============");
      console.log("💾 Cache key:", cacheKey);
      console.log("💾 Cache data:", cacheData);
      console.log("💾 ============================================");

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
      }

      console.error("❌ Erro:", error);
    }
  }




  function formatDateBR(dateString: string) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }
  useEffect(() => {
    const marks: any = {};
    vagas.forEach((vaga) => {
      marks[vaga.date] = {
        customStyles: {
          container: { backgroundColor: '#27ae60', borderRadius: 10 },
          text: { color: "white", fontWeight: "bold" },
        },
      };
    });

    setMarkedDates(marks);
  }, [vagas]); // só roda quando `vagas` muda

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
      <LinearGradient colors={['#eff6ff', '#dbeafe']} style={{ flex: 1 }}>

        <ScrollView
          bounces={false}
          contentContainerStyle={{ flexGrow: 1 }} // ← IMPORTANTE!
        >
          <TouchableOpacity onPress={handleGoBack} style={styles.botaoVoltar}>
            <ChevronLeft color="#333" size={24} />
            <Text style={styles.textoVoltar}>Voltar</Text>
          </TouchableOpacity>
          <View style={styles.screen}>
            <Text style={styles.title}>Agendamento de consulta</Text>

            {professional ? (
              <View style={styles.card}>
                <Image
                  source={{
                    uri: `https://i.pravatar.cc/150?u=${professional.email}`,
                  }}
                  style={styles.foto}
                />
                <View style={styles.infoContainer}>
                  <Text style={styles.name}>{professional.name}</Text>
                  <Text style={styles.infoText}>E-mail: {professional.email}</Text>
                  <Text style={styles.infoText}>Telefone: {professional.phone}</Text>
                  <Text style={styles.infoText}>
                    Endereço:{" "}
                    {`${professional.address}, ${professional.neighborhood}, ${professional.city} - ${professional.uf}`}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={{ marginTop: 20 }}>Carregando informações...</Text>
            )}

            {/* 📅 Calendário */}
            <View style={styles.agendaContainer}>
              <Calendar
                onDayPress={onDayPress}
                markedDates={{
                  ...markedDates,
                  ...(selectedDate && {
                    [selectedDate]: {
                      selected: true,
                      selectedColor: "#2980B9",
                      marked: markedDates[selectedDate]?.marked,
                      dotColor: markedDates[selectedDate]?.dotColor || "green",
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
                  todayTextColor: "#2980B9",
                  arrowColor: "#2980B9",
                  textMonthFontSize: 20,
                  textMonthFontWeight: "bold",
                }}
                style={{ borderRadius: 20, padding: 10 }}
              />

              {/* Horários disponíveis */}
              {selectedDate && (
                <View style={{ marginTop: 20, paddingBottom: 20 }}>
                  <Text style={styles.subtitle}>
                    Horários em {formatDateBR(selectedDate)}:
                  </Text>
                  {horarios.length > 0 ? (
                    <FlatList
                      scrollEnabled={false}
                      data={horarios}
                      keyExtractor={(item, index) => index.toString()}
                      numColumns={3}
                      columnWrapperStyle={{ justifyContent: "space-between" }}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.horaBtn}
                          onPress={() => {
                            setHourSelected(item);
                            setModalVisible(true);
                          }}
                        >
                          <Text style={styles.horaText}>{item}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  ) : (
                    <Text style={{ marginTop: 10 }}>Sem horários disponíveis</Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Modal de confirmação */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirmar Agendamento</Text>
              <Text style={styles.modalText}>
                Deseja confirmar o agendamento em{"\n"}
                {selectedDate ? formatDateBR(selectedDate) : ""} às{" "}
                {hourSelected}?
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#95a5a6" }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#27ae60" }]}
                  onPress={confirmScheduling}
                >
                  <Text style={styles.modalBtnText}>Confirmar</Text>
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
  screen: {
    flex: 1, // ← Mantenha isso
    paddingTop: 20,
    alignItems: "center",
    paddingBottom: 20, // ← Adicione um padding no final
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  botaoVoltar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    marginLeft: 10
  },
  textoVoltar: {
    fontSize: 16,
    color: '#333',

  },
  card: {
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 20,
    marginHorizontal: "5%",
    padding: 15,
    width: "90%",
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    shadowColor: "#000000",
    shadowRadius: 10,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  foto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  infoContainer: {
    flex: 1,
    marginLeft: "2.5%",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  agendaContainer: {
    marginTop: "10%",
    borderWidth: 1,
    borderColor: "transparent",
    width: "90%",
    // REMOVA o flex: 1 daqui se tiver
    marginBottom: 20, // ← Adicione margem no final
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  calendarHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Nunito',
    bottom: 3
  },
  horaBtn: {
    backgroundColor: "#4a78b4ff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  horaText: {
    color: "white",
    fontWeight: "bold",
  },
  // modal
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  modalBtnText: {
    color: "white",
    fontWeight: "bold",
  },
});
