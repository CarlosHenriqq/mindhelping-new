import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { BrushCleaningIcon, Info, Pencil, Search } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { Calendar, CalendarProvider, LocaleConfig } from 'react-native-calendars';
import { useUser } from "../../../context/UserContext";

export default function Diario() {
    const { userId } = useUser();
    const [anotacoes, setAnotacoes] = useState([]);
    const [visibleDate, setVisibleDate] = useState(new Date());
    const [searchText, setSearchText] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [showAddHint, setShowAddHint] = useState(false);
    const [showCleanHint, setShowCleanHint] = useState(false);

    // ativa hints ao focar na tela
    useFocusEffect(
        useCallback(() => {
            setShowAddHint(true);
            setShowCleanHint(true);

            const timer = setTimeout(() => {
                setShowAddHint(false);
                setShowCleanHint(false);
            }, 3000);

            return () => clearTimeout(timer);
        }, [])
    );

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

    async function carregarAnotacoes() {
        try {
            const data = await AsyncStorage.getItem("@anotacoes");
            if (data) {
                setAnotacoes(JSON.parse(data));
            } else {
                setAnotacoes([]);
            }
        } catch (e) {
            console.log("Erro ao carregar anotações:", e);
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            carregarAnotacoes();
        }, [])
    );

    const renderItem = ({ item }) => {
        const dataFormatada = item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '';

        return (
            <TouchableOpacity
                style={styles.anotacaoCard}
                onPress={() =>
                    router.push({
                        pathname: "/pages/Diario/Anotacoes",
                        params: { anotacao: JSON.stringify(item) } // passa o item como parâmetro
                    })
                }
            >
                {dataFormatada ? <Text style={styles.anotacaoData}>{dataFormatada}</Text> : null}
                <Text style={{ color: '#161616ff', fontSize: 16 }}>{item.texto}</Text>
            </TouchableOpacity>
        );
    };

    const anotacoesFiltradas = anotacoes.filter(item => {
        const filtraTexto = item.texto.toLowerCase().includes(searchText.toLowerCase());
        const filtraData = selectedDate ? item.data.startsWith(selectedDate) : true;
        return filtraTexto && filtraData;
    });

    function cleanFilter() {
        setSearchText('')
        setSelectedDate(null)
    }

    return (
        <View style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <LinearGradient
                                   colors={['#eff6ff', '#dbeafe']}
                                   style={styles.background}
                               >
                    {/* 🔍 Caixa de pesquisa */}
                    <View style={styles.searchContainer}>
                        <TextInput
                            placeholder="Pesquisar anotações"
                            placeholderTextColor={'#161616ff'}
                            style={styles.input}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        <Search size={20} color={'#161616ff'} style={styles.icon} />
                    </View>

                    {/* 📅 Calendário + Lista */}
                    <CalendarProvider date={entryDate}>
                        <View style={{ flex: 1, marginTop: '5%' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: '-2%', marginLeft: '6%', marginBottom: '3%', width: '90%', borderRadius: 20, height: '4%', padding: 5 }}>
                                <Info size={20} color={'black'} />
                                <Text>Utilize o calendário para filtrar suas anotações</Text>
                            </View>
                            <View style={styles.calendarWrapper}>
                                <Calendar
                                    current={visibleDate.toISOString().split('T')[0]}
                                    renderHeader={(date) => {
                                        const mes = meses[date.getMonth()];
                                        const ano = date.getFullYear();
                                        return <Text style={styles.calendarHeaderText}>{`${mes} ${ano}`}</Text>;
                                    }}
                                    style={{ width: 350, margin: 10 }}
                                    firstDay={1}
                                    onMonthChange={(month) => setVisibleDate(new Date(month.dateString))}
                                    onDayPress={(day) => {
                                        setSelectedDate(day.dateString);
                                    }}
                                />
                            </View>

                            {/* 📖 Lista de anotações */}
                            <View style={styles.listContainer}>
                                {anotacoes.length === 0 ? (
                                    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                        <Text style={{ color: '#161616ff', fontWeight: 'bold', fontSize: 16 }}>
                                            Nenhuma anotação encontrada
                                        </Text>
                                    </View>
                                ) : (
                                    <FlatList
                                        data={anotacoesFiltradas}
                                        keyExtractor={(item, index) => index.toString()}
                                        renderItem={renderItem}
                                        contentContainerStyle={{ paddingBottom: 80 }}
                                    />
                                )}
                            </View>
                        </View>
                    </CalendarProvider>

                    {/* ➕ Botão Nova Nota */}
                    <TouchableOpacity
                        style={styles.newMetaContainer}
                        onPress={() => router.replace("/pages/Diario/Anotacoes")}
                    >
                        <Pencil color={'#000000'} size={24} />
                        {showAddHint && (
                            <Animatable.View
                                animation="fadeInLeft"
                                duration={1500}
                                style={styles.hintBox}
                            >
                                <Text style={styles.hintText}>Adicionar nota</Text>
                            </Animatable.View>
                        )}
                    </TouchableOpacity>

                    {/* 🧹 Botão Limpar Filtros */}
                    <TouchableOpacity
                        style={styles.refreshContainer}
                        onPress={cleanFilter}
                    >
                        <BrushCleaningIcon color={'#000000'} size={24} />
                        {showCleanHint && (
                            <Animatable.View
                                animation="fadeInLeft"
                                duration={1500}
                                style={styles.hintBox}
                            >
                                <Text style={styles.hintText}>Limpar filtros</Text>
                            </Animatable.View>
                        )}
                    </TouchableOpacity>

                </LinearGradient>
            </TouchableWithoutFeedback>
        </View>
    );
}

const styles = StyleSheet.create({
    background:{
        flex:1
    },
    container: { 
        flex:1,
        backgroundColor: "#f5f5f5" },
    searchContainer: { 
        width: '90%', 
        alignSelf: 'center', 
        marginTop: '15%' },
    input: {
        borderWidth: 1, 
        borderRadius: 20, 
        height: 50,
        paddingLeft: 40, 
        paddingRight: 15, 
        fontSize: 16,
        backgroundColor: 'white', 
        borderColor: 'transparent',
        elevation: 5, 
        shadowColor: "#000", 
        shadowOpacity: 0.1,
        shadowRadius: 8, 
        shadowOffset: { width: 0, height: 2 },
    },
    icon: { 
        position: 'absolute', 
        left: 12, 
        top: 13 },

    calendarWrapper: {
        width: "90%", 
        alignSelf: "center",
         borderRadius: 20,
        backgroundColor: "#fff", 
        borderWidth: 1, 
        borderColor: "#ddd",
        overflow: "hidden", 
        elevation: 5, 
        shadowColor: "#000",
        shadowOpacity: 0.1, 
        shadowRadius: 8, 
        shadowOffset: { width: 0, height: 2 },
    },
    calendarHeaderText: { fontSize: 16, fontWeight: 'bold', color: '#000', textAlign: 'center', bottom: 3 },
    listContainer: { flex: 1, width: '90%', alignSelf: 'center', marginTop: 10 },
    anotacaoCard: { padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#eee', backgroundColor: 'white', marginBottom: 10 },
    anotacaoData: { fontSize: 12, color: '#888', marginBottom: 5, fontWeight: 'bold' },
    newMetaContainer: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#b1bfd1ff', width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 8 },
    refreshContainer: { position: 'absolute', bottom: 100, right: 20, backgroundColor: '#b1bfd1ff', width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 8 },
    hintBox: { position: "absolute", right: 70, width: 130, height: 30, backgroundColor: '#b1bfd1ff', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    hintText: { color: '#000000', fontWeight: 'bold', fontSize: 14 }
});
