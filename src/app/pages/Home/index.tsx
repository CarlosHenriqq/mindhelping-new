import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import Carousel from 'react-native-reanimated-carousel';
import FotoPerfil from '../../../../assets/mascote.svg';
import { CustomAlert, useCustomAlert, } from '../../../components/CustomAlert';
import { API_BASE_URL, ENDPOINTS } from '../../../config/api';
import { useUser } from '../../../context/UserContext';
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
    const { alertConfig, showSuccess, showError, showWarning, hideAlert, showConfirm } = useCustomAlert();
    const [userName, setUserName] = useState('');
    const { userId, loadingUser } = useUser();

    const [userPhoto, setUserPhoto] = useState(null);
    const [schedulingId, setSchedulingId] = useState('');
    const [modalSelected, setModalSelect] = useState(false);
    const [inputText, setInputText] = useState('');
    const [selectedFeelingIndex, setSelectedFeelingIndex] = useState(0);
    const [isTipsModalVisible, setIsTipsModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', tips: [] });
    const [nextAppointment, setNextAppointment] = useState(null);
    // Ao exibir a hora:

    const fetchNextAppointment = async () => {
        if (!userId) {
            console.log("ID do usuário não encontrado.");
            return null;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SCHEDULING_USER(userId)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.log("Nenhum agendamento futuro encontrado.");
                    return null;
                }
                throw new Error(`Erro na API: Status ${response.status}`);
            }

            const apiResponse = await response.json();
            console.log("📋 Resposta completa da API:", JSON.stringify(apiResponse, null, 2));

            if (apiResponse && apiResponse.schedulingDetails) {
                const details = apiResponse.schedulingDetails;

                // 🔥 PEGAR APENAS A PARTE DA DATA
                const dateString = details.date.split('T')[0]; // "2025-11-20"

                // 🔥 CRIAR DATA SEM CONVERSÃO DE TIMEZONE
                const [year, month, day] = dateString.split('-');
                const appointmentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

                const now = new Date();
                now.setHours(0, 0, 0, 0);

                if (appointmentDate < now) {
                    console.log("Agendamento já passou.");
                    return null;
                }

                // 🔥 USAR A HORA DIRETO DO BACKEND
                const displayHour = details.hour; // "08:00"

                // 🔥 BUSCAR USANDO A CHAVE COMPOSTA
                const cacheKey = `appointment_${userId}_${dateString}_${displayHour}`;

                console.log("💾 Buscando do cache com key:", cacheKey);
                console.log("🕐 Hora que será exibida:", displayHour); // ← Debug

                const cachedDataString = await AsyncStorage.getItem(cacheKey);
                let cachedHourlyId = null;

                if (cachedDataString) {
                    const cachedData = JSON.parse(cachedDataString);
                    cachedHourlyId = cachedData.hourlyId;
                    console.log("💾 Dados do cache:", cachedData);
                }

                return {
                    schedulingId: details.id,
                    hourlyId: cachedHourlyId || details.hourlyId,
                    professionalName: details.nameProfessional,
                    date: appointmentDate,
                    hour: displayHour, // ← Isso deve ser "08:00"
                    title: 'Psicólogo(a)',
                    phone: details.phoneProfessional,
                    email: details.emailProfessional,
                    address: `${details.address.street}, ${details.address.city} - ${details.address.uf}`,
                    isCanceled: details.isCanceled
                };
            }

            return null;
        } catch (error) {
            console.error("Erro ao buscar agendamento:", error);
            return null;
        }
    };


    useFocusEffect(
        useCallback(() => {
            if (loadingUser) return; // espera usuário ser restaurado
            if (!userId) return;      // se não existe, não faz nada

            const loadAppointmentData = async () => {
                const appointmentData = await fetchNextAppointment();
                setNextAppointment(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(appointmentData)) return prev;
                    return appointmentData;
                });
            };

            loadAppointmentData();
            loadLocalPhoto();


        }, [userId, loadingUser])
    );

    const registerFeelingWithTime = (feeling: string) => {
        console.log(`Sentimento selecionado: ${feeling}`);
        setSelectedFeelingIndex(feelings.findIndex(f => f.text === feeling)); // guarda o índice do sentimento
        setModalSelect(true);
    };
    const salvarTexto = async () => {
        const feeling = feelings[selectedFeelingIndex].text;
        const motiveToSend = inputText.trim() ? inputText : "sem motivo";

        try {
            const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.FEELINGS_USER(userId)}`, {
                description: feeling,
                motive: motiveToSend
            });

            console.log("Sentimento registrado com sucesso:", response.data);
        } catch (error: any) {
            console.error("Erro ao registrar sentimento:", error.response?.data || error.message);
        }

        setInputText('');
        setModalSelect(false);
    };

    const openTipsModal = (tipData) => {
        setModalContent(tipData);
        setIsTipsModalVisible(true);
    };

    const loadLocalPhoto = async () => {
        try {
            const dir = `${FileSystem.documentDirectory}profile/`;
            const fileUri = `${dir}user_photo.jpg`;

            // garante que a pasta exista
            const dirInfo = await FileSystem.getInfoAsync(dir);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
            }

            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (fileInfo.exists) {
                setUserPhoto(fileUri);
            } else {
                console.log("Foto local não encontrada");
            }
        } catch (err) {
            console.error("Erro ao carregar imagem local:", err);
        }
    };
    const loadLastFeeling = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.USER_DETAILS(userId)}`);
            const dados = response.data.profile;


            setUserName(dados.nameUser.split(' ')[0]);


        } catch (error) {
            console.log("Erro ao carregar último sentimento:", error);
        }
    };

    const confirmarCancelamento = () => {
        showConfirm(
            "Confirmar Cancelamento",
            "Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.",
            () => {
                hideAlert();
                cancelAgendamento();
            },
            () => {
                hideAlert();
            },
            'warning',
            'Sim, Cancelar',
            'Não'
        );
    };
    const cancelAgendamento = async () => {
        if (!nextAppointment || !nextAppointment.hourlyId) {
            showError('Erro', 'Não foi possível identificar o agendamento');
            return;
        }

        try {
            const url = `${API_BASE_URL}${ENDPOINTS.CANCEL_SCHEDULING(nextAppointment.hourlyId, nextAppointment.schedulingId)}`;

            console.log("🗑️ Cancelando agendamento com hourlyId:", nextAppointment.hourlyId);
            console.log("📍 URL:", url);

            const response = await axios.patch(url, {}, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                }
            });



            // 🔥 Limpar do cache usando a chave composta
            const dateString = new Date(nextAppointment.date).toISOString().split('T')[0];
            const cacheKey = `appointment_${userId}_${dateString}_${nextAppointment.hour}`;
            await AsyncStorage.removeItem(cacheKey);

            console.log("🗑️ Cache removido:", cacheKey);

            showSuccess('Cancelado!', 'Seu agendamento foi cancelado com sucesso.');

            // Atualiza diretamente o objeto atual, marcando como cancelado
            setNextAppointment(prev => prev ? { ...prev, isCanceled: true } : prev);

            // E ainda atualiza da API (para garantir sincronia)
            const appointmentData = await fetchNextAppointment();
            setNextAppointment(appointmentData);


        } catch (error: any) {
            console.error("❌ Erro ao cancelar:", error.response?.data || error.message);
            showError('Erro ao Cancelar', 'Não foi possível cancelar o agendamento.');
        }
    };
    // useEffect só para carregar na primeira vez
    useEffect(() => {
        loadLocalPhoto();
        loadLastFeeling();

    }, []);
    useEffect(() => {
        const clearOldCache = async () => {
            try {
                const keys = await AsyncStorage.getAllKeys();
                const hourlyKeys = keys.filter(k => k.startsWith('hourly_'));
                console.log("🗑️ Limpando cache antigo:", hourlyKeys);
                if (hourlyKeys.length > 0) {
                    await AsyncStorage.multiRemove(hourlyKeys);
                    console.log("✅ Cache limpo!");
                }
            } catch (error) {
                console.error("Erro ao limpar cache:", error);
            }
        };

        clearOldCache();
        loadLocalPhoto();
        loadLastFeeling();
    }, []);


    return (
        <View style={{ flex: 1 }}>
            <LinearGradient colors={['#f0f9ff', '#e0f2fe', '#bae6fd']} style={styles.background}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
                    <ScrollView style={styles.screen}>
                        <View style={styles.feeling}>
                            <View style={styles.containerUser}>
                                <View style={styles.textContainer}>
                                    <Text style={styles.userText}>Oi {userName},</Text>
                                    <Text style={styles.textFeeling}>Como você está se sentindo?</Text>
                                </View>
                                <TouchableOpacity onPress={() => router.push('/pages/Perfil')}>
                                    {userPhoto ? (
                                        <Image source={{ uri: userPhoto }} style={styles.foto} />
                                    ) : (
                                        <View style={styles.fotoPlaceholder}>
                                            <FotoPerfil width={50} height={50} />
                                        </View>
                                    )}
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
                                            <Text>{nextAppointment.hour}</Text>
                                        </View>

                                        <View>
                                            <Text style={styles.dateConsulta}>Endereço</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.dadosLocConsulta}>{nextAppointment.address}</Text>

                                        </View>
                                        <View>
                                            <TouchableOpacity
                                                style={{
                                                    borderWidth: 1,
                                                    alignSelf: 'center',
                                                    borderColor: nextAppointment.isCanceled ? 'gray' : 'red',
                                                    borderRadius: 20,
                                                    width: '65%',
                                                    marginTop: 10,
                                                    opacity: nextAppointment.isCanceled ? 0.6 : 1
                                                }}
                                                onPress={confirmarCancelamento}
                                                disabled={nextAppointment.isCanceled}
                                            >
                                                <Text style={{
                                                    color: nextAppointment.isCanceled ? 'gray' : 'red',
                                                    fontWeight: 'bold',
                                                    padding: 5,
                                                    textAlign: 'center',
                                                    shadowRadius: 20,
                                                    shadowOpacity: 0.5,
                                                    shadowOffset: { width: 0, height: 2 },
                                                    elevation: 5,
                                                }}>
                                                    {nextAppointment.isCanceled ? 'CANCELADO' : 'Cancelar agendamento'}
                                                </Text>
                                            </TouchableOpacity>

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
                                <Text style={{ fontWeight: 700, color: '#ffffff' }}>Buscar Profissionais</Text>
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
                <CustomAlert
                    visible={alertConfig.visible}
                    type={alertConfig.type}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    onClose={hideAlert}
                    showConfirm={alertConfig.showConfirm}
                    confirmText={alertConfig.confirmText}
                    cancelText={alertConfig.cancelText}
                    onConfirm={alertConfig.onConfirm}
                    onCancel={alertConfig.onCancel}
                />
            </LinearGradient>
        </View>
    );
}



const styles = StyleSheet.create({
    background: {
        flex: 1
    },
    feeling: {
        marginVertical: 20, // ← Use valores fixos em vez de %
        marginTop: 50,
        paddingHorizontal: 20
    },
    containerUser: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    textContainer: {
        flex: 1,
        // ❌ REMOVA: top: '50%'
    },
    userText: {
        fontSize: 18,
        fontFamily: 'Roboto-Regular',
        // ❌ REMOVA: top: 5,
        marginBottom: 4, // ← Use px fixo
    },
    foto: {
        width: 50,
        height: 50,
        borderRadius: 25,


    },
    fotoPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,

        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E0E8F9',
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
        gap: 130,
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
        backgroundColor: '#0284c7',
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
        backgroundColor: '#0284c7',
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
        borderColor: '#000000',
        width: '50%',
        padding: 10,
        backgroundColor: '#0284c7',
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