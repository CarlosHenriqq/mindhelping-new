import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar, DateObject } from "react-native-calendars";
import { API_BASE_URL, ENDPOINTS } from "../../../../config/api";

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
  date: string;      // formato: "2025-09-05"
  hours: string[];   // horários disponíveis nesse dia
}

export default function AgendarConsulta() {
  const { id } = useLocalSearchParams();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [horarios, setHorarios] = useState<string[]>([]);

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

  // 📌 Mock de vagas enquanto API não está pronta
  useEffect(() => {
    const mockVagas: Vaga[] = [
      { date: "2025-09-05", hours: ["09:00", "10:00", "14:00"] },
      { date: "2025-09-07", hours: ["11:00", "15:30", "16:00"] },
      { date: "2025-09-10", hours: ["08:30", "09:30", "13:00", "17:00"] },
    ];
    setVagas(mockVagas);

    // Constrói objeto para o calendário
    const marks: any = {};
    mockVagas.forEach(vaga => {
      marks[vaga.date] = {
        marked: true,
        dotColor: "green",
      };
    });
    setMarkedDates(marks);
  }, []);

  function onDayPress(day: DateObject) {
    setSelectedDate(day.dateString);

    // Busca horários desse dia
    const vaga = vagas.find(v => v.date === day.dateString);
    if (vaga) {
      setHorarios(vaga.hours);
    } else {
      setHorarios([]);
    }
  }
  function formatDateBR(dateString: string) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Agendamento de consulta</Text>

      {professional ? (
        <View style={styles.card}>
          <Image
            source={{ uri: `https://i.pravatar.cc/150?u=${professional.email}` }}
            style={styles.foto}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{professional.name}</Text>
            <Text style={styles.infoText}>E-mail: {professional.email}</Text>
            <Text style={styles.infoText}>Telefone: {professional.phone}</Text>
            <Text style={styles.infoText}>
              Endereço: {`${professional.address}, ${professional.neighborhood}, ${professional.city} - ${professional.uf}`}
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
                dotColor: "white",
              },
            }),
          }}
          theme={{
            selectedDayBackgroundColor: "#2980B9",
            todayTextColor: "#2980B9",
            arrowColor: "#2980B9",
            textMonthFontSize: 20,
            textMonthFontWeight: "bold",

          }}
          style={{ borderRadius: 20, padding: 10 }}
          renderHeader={(date) => {
            const monthName = date.toString("MMMM"); // Só o nome do mês
            return (
              <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", color: "#000000" }}>
                {monthName}
              </Text>
            );
          }}
          hideArrows={true} //  tira as setas de navegação
        />

        {/* Horários disponíveis */}
        {selectedDate && (
          <View style={{ marginTop: 20, flex: 1 }}>
            <Text style={styles.subtitle}>Horários em {formatDateBR(selectedDate)}:</Text>
            {horarios.length > 0 ? (
              <FlatList
                data={horarios}
                keyExtractor={(item, index) => index.toString()}
                numColumns={3}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.horaBtn}>
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
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: "20%",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 12,
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
    flex: 1,

    shadowColor: "#000000",
    shadowRadius: 10,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  horaBtn: {
    backgroundColor: "#2980B9",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  horaText: {
    color: "white",
    fontWeight: "bold",
  },
});
