import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import Carousel from 'react-native-reanimated-carousel';
import { API_BASE_URL, ENDPOINTS } from '../../../config/api';
import {
    goalsWeeklyNotification, scheduleAppointmentReminder, scheduleDailyReminderNotification, scheduleWeeklyReportNotification
} from '../../../services/notificationService';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const relaxationTips = [
    {
        title: "Que tal tentarmos meditar?",
        tips: [
            "Encontre um lugar tranquilo onde não será interrompido.",
            "Sente-se ou deite-se em uma posição confortável.",
            "Concentre-se na sua respiração, sentindo o ar entrar e sair.",
            "Se sua mente divagar, gentilmente traga o foco de volta para a respiração.",
            "Comece com sessões curtas de 5 a 10 minutos."
        ]
    },
    {
        title: "Ou conversar com a nossa comunidade?",
        tips: [
            "Compartilhar seus sentimentos pode aliviar o peso emocional.",
            "Ouvir outras pessoas pode te dar novas perspectivas.",
            "Lembre-se de ser respeitoso e empático com os outros."
        ]
    },
    {
        title: "Talvez um som relaxante",
        tips: [
            "Experimente ouvir sons da natureza, como chuva ou ondas do mar.",
            "Músicas instrumentais ou 'lo-fi' são ótimas para focar ou relaxar.",
            "Use fones de ouvido para uma experiência mais imersiva.",
            "Existem playlists prontas em várias plataformas de streaming."
        ]
    },
    {
        title: "Por que não praticar um esporte?",
        tips: [
            "A atividade física libera endorfinas, que melhoram o humor.",
            "Escolha uma atividade que você goste, como caminhar, dançar ou nadar.",
            "Até mesmo uma caminhada leve de 15 minutos pode fazer a diferença.",
            "Praticar esportes em grupo pode ser uma ótima forma de socializar."
        ]
    }
];


export default function Home() {
    const [feelings] = useState([
        { text: "FELIZ", image: require('../../../../assets/images/slide/feliz.png') },
        { text: "TRISTE", image: require('../../../../assets/images/slide/triste.png') },
        { text: "RAIVA", image: require('../../../../assets/images/slide/raiva.png') },
        { text: "ANSIOSO", image: require('../../../../assets/images/slide/ansioso.png') },
        { text: "TEDIO", image: require('../../../../assets/images/slide/tedio.png') },
        { text: "NÃO_SEI_DIZER", image: require('../../../../assets/images/slide/indeciso.png') },
    ]);

    const [userName, setUserName] = useState('Carlos');
    const [userId, setUserId] = useState('4765ab60-785f-4215-942e-22d9535bd877');

    const [modalSelected, setModalSelect] = useState(false);
    const [inputText, setInputText] = useState('');
    const [selectedFeelingIndex, setSelectedFeelingIndex] = useState(0);
    const [isTipsModalVisible, setIsTipsModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', tips: [] });
    const [nextAppointment, setNextAppointment] = useState(null);

    const fetchNextAppointment = async () => {
        const userId = '4765ab60-785f-4215-942e-22d9535bd877';

        if (!userId) {
            console.log("ID do usuário não encontrado. Não é possível buscar agendamento.");
            return null;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SCHEDULING_USER(userId)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`, // se precisar autenticação
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.log("Nenhum agendamento futuro encontrado para este usuário.");
                    return null;
                }
                throw new Error(`Erro na API: Status ${response.status}`);
            }

            const apiResponse = await response.json();

            if (apiResponse && apiResponse.schedulingDetails) {
                const details = apiResponse.schedulingDetails;
                return {
                    id: details.id,
                    professionalName: details.nameProfessional,
                    date: new Date(details.date),
                    title: 'Psicólogo(a)',
                    phone: details.phoneProfessional,
                    email: details.emailProfessional,
                    address: `${details.address.street}, ${details.address.city} - ${details.address.uf}`,
                };
            }

            return null;
        } catch (error) {
            console.error("Erro ao buscar agendamento da API:", error);
            return null;
        }
    };


    useFocusEffect(
        useCallback(() => {
            const loadAppointmentData = async () => {
                const appointmentData = await fetchNextAppointment();
                setNextAppointment(appointmentData);
                if (appointmentData) {
                    scheduleAppointmentReminder(appointmentData);
                }
            };

            // Notificações gerais (executam apenas uma vez por foco)
            scheduleDailyReminderNotification();
            goalsWeeklyNotification();
            scheduleWeeklyReportNotification();

            // Busca o agendamento sempre que a tela for focada
            loadAppointmentData();

            // Retorno opcional (se quiser limpar algo quando sai da tela)
            return () => {
                console.log("Saindo da tela Home");
            };
        }, [userId])
    );


    // --- Função modificada para não usar o banco de dados ---
    const registerFeelingWithTime = (feeling:string) => {
        console.log(`Sentimento selecionado: ${feeling}`);
        setSelectedFeelingIndex(feelings.findIndex(f => f.text === feeling)); // guarda o índice do sentimento
        setModalSelect(true);
    };

    // --- Função desativada ---
    const salvarTexto = async () => {
        const feeling = feelings[selectedFeelingIndex].text;
        const motiveToSend = inputText.trim() ? inputText : "sem motivo";

        try {
            const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.FEELINGS_USER(userId)}`, {
                description: feeling,
                motive: motiveToSend
            });

            console.log("Sentimento registrado com sucesso:", response.data);
        } catch (error) {
            console.error("Erro ao registrar sentimento:", error.response?.data || error.message);
        }

        setInputText('');
        setModalSelect(false);
    };

    const openTipsModal = (tipData) => {
        setModalContent(tipData);
        setIsTipsModalVisible(true);
    };

    return (
        <View style={{ flex: 1 }}>
            <LinearGradient colors={['#eff6ff', '#dbeafe']} style={styles.background}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
                    <ScrollView style={styles.screen}>
                        <View style={styles.feeling}>
                            <View style={styles.containerUser}>
                                <View style={styles.textContainer}>
                                    <Text style={styles.userText}>Oi {userName},</Text>
                                    <Text style={styles.textFeeling}>Como você está se sentindo?</Text>
                                </View>
                                <TouchableOpacity onPress={() => router.replace('/pages/Perfil')}>
                                    <Image source={{ uri: "https://i.pravatar.cc/150?img=38" }} style={styles.foto} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Carousel
                            loop
                            autoPlay
                            autoPlayInterval={3000}
                            width={width}
                            height={200}
                            data={feelings}
                            scrollAnimationDuration={800}
                            onSnapToItem={(index) => setSelectedFeelingIndex(index)}
                            withPagination={false}
                            renderItem={({ item }) => (
                                <View style={styles.slide}>
                                    <TouchableOpacity onPress={() => registerFeelingWithTime(item.text)}>
                                        <Image source={item.image} style={styles.img} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />

                        {/* Próxima consulta */}
                        <View style={styles.nextConsulta}>
                            <Text style={styles.textConsulta}>Sua próxima consulta: </Text>
                            <View style={styles.cardConsulta}>
                                {nextAppointment ? (
                                    <>
                                        <Text style={styles.nameProf}>{nextAppointment.professionalName}</Text>
                                        <Text>{nextAppointment.title}</Text>

                                        <View style={styles.dadosPsi}>
                                            <Text style={styles.contatoProf}>{nextAppointment.email}</Text>
                                        </View>
                                        <View style={styles.telePsi}>
                                            <Text style={styles.contatoProf}>{nextAppointment.phone}</Text>
                                        </View>

                                        <View style={styles.dadoConsulta}>
                                            <Text style={styles.dateConsulta}>Data</Text>
                                            <Text style={styles.dateConsulta}>Horário</Text>
                                        </View>
                                        <View style={styles.dadosConsulta}>
                                            <Text>{new Date(nextAppointment.date).toLocaleDateString('pt-BR')}</Text>
                                            <Text>{new Date(nextAppointment.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h</Text>
                                        </View>

                                        <View>
                                            <Text style={styles.dateConsulta}>Endereço</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.dadosLocConsulta}>{nextAppointment.address}</Text>

                                        </View>
                                    </>
                                ) : (
                                    <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>Nenhuma consulta agendada</Text>
                                )}
                            </View>
                        </View>

                        <View style={{ marginLeft: '6%', marginTop: '6%' }}>
                            <Text style={{ fontFamily: 'Nunito', fontSize: 16 }}>Agende sua próxima consulta:</Text>
                        </View>
                        <View>
                            <TouchableOpacity onPress={() => router.replace('/pages/Agendamento')} style={styles.searchProf}>
                                <Text>Procurar Profissionais</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.containerRelax}>
                            <Text style={styles.textRelax}>Que tal relaxar?</Text>
                            <View style={styles.grid}>
                                {relaxationTips.map((item, index) => (
                                    <TouchableOpacity key={index} style={styles.card} onPress={() => openTipsModal(item)}>
                                        <Text style={styles.cardText}>{item.title}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Modal de nota */}
                {modalSelected && (
                    <View style={styles.modalContainer}>
                        <TouchableWithoutFeedback onPress={() => setModalSelect(false)}>
                            <View style={styles.modalOverlay} />
                        </TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Por que você está se sentindo assim?</Text>
                            <TextInput style={styles.input} placeholder="Digite aqui" value={inputText} onChangeText={setInputText} />
                            <TouchableOpacity style={styles.modalButton} onPress={salvarTexto}>
                                <Text style={styles.modalButtonText}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Modal de dicas */}
                {isTipsModalVisible && (
                    <View style={styles.modalContainer}>
                        <TouchableWithoutFeedback onPress={() => setIsTipsModalVisible(false)}>
                            <View style={styles.modalOverlay} />
                        </TouchableWithoutFeedback>
                        <View style={styles.tipsModalContent}>
                            <Text style={styles.modalTitle}>{modalContent.title}</Text>
                            <ScrollView style={{ width: '100%', maxHeight: height * 0.4 }}>
                                {modalContent.tips.map((tip, index) => (
                                    <Text key={index} style={styles.tipText}>• {tip}</Text>
                                ))}
                            </ScrollView>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setIsTipsModalVisible(false)}>
                                <Text style={styles.modalButtonText}>Fechar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </LinearGradient>
        </View>
    );
}



const styles = StyleSheet.create({
    background: {
        flex: 1
    },
    feeling: {
        marginVertical: 20,
        marginTop: 30,
        paddingHorizontal: 20
    },
    containerUser: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    textContainer: {
        flex: 1,
        top: '50%'
    },
    userText: {
        fontSize: 18,
        fontFamily: 'Roboto-Regular',
        top: 5
    },
    foto: {
        width: 50,
        height: 50,
        borderRadius: 55,
        right: 5,
        borderColor: "white",
        borderWidth: 2,
        position: 'absolute',
        marginBottom: 12
    },
    textFeeling: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    img: {
        maxWidth: '95%',
        height: '95%',
        alignSelf: 'center',
        borderRadius: 20
    },
    slide: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    nextConsulta: {
        top: 20
    },
    textConsulta: {
        fontSize: 16,
        marginBottom: -5,
        fontFamily: 'Mukta-Bold',
        textAlign: 'left',
        paddingLeft: 22
    },
    cardConsulta: {
        backgroundColor: '#ffffff',
        padding: 20,
        margin: 20,
        borderRadius: 20,
        shadowColor: '#000000',
        shadowRadius: 10,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5
    },
    nameProf: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    contatoProf: {
        fontWeight: 'bold',
    },
    dadosPsi: {
        flexDirection: 'row',
        gap: 0,
        marginTop: 5
    },
    telePsi: {
        flexDirection: 'row',
        gap: 0,
        marginBottom: 5
    },
    dadoConsulta: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: '50%',
    },
    dateConsulta: {
        fontWeight: 'bold',
        fontSize: 16,
        gap: '50%'
    },
    dadosConsulta: {
        flexDirection: 'row',
        gap: '41.5%',
        marginBottom: 10,
    },
    maps: {
        flexDirection: 'row',
    },
    dadosLocConsulta: {
        fontWeight: 'bold',
        marginBottom: 5
    },
    containerRelax: {
        margin: 15
    },
    textRelax: {
        fontSize: 16,
        marginBottom: 5,
        fontFamily: 'Mukta-Bold',
        textAlign: 'left',
        paddingLeft: 10
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around'
    },
    card: {
        backgroundColor: '#7296c5ff',
        width: '45%',
        padding: 15,
        borderRadius: 20,
        marginVertical: 10,
        justifyContent: 'center',
        minHeight: 100
    },
    cardText: {
        color: 'white',
        alignItems: 'center',
        fontWeight: 'bold',
        textAlign: 'center',
        justifyContent: 'center'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center'
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        marginBottom: 15
    },
    modalButton: {
        backgroundColor: '#2980B9',
        padding: 12,
        borderRadius: 20,
        width: '100%',
        alignItems: 'center',
        marginTop: 10
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    searchProf: {
        marginTop: '5%',
        borderWidth: 0.5,
        borderColor: '#000000',
        width: '90%',
        padding: 10,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        alignSelf: 'center',
        justifyContent: "center",
        flexDirection: 'row',
        shadowColor: '#000000',
        shadowRadius: 10,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5
    },
    tipText: {
        fontSize: 15,
        color: '#333',
        marginBottom: 10,
        lineHeight: 22,
        width: '100%'
    },
    modalContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 10
    },
    tipsModalContent: {
        width: '90%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        alignItems: 'center',
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 10
    },
});