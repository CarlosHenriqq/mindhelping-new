import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import FeelingsChart from '../../../../../components/feelingCharts';
import { API_BASE_URL, ENDPOINTS } from '../../../../config/api'; // Ajuste se necessário

export default function ChartMonth() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [chartData, setChartData] = useState([]);
    const [maxValue, setMaxValue] = useState(1);
    const [isEnabled, setIsEnabled] = useState(true);

    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    const feelingColors = {
        FELIZ: '#edd892',
        TRISTE: '#6f9ceb',
        RAIVA: '#ef6865',
        ANSIOSO: '#f1bb87',
        TEDIO: '#918ef4',
        NEUTRO: '#A9A9A9'
    };

    const formatDate = (text) => {
        let cleanText = text.replace(/\D/g, '');
        if (cleanText.length > 8) cleanText = cleanText.slice(0, 8);
        if (cleanText.length >= 5) {
            return `${cleanText.slice(0, 2)}/${cleanText.slice(2, 4)}/${cleanText.slice(4)}`;
        } else if (cleanText.length >= 3) {
            return `${cleanText.slice(0, 2)}/${cleanText.slice(2)}`;
        }
        return cleanText;
    };

    const handleSearch = async () => {
        Keyboard.dismiss();
        if (startDate.length !== 10 || endDate.length !== 10) {
            Alert.alert("Erro", "Por favor, insira as datas de início e fim no formato dd/mm/aaaa.");
            return;
        }

        const start = new Date(startDate.split('/').reverse().join('-'));
        const end = new Date(endDate.split('/').reverse().join('-'));

        if (start > end) {
            Alert.alert("Erro", "A data de início não pode ser posterior à data de fim.");
            return;
        }

        try {
            const userId = '4765ab60-785f-4215-942e-22d9535bd877'; // Ajuste conforme seu contexto
            const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.FEELINGS_USER(userId)}`, {
                params: {
                    startDay: start.toISOString().split('T')[0],
                    endDay: end.toISOString().split('T')[0],
                }
            });

            const feelings = response.data.feelings || [];

            const feelingCounts = {
                FELIZ: 0, TRISTE: 0, RAIVA: 0,
                ANSIOSO: 0, TEDIO: 0, NEUTRO: 0
            };

            feelings.forEach(f => {
                if (f && f.description) {
                    const desc = f.description.toUpperCase();
                    if (feelingCounts[desc] !== undefined) feelingCounts[desc]++;
                }
            });

            const dataForChart = Object.keys(feelingCounts).map(key => ({
                label: key.charAt(0) + key.slice(1).toLowerCase(),
                value: feelingCounts[key],
                color: feelingColors[key] || '#A9A9A9'
            }));

            const totalFeelings = dataForChart.reduce((sum, item) => sum + item.value, 0);
            setChartData(dataForChart);
            setMaxValue(totalFeelings > 0 ? totalFeelings : 1);

        } catch (error) {
            console.error("Erro ao buscar sentimentos:", error.response?.data || error.message);
            Alert.alert("Erro", "Não foi possível buscar os sentimentos. Tente novamente.");
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <LinearGradient colors={['#eff6ff', '#dbeafe']} style={styles.background}>
                <View style={styles.header}>
                    <Text style={styles.title}>Relatório Mensal</Text>
                    <View style={styles.filterContainer}>
                        <Text style={styles.filter}>Informe um período</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                placeholder="dd/mm/aaaa"
                                keyboardType="numeric"
                                style={styles.inputData}
                                maxLength={10}
                                value={startDate}
                                onChangeText={(text) => setStartDate(formatDate(text))}
                            />
                            <TextInput
                                placeholder="dd/mm/aaaa"
                                keyboardType="numeric"
                                style={styles.inputData}
                                maxLength={10}
                                value={endDate}
                                onChangeText={(text) => setEndDate(formatDate(text))}
                            />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        <Text style={styles.searchButtonText}>Buscar</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.chartWrapper}>
                    <Text style={{
                        fontFamily: 'Nunito',
                        fontSize: 16,
                        fontWeight: 'bold',
                        textAlign: "center",
                        marginVertical: 10
                    }}>
                        Relatório geral de emoções
                    </Text>
                    <View style={styles.chartContent}>
                        {chartData.length > 0 && chartData.some(d => d.value > 0) ? (
                            <ScrollView>
                                <FeelingsChart data={chartData} maxValue={maxValue} layout='vertical' />
                            </ScrollView>
                        ) : (
                            <Text style={{ textAlign: 'center', }}>Faça uma busca para exibir o gráfico.</Text>
                        )}
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Switch
                        trackColor={{ false: "#f4f3f4", true: "#81b0ff" }}
                        thumbColor={isEnabled ? "#ffffff" : "#f4f3f4"}
                        onValueChange={toggleSwitch}
                        value={isEnabled}
                        style={{ marginLeft: '6%' }}
                    />
                    <Text style={{ marginTop: '1%', fontWeight: '700', fontFamily: 'Nunito', fontSize: 16 }}>
                        Compartilhar Dados com meu profissional
                    </Text>
                </View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

// Mantém todos os estilos como estão


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    background: {
        flex: 1
    },
    header: {
        marginTop: '25%',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    title: {
        fontFamily: 'Nunito',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    filterContainer: {
        width: '100%',
        alignItems: 'center',
    },
    filter: {
        fontFamily: 'Nunito',
        fontSize: 18,
        marginBottom: 10,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center',
        width: '100%',

    },
    inputData: {
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: '#ffffff',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        borderRadius: 20,
        width: '40%',
        height: 40,
        textAlign: 'center',
        paddingHorizontal: 10,
        fontSize: 16,
    },
    searchButton: {
        alignItems: 'center',
        justifyContent: "center",
        marginTop: 20,
        backgroundColor: '#3386BC',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        borderRadius: 20,
        paddingVertical: 12,
        width: '40%',
        elevation: 3,
    },
    searchButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    chartWrapper: {
        maxHeight: '40%',
        margin: 20,
        marginTop: '10%',
        borderRadius: 20,
        backgroundColor: 'white',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,


    },
    chartContent: {

        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'transparent',
        overflow: 'hidden',

        paddingTop: 10,
        paddingBottom: 10 // Adiciona um espaço no topo
    }
});
