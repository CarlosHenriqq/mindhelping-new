import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useMemo, useState } from "react"; // Importe o useMemo
import { Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import FeelingsChart from "../../../../components/feelingCharts"; // Seu componente importado

const Analystic = () => {
    const navigation = useNavigation();
    const [dailyFeelings, setDailyFeelings] = useState({});
    const [selectedDay, setSelectedDay] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFeeling, setSelectedFeeling] = useState('');

    // ✅ 1. NOVO ESTADO PARA CONTROLAR O MÊS VISÍVEL
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
            const getDailyFeelings = async () => {
                try {
                    const storedFeelings = await AsyncStorage.getItem('@dailyFeelings');
                    const parsedFeelings = storedFeelings ? JSON.parse(storedFeelings) : {};
                    setDailyFeelings(parsedFeelings);
                } catch (e) {
                    console.log("Erro ao ler os sentimentos diários: ", e);
                }
            };
            getDailyFeelings();
        }, [])
    );

    useFocusEffect(
        React.useCallback(() => {
            StatusBar.setBackgroundColor('#A3D8F4');
        }, [])
    );

    const handleDayPress = (day) => {
        setSelectedDay(day.day);
        const feelingsForDay = dailyFeelings[day.dateString];

        let feelingText = 'Nenhum sentimento registrado';
        if (Array.isArray(feelingsForDay) && feelingsForDay.length > 0) {
            feelingText = feelingsForDay.map(entry => {
                const formattedFeeling = entry.feeling.charAt(0).toUpperCase() + entry.feeling.slice(1).toLowerCase();
                const noteText = entry.note ? `\n  - Nota: ${entry.note}` : '';
                return `${formattedFeeling} às ${entry.time}${noteText}`;
            }).join('\n\n');
        }

        setSelectedFeeling(feelingText);
        setModalVisible(true);
    };

    // ✅ 3. LÓGICA DE FILTRAGEM E CONTAGEM DENTRO DE UM useMemo
    const { feelingDataForChart, maxValue } = useMemo(() => {
        const selectedYear = visibleDate.getFullYear();
        const selectedMonth = visibleDate.getMonth();

        const feelingCounts = {
            FELIZ: 0, TRISTE: 0, RAIVA: 0,
            ANSIOSO: 0, TEDIO: 0, NEUTRO: 0
        };

        // Filtra as chaves (datas) para pegar apenas as do mês e ano visíveis
        Object.keys(dailyFeelings).forEach(dateString => {
            const entryDate = new Date(dateString);
            if (entryDate.getFullYear() === selectedYear && entryDate.getMonth() === selectedMonth) {
                const dayEntries = dailyFeelings[dateString];
                if (Array.isArray(dayEntries)) {
                    dayEntries.forEach(entry => {
                        if (entry && entry.feeling) {
                            const upperFeeling = String(entry.feeling).toUpperCase();
                            if (feelingCounts[upperFeeling] !== undefined) {
                                feelingCounts[upperFeeling]++;
                            }
                        }
                    });
                }
            }
        });

        const dataForChart = Object.keys(feelingCounts).map(key => ({
            label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
            value: feelingCounts[key],
            color: feelingColors[key] || '#A9A9AA'
        }));

        const totalFeelings = Object.values(feelingCounts).reduce((sum, count) => sum + count, 0);
        const max = totalFeelings > 0 ? totalFeelings : 1;

        return { feelingDataForChart: dataForChart, maxValue: max };
    }, [dailyFeelings, visibleDate]); // Recalcula quando os dados ou o mês mudam

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} overScrollMode="never">
             <LinearGradient
                        colors={['#eff6ff', '#dbeafe']}
                        style={styles.background}
                    >
                <View style={styles.Seta}>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.botaoVoltar}>
                        <ChevronLeft color="black" />
                    </TouchableOpacity>
                    <Text>Voltar</Text>
                </View>

                <View style={styles.calendarContainer}>
                    <Calendar
                        // Força o calendário a começar no mês atual
                        current={visibleDate.toISOString().split('T')[0]}
                        renderHeader={(date) => {
                            const mes = meses[date.getMonth()];
                            const ano = date.getFullYear();
                            return <Text style={styles.calendarHeaderText}>{`${mes} ${ano}`}</Text>;
                        }}
                        style={{ width: 350 }}
                        onDayPress={handleDayPress}
                        // ✅ 2. ATUALIZA O ESTADO QUANDO O MÊS MUDA
                        onMonthChange={(month) => {
                            setVisibleDate(new Date(month.dateString));
                        }}
                    />
                </View>

                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Sentimentos no dia</Text>
                    
                        <FeelingsChart data={feelingDataForChart} maxValue={maxValue} layout="horizontal"/>
                        
                   
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
                    height: 40, width: '60%', alignItems: 'center', justifyContent: 'center', marginTop:'2%',borderRadius: 20, borderWidth: 1, alignSelf: 'center', backgroundColor: '#ffffff', borderColor: 'transparent', 
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 2,
                }} onPress={()=> router.replace('/pages/Charts/Month')}>
                    <Text style={{ fontFamily: "Nunito", fontSize: 18 }}>Acessar relatório mensal</Text>
                </TouchableOpacity>
                <View style={{height:20}}/>
                

            </LinearGradient>
        </ScrollView >
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
