import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import FeelingsChart from "../../../../components/feelingCharts";
import { countFeelingPDay } from '../../../services/database';

const Analystic = () => {
  const navigation = useNavigation();
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState('');
  const [feelingDataForChart, setFeelingDataForChart] = useState([]);
  const [maxValue, setMaxValue] = useState(1);
  const [visibleDate, setVisibleDate] = useState(new Date());

  const feelingColors = {
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

  useFocusEffect(
    React.useCallback(() => {
      const fetchFeelingsFromDB = async () => {
        try {
          const result = await countFeelingPDay();

          const chartData = result.map(item => ({
            label: item.feeling.charAt(0).toUpperCase() + item.feeling.slice(1).toLowerCase(),
            value: item.total,
            color: feelingColors[item.feeling.toUpperCase()] || '#A9A9AA'
          }));

          const total = chartData.reduce((sum, item) => sum + item.value, 0);
          setFeelingDataForChart(chartData);
          setMaxValue(total > 0 ? total : 1);
        } catch (error) {
          console.error("Erro ao carregar dados do gráfico:", error);
        }
      };

      fetchFeelingsFromDB();
      StatusBar.setBackgroundColor('#A3D8F4');
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} overScrollMode="never">
      <LinearGradient colors={['#eff6ff', '#dbeafe']} style={styles.background}>
        <View style={styles.Seta}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.botaoVoltar}>
            <ChevronLeft color="black" />
          </TouchableOpacity>
          <Text>Voltar</Text>
        </View>

        <View style={styles.calendarContainer}>
          <Calendar
            current={visibleDate.toISOString().split('T')[0]}
            renderHeader={(date) => {
              const mes = meses[date.getMonth()];
              const ano = date.getFullYear();
              return <Text style={styles.calendarHeaderText}>{`${mes} ${ano}`}</Text>;
            }}
            style={{ width: 350 }}
            onDayPress={(day) => {
              setSelectedDay(day.day);
              setSelectedFeeling("Função de visualização por dia ainda não implementada com SQLite.");
              setModalVisible(true);
            }}
            onMonthChange={(month) => {
              setVisibleDate(new Date(month.dateString));
            }}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Sentimentos no dia</Text>
          <FeelingsChart data={feelingDataForChart} maxValue={maxValue} layout="horizontal" />
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(!modalVisible)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitleText}>Dia {selectedDay}</Text>
              <ScrollView style={{ maxHeight: 200 }}>
                <Text style={styles.modalText}>{selectedFeeling}</Text>
              </ScrollView>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.textStyle}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity style={{
          height: 40, width: '60%', alignItems: 'center', justifyContent: 'center', marginTop: '2%', borderRadius: 20, borderWidth: 1, alignSelf: 'center', backgroundColor: '#ffffff', borderColor: 'transparent',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 2,
        }} onPress={() => router.replace('/pages/Charts/Month')}>
          <Text style={{ fontFamily: "Nunito", fontSize: 18 }}>Acessar relatório mensal</Text>
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
        marginTop: StatusBar.currentHeight || '9%',
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
        margin: '2%',
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        fontFamily: 'Nunito',
        textAlign: 'center',
        marginTop:'3%'
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
});
