import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Calendar as CalendarIcon, ChevronLeft, Eye, TrendingUp, X } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import FeelingsChart from "../../../components/feelingCharts";
import { API_BASE_URL, ENDPOINTS } from '../../../config/api';
import { useUser } from '../../../context/UserContext';

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
      StatusBar.setBackgroundColor('#f0f9ff');
      fetchFeelings(selectedDay);
    }, [selectedDay])
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} overScrollMode="never">
      <LinearGradient colors={['#f0f9ff', '#e0f2fe', '#bae6fd']} style={styles.background}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/pages/Home')} style={styles.botaoVoltar}>
            <ChevronLeft color="#0f172a" size={24} strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Análise Diária</Text>
            <Text style={styles.headerSubtitle}>Seus sentimentos</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Data selecionada */}
        <View style={styles.selectedDateCard}>
          <CalendarIcon size={20} color="#0284c7" />
          <Text style={styles.selectedDateText}>{formatDate(selectedDay)}</Text>
        </View>

        {/* Calendário */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={visibleDate.toISOString().split('T')[0]}
            renderHeader={(date) => {
              const mes = meses[date.getMonth()];
              const ano = date.getFullYear();
              return <Text style={styles.calendarHeaderText}>{`${mes} ${ano}`}</Text>;
            }}
            firstDay={0}
            onDayPress={(day) => {
              const pressedDate = new Date(day.dateString);
              setSelectedDay(pressedDate);
              fetchFeelings(pressedDate);
            }}
            onMonthChange={(month) => { 
              setVisibleDate(new Date(month.dateString)); 
            }}
            markedDates={{
              [selectedDay.toISOString().split('T')[0]]: {
                selected: true,
                selectedColor: '#0284c7'
              }
            }}
            theme={{
              todayTextColor: "#0284c7",
              arrowColor: "#0284c7",
              textMonthFontSize: 17,
              textMonthFontWeight: "bold",
              textDayFontSize: 15,
              textDayFontWeight: "500",
            }}
          />
        </View>

        {/* Gráfico de Sentimentos */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Sentimentos do Dia</Text>
            {feelingsList.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{feelingsList.length}</Text>
              </View>
            )}
          </View>

          <View style={styles.chartWrapper}>
            <FeelingsChart 
              data={feelingDataForChart} 
              maxValue={maxValue} 
              layout="horizontal" 
            />
          </View>

          {feelingsList.length > 0 ? (
            <TouchableOpacity
              style={styles.buttonSeeMotives}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Eye size={18} color="#0284c7" />
              <Text style={styles.buttonSeeMotivestext}>Ver motivos detalhados</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhum sentimento registrado neste dia</Text>
            </View>
          )}
        </View>

        {/* Modal de Motivos */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Motivos dos Sentimentos</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color="#1e293b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {feelingsList.length > 0 ? (
                  Object.entries(feelingsList.reduce((acc: any, f: any) => {
                    const description = f.description === 'NÃO_SEI_DIZER' ? 'NEUTRO' : f.description;
                    if (!acc[description]) acc[description] = [];
                    if (f.motive) acc[description].push(f.motive);
                    return acc;
                  }, {})).map(([feeling, motives], index) => (
                    <View key={index} style={styles.motivesGroup}>
                      <View style={styles.feelingBadge}>
                        <View 
                          style={[
                            styles.feelingDot, 
                            { backgroundColor: feelingColors[feeling] }
                          ]} 
                        />
                        <Text style={styles.feelingName}>{feeling}</Text>
                      </View>
                      {motives.length > 0 ? (
                        motives.map((motive, idx) => (
                          <View key={idx} style={styles.motiveItem}>
                            <Text style={styles.motiveBullet}>•</Text>
                            <Text style={styles.motiveText}>{motive}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noMotiveText}>Sem motivo especificado</Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyModalText}>
                    Nenhum sentimento registrado nesse dia.
                  </Text>
                )}
              </ScrollView>

              <TouchableOpacity 
                style={styles.buttonCloseModal} 
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonCloseText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Botão Relatório Mensal */}
        <TouchableOpacity 
          style={styles.buttonMonthlyReport} 
          onPress={() => router.replace('/pages/Charts/Month')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#0284c7', '#0369a1']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TrendingUp size={20} color="#fff" />
            <Text style={styles.buttonMonthlyText}>Relatório Mensal</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </LinearGradient>
    </ScrollView>
  );
};

export default Analystic;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 60,
    paddingBottom: 20,
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
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  selectedDateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedDateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  calendarHeaderText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  chartContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  countBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284c7',
  },
  chartWrapper: {
    marginBottom: 20,
  },
  buttonSeeMotives: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  buttonSeeMotivestext: {
    color: '#0284c7',
    fontWeight: '600',
    fontSize: 15,
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalScroll: {
    maxHeight: 300,
  },
  motivesGroup: {
    marginBottom: 20,
  },
  feelingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  feelingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  feelingName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  motiveItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 20,
  },
  motiveBullet: {
    fontSize: 16,
    color: '#64748b',
    marginRight: 8,
  },
  motiveText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
    lineHeight: 20,
  },
  noMotiveText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
    paddingLeft: 20,
  },
  emptyModalText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#64748b',
    paddingVertical: 20,
  },
  buttonCloseModal: {
    marginTop: 20,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonCloseText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonMonthlyReport: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  buttonMonthlyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});