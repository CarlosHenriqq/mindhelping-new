import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import FeelingsChart from "../../../components/feelingCharts";
import { API_BASE_URL, ENDPOINTS } from '../../../config/api';
import { useUser } from '../../../context/UserContext';

// ✅ CONFIGURE O LOCALE AQUI, FORA DO COMPONENTE
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

const Analystic = () => {
  const navigation = useNavigation();
  const { userId } = useUser();
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [feelingDataForChart, setFeelingDataForChart] = useState([]);
  const [maxValue, setMaxValue] = useState(1);
  const [visibleDate, setVisibleDate] = useState(new Date());
  const [feelingsList, setFeelingsList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const feelingColors: any = {
    FELIZ: '#edd892',
    TRISTE: '#6f9ceb',
    RAIVA: '#ef6865',
    ANSIOSO: '#f1bb87',
    TEDIO: '#918ef4',
    NEUTRO: '#A9A9A9'
  };

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const fetchFeelings = async (date: any) => {
    if (!userId) return;

    const formattedDate = date.toISOString().split('T')[0];

    try {
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.FEELINGS_USER(userId)}`, {
        params: { startDay: formattedDate, endDay: formattedDate }
      });

      if (response.data && response.data.feelings) {
        const feelings = response.data.feelings;

        const counts = {
          FELIZ: 0,
          TRISTE: 0,
          RAIVA: 0,
          ANSIOSO: 0,
          TEDIO: 0,
          NEUTRO: 0
        };

        feelings.forEach(f => {
          const description = f.description === 'NÃO_SEI_DIZER' ? 'NEUTRO' : f.description;
          if (counts[description] !== undefined) counts[description]++;
        });
        setFeelingsList(feelings);
        const chartData = Object.keys(counts).map(key => ({
          description: key,
          value: counts[key],
          color: feelingColors[key]
        }));

        setFeelingDataForChart(chartData);
        setMaxValue(Math.max(...chartData.map(c => c.value), 1));
      }
    } catch (error: any) {
      console.error("Erro ao buscar sentimentos:", error.response?.data || error.message);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBackgroundColor('#A3D8F4');
      fetchFeelings(selectedDay);
    }, [selectedDay])
  );

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} overScrollMode="never">
      <LinearGradient colors={['#eff6ff', '#dbeafe']} style={styles.background}>
        <View style={styles.Seta}>
          <TouchableOpacity onPress={() => router.replace('/pages/Home')} style={styles.botaoVoltar}>
            <ChevronLeft color="black" />
          </TouchableOpacity>
          <Text style={{fontSize:16}}>Voltar</Text>
        </View>

        <View style={styles.calendarContainer}>
          <Calendar
            current={visibleDate.toISOString().split('T')[0]}
            renderHeader={(date) => {
              const mes = meses[date.getMonth()];
              const ano = date.getFullYear();
              return <Text style={styles.calendarHeaderText}>{`${mes} ${ano}`}</Text>;
            }}
            style={{ width: 320, backgroundColor: 'transparent'}}
            firstDay={0} // ✅ Adicione isso - 0 = Domingo (padrão brasileiro)
            onDayPress={(day) => {
              const pressedDate = new Date(day.dateString);
              setSelectedDay(pressedDate);
              fetchFeelings(pressedDate);
            }}
            onMonthChange={(month) => { setVisibleDate(new Date(month.dateString)); }}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Sentimentos no dia</Text>
          <FeelingsChart data={feelingDataForChart} maxValue={maxValue} layout="horizontal" />

          <TouchableOpacity
            style={styles.buttonSeeMotives}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>Ver motivos</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Motivos dos sentimentos</Text>
              <ScrollView style={{ maxHeight: 300, width: '100%' }}>
                {feelingsList.length > 0 ? (
                  Object.entries(feelingsList.reduce((acc: any, f: any) => {
                    const description = f.description === 'NÃO_SEI_DIZER' ? 'NEUTRO' : f.description;
                    if (!acc[description]) acc[description] = [];
                    if (f.motive) acc[description].push(f.motive);
                    return acc;
                  }, {})).map(([feeling, motives], index) => (
                    <View key={index} style={{ marginBottom: 10 }}>
                      <Text style={{ color: feelingColors[feeling], fontWeight: 'bold', fontSize: 16 }}>
                        {feeling}
                      </Text>
                      {motives.map((motive, idx) => (
                        <Text key={idx} style={{ fontSize: 14, marginLeft: 10, marginTop: 2 }}>• {motive}</Text>
                      ))}
                    </View>
                  ))
                ) : (
                  <Text style={{ textAlign: 'center', marginTop: 10 }}>Nenhum sentimento registrado nesse dia.</Text>
                )}
              </ScrollView>
              <TouchableOpacity style={styles.buttonCloseModal} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity style={styles.buttonMonthlyReport} onPress={() => router.replace('/pages/Charts/Month')}>
          <Text style={{ fontSize: 12, fontWeight:'semibold' }}>ACESSAR RELATÓRIO MENSAL</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </LinearGradient>
    </ScrollView>
  );
};

export default Analystic;



const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',

  },
  Seta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginTop: StatusBar.currentHeight || 50,
  },
  botaoVoltar: {
    padding: 10,
    borderRadius: 5,
    left: 10,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    padding: '2%',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    margin: 10
  },
  calendarHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Nunito',
    bottom: 3
  },
  chartContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 10,
    margin: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Nunito',
    textAlign: 'center',
    marginTop: '3%'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    minWidth: 100,
    marginTop: 15,
  },
  buttonClose: {
    backgroundColor: '#27361f',
  },
  buttonSeeMotives: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,

    alignSelf: 'center'
  },
  buttonText: {
    color: '#000000',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    fontFamily: 'Nunito',
    textAlign: 'center'
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Nunito'
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Nunito'
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Nunito',
  },
  buttonCloseModal: {
    marginTop: 15,
    padding: 10,
    borderRadius: 10,

    width: 100,
    alignItems: 'center',
    alignSelf: 'center'
  },
  modalTitle: {
    marginBottom: '5%',
    fontWeight: 'bold'
  },
  buttonMonthlyReport: {
    height: 40,
    width: '60%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '2%',
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10
  },
});
