import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { Pencil, Trash2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ProgressBar from '../../../../components/progessBar';
import { API_BASE_URL, ENDPOINTS } from '../../../config/api';
import { getLocalGoals, saveLocalGoal, setLastClickDate, updateGoalProgress } from '../../../services/database';

const celebrationGif = require('../../../../assets/animations/celebration.gif');

const Metas = () => {
    const [metas, setMetas] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [novaMetaText, setNovaMetaText] = useState('');
    const [numeroDias, setNumeroDias] = useState('');
    const [showCelebration, setShowCelebration] = useState(false);

    // Carrega e verifica o estado das metas toda vez que a tela recebe foco
    useFocusEffect(
        useCallback(() => {
            const loadAndCheckMetas = async () => {
                const savedMetas = await AsyncStorage.getItem('@metas');
                if (!savedMetas) {
                    setMetas([]);
                    return;
                }

                const parsedMetas = JSON.parse(savedMetas);
                const today = new Date().toISOString().split('T')[0];

                const checkedMetas = await Promise.all(
                    parsedMetas.map(async (meta) => {
                        const lastClickDate = await AsyncStorage.getItem(`@lastClickDate_${meta.id}`);
                        return { ...meta, disabled: lastClickDate === today };
                    })
                );
                setMetas(checkedMetas);
            };
            loadAndCheckMetas();
        }, [])
    );
    // Efeito para esconder a celebração após 5 segundos
    useEffect(() => {
        let timer;
        if (showCelebration) {
            timer = setTimeout(() => {
                setShowCelebration(false);
            }, 5000); // 5000 milissegundos = 5 segundos
        }
        // Limpa o timer se o componente for desmontado ou se a celebração for fechada manualmente
        return () => clearTimeout(timer);
    }, [showCelebration]);

    const handlePress = async (metaId) => {
        const today = new Date().toISOString().split('T')[0];
        let metaCompleted = false;

        const updatedMetas = await Promise.all(
            metas.map(async (meta) => {
                if (meta.id === metaId && !meta.disabled) {
                    const newDaysCompleted = meta.daysCompleted + 1;

                    // Atualiza no banco
                    await updateGoalProgress(meta.id, newDaysCompleted);
                    await setLastClickDate(meta.id, today);

                    if (newDaysCompleted >= meta.totalDias) {
                        metaCompleted = true;
                    }

                    return { ...meta, daysCompleted: newDaysCompleted, disabled: true };
                }
                return meta;
            })
        );

        setMetas(updatedMetas);

        if (metaCompleted) {
            setShowCelebration(true);
        }
    };

    const excluirMeta = (metaId) => {
        const updatedMetas = metas.filter((meta) => meta.id !== metaId);
        setMetas(updatedMetas);
    };

    async function addNewGoal() {
        const description = novaMetaText;
        const numberDays = Number(numeroDias);
        const userPersonId = "03cba052-ad35-4bf8-b917-5a2f404a07c4"
        try {
            const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.GOAL}`, {
                userPersonId,
                description,
                numberDays
            });

            await saveLocalGoal({ userPersonId, description, numberDays });
            const metasAtualizadas = await getLocalGoals();

            setMetas(metasAtualizadas.map(goal => ({
                ...goal,
                text: goal.description,
                totalDias: goal.numberDays,
                disabled: false
            })));
            setNovaMetaText('');
            setNumeroDias('');
            setModalVisible(false);
            return response.data;
        } catch (error) {
            if (error.response) {
                console.log("❌ Erro ao criar meta:", error.response.data);
                console.log("📋 Status:", error.response.status);
                console.log("📄 Headers:", error.response.headers);
            } else {
                console.log("❌ Erro inesperado:", error.message);
            }
            await saveLocalGoal({ userPersonId, description, numberDays });
            const metasOffline = await getLocalGoals();

            setMetas(metasOffline.map(goal => ({
                ...goal,
                text: goal.description,
                totalDias: goal.numberDays,
                disabled: false
            })));

            setModalVisible(false);
        }
    }
    return (
        <LinearGradient
            colors={['#eff6ff', '#dbeafe']}
            style={styles.background}
        >
            <View style={styles.mainContainer}>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.textMetas}>
                        <Text style={styles.text}>Minhas Metas</Text>
                    </View>
                    <View style={styles.cardsMeta}>
                        {metas.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Nenhuma meta registrada</Text>
                            </View>
                        ) : (
                            metas.map((meta) => (
                                <View key={meta.id} style={styles.cardContainer}>
                                    <TouchableOpacity
                                        style={[styles.cards, meta.disabled && styles.disabledCard]}
                                        onPress={() => handlePress(meta.id)}
                                        disabled={meta.disabled}
                                    >
                                        <Text style={styles.textCard}>{meta.text}</Text>
                                        <View style={{ marginTop: '5%', marginBottom: '5%', flexDirection: 'row' }}>
                                            <ProgressBar progress={meta.daysCompleted} total={meta.totalDias} />
                                            <Text style={styles.daysText}>{meta.daysCompleted}/{meta.totalDias}</Text>
                                        </View>
                                        <View style={styles.actionsContainer}>
                                            <TouchableOpacity onPress={() => excluirMeta(meta.id)}>
                                                <Trash2 color="red" size={24} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => console.log("editar", meta.id)}>
                                                <Pencil color="black" size={24} />
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>

                <TouchableOpacity
                    style={styles.newMetaContainer}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.plusIcon}>+</Text>
                </TouchableOpacity>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Adicionar Nova Meta</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nome da meta"
                                placeholderTextColor={'#9ca3af'}
                                value={novaMetaText}
                                onChangeText={setNovaMetaText}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Número de dias"
                                placeholderTextColor={'#9ca3af'}
                                keyboardType="numeric"
                                value={numeroDias}
                                onChangeText={setNumeroDias}
                            />
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={addNewGoal}
                            >
                                <Text style={styles.modalButtonText}>Adicionar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButtonCancel}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* MODAL DE CELEBRAÇÃO COM O GIF */}
                {showCelebration && (
                    <TouchableOpacity
                        style={styles.celebrationContainer}
                        onPress={() => setShowCelebration(false)}
                        activeOpacity={1}
                    >
                        <View style={styles.celebrationContent}>
                            <Text style={styles.celebrationTitle}>Meta Concluída!</Text>
                            <Image
                                source={celebrationGif}
                                style={styles.gif}
                            />
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </LinearGradient>
    );
};

export default Metas;

const styles = StyleSheet.create({
    background: {
        flex: 1
    },
    mainContainer: {
        flex: 1,
        position: 'relative',
    },
    actionsContainer: {
        position: 'absolute',
        top: 20,
        right: 15,
        flexDirection: 'column',
        gap: 12,
    },
    container: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 16,
    },
    textMetas: {
        marginTop: '20%',
        fontFamily: 'Nunito'
    },
    text: {
        color: '#161616ff',
        fontWeight: '700',
        fontSize: 22,
        fontFamily: 'Nunito',
    },
    cardsMeta: {
        width: '100%',
        marginTop: 20,
    },
    cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cards: {
        backgroundColor: '#ffffff',
        borderColor: 'black',
        width: '95%',
        marginBottom: 16,
        borderRadius: 20,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: 16,
        flexDirection: 'column',
        shadowColor: '#000000',
        shadowRadius: 10,
        shadowOpacity: 0.25,
        shadowOffset: { width: 2, height: 2 },
        elevation: 5,
    },
    disabledCard: {
        opacity: 0.7,
    },
    textCard: {
        fontSize: 16,
        fontWeight: '500',
    },
    daysText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: "center",
        position: 'absolute',
        bottom: '15%',
        left: '50%'
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
    plusIcon: {
        color: 'white',
        fontWeight: '300',
        fontSize: 36,
        lineHeight: 60,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 15,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    modalButton: {
        backgroundColor: '#2980B9',
        padding: 10,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalButtonCancel: {
        backgroundColor: '#fc445a',
        marginTop: 10,
        padding: 10,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonTextCancel: {
        color: 'white',
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '70%',
    },
    emptyText: {
        color: '#161616ff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    celebrationContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    celebrationContent: {
        alignItems: 'center',
    },
    celebrationTitle: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: '-10%',
    },
    gif: {
        width: 400,
        height: 400,
    },
});

