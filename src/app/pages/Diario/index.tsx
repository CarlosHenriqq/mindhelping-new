import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Search } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { CalendarProvider, ExpandableCalendar, LocaleConfig } from 'react-native-calendars';

export default function Diario() {
  const [anotacoes, setAnotacoes] = useState("");

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  LocaleConfig.locales['pt'] = {
    monthNames: meses,
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    today: "Hoje"
  };
  LocaleConfig.defaultLocale = 'pt';

  const today = new Date();
  const entryDate = today.toISOString().split("T")[0];

  // 🔹 Carrega as anotações do AsyncStorage quando a tela abre
  useEffect(() => {
    const fetchAnotacoes = async () => {
      const diarios = await AsyncStorage.getItem('AnotacaoDiario');
      setAnotacoes(diarios || ""); // se não existir, vira string vazia
    };
    fetchAnotacoes();
  }, []);

  return (
    <View style={styles.container}>
      {/* 🔍 Caixa de pesquisa */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Pesquisar"
          placeholderTextColor={'#161616ff'}
          style={styles.input}
        />
        <Search size={20} color={'#161616ff'} style={styles.icon} />
      </View>

      {/* 📅 Calendário */}
      <View style={{ marginTop: '40%' }}>
        <CalendarProvider date={entryDate}>
          <View style={styles.calendarWrapper}>
            <ExpandableCalendar
              initialPosition={"closed"}
              firstDay={1}
              locale="pt"
              renderHeader={(date) => {
                const d = new Date(date);
                const mes = meses[d.getMonth()];
                const ano = d.getFullYear();
                return <Text style={styles.calendarHeaderText}>{`${mes} ${ano}`}</Text>;
              }}
              theme={{
                todayTextColor: "#2980B9",
                selectedDayBackgroundColor: "#2980B9",
                selectedDayTextColor: "#fff",
                arrowColor: "#000",
                textMonthFontWeight: "bold",
                textDayFontWeight: "500",
              }}
            />
          </View>
        </CalendarProvider>

        {/* 📖 Lista de anotações */}
        <View style={{ marginBottom: '75%' }}>
          {anotacoes.length === 0 ? (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#161616ff', fontWeight: 'bold', fontSize: 16 }}>
                Nenhuma anotação encontrada
              </Text>
            </View>
          ) : (
            <View style={{ padding: 10, borderRadius:20, borderWidth:1, backgroundColor:'white', width:'90%', alignSelf:'center' }}>
              <Text style={{ color: '#161616ff', fontSize: 16 }}>{anotacoes}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ➕ Botão Nova Nota */}
      <TouchableOpacity
        style={styles.newMetaContainer}
        onPress={() => router.replace("/pages/Diario/Anotacoes")}
      >
        <Text style={{
          color: 'white',
          fontWeight: 'bold',
          fontSize: 35,
          position: 'absolute',
          bottom: '20%',
          right: '30%'
        }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    searchContainer: {
        width: '90%',
        position: 'absolute',
        bottom: '85%'
    },
    input: {
        borderWidth: 1,
        borderRadius: 20,
        height: 50,
        paddingLeft: 40, // espaço para o ícone
        paddingRight: 15,
        fontSize: 16,
        backgroundColor: 'white',
        borderColor: 'transparent',
        elevation: 5, // sombra no Android
        shadowColor: "#000", // sombra no iOS
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    icon: {
        position: 'absolute',
        left: 12,
        top: 13,
    },
    calendarHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        fontFamily: 'Nunito',
        bottom: 3,
    },
    calendarWrapper: {
        width: "100%",
        borderRadius: 20,
        overflow: "hidden", // mantém bordas arredondadas
        backgroundColor: "#fff",
        elevation: 5, // sombra no Android
        shadowColor: "#000", // sombra no iOS
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 }
    },
    newMetaContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#2980B9',
        width: 60,
        height: 60,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        elevation: 5,
    },
});
