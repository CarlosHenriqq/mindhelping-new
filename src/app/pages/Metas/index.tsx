import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { Pencil, Trash2 } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import ProgressBar from "../../../../components/progessBar";
import { API_BASE_URL, ENDPOINTS } from "../../../config/api";
import {
    deleteLocalGoal,
    getLastClickDate,
    getLocalGoals,
    saveLocalGoal,
    setLastClickDate,
    updateGoalProgress
} from "../../../services/database";

const celebrationGif = require("../../../../assets/animations/celebration.gif");

const Metas = () => {
    const [metas, setMetas] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [novaMetaText, setNovaMetaText] = useState("");
    const [numeroDias, setNumeroDias] = useState("");
    const [showCelebration, setShowCelebration] = useState(false);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [goalToDeleteId, setGoalToDeleteId] = useState(null);

    // 🔄 Carregar metas sempre que a tela receber foco
    useFocusEffect(
        useCallback(() => {
            loadMetas();
        }, [])
    );

    // 🎉 Esconder a animação após 5s
    useEffect(() => {
        let timer;
        if (showCelebration) {
            timer = setTimeout(() => setShowCelebration(false), 5000);
        }
        return () => clearTimeout(timer);
    }, [showCelebration]);

    const loadMetas = async () => {
        try {
            const userPersonId = "03cba052-ad35-4bf8-b917-5a2f404a07c4";
            const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.GOAL_USER(userPersonId)}`);
            const today = new Date().toISOString().split("T")[0];
            const goals = response.data.goals || [];

            const mappedMetas = await Promise.all(
                goals.map(async (goal) => {
                    const lastClickDate = await getLastClickDate(goal.id);
                    return {
                        id: goal.id,
                        text: goal.description,
                        totalDias: goal.numberDays,
                        daysCompleted: goal.daysCompleted || 0,
                        disabled: lastClickDate === today,
                    };
                })
            );
            setMetas(mappedMetas);
        } catch (error) {
            console.log("❌ Erro ao carregar metas da API:", error.message);
            const localGoals = await getLocalGoals();
            setMetas(
                localGoals.map((goal) => ({
                    id: goal.id,
                    text: goal.description,
                    totalDias: goal.numberDays,
                    daysCompleted: goal.daysCompleted,
                    disabled: false,
                }))
            );
        }
    };

    // ✅ Marcar progresso de uma meta
    const handlePress = async (metaId) => {
        const today = new Date().toISOString().split("T")[0];
        let metaCompleted = false;

        const updatedMetas = await Promise.all(
            metas.map(async (meta) => {
                if (meta.id === metaId && !meta.disabled) {
                    const newDaysCompleted = meta.daysCompleted + 1;
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
        if (metaCompleted) setShowCelebration(true);
    };

    // 🗑️ Excluir meta
    const excluirMeta = async (metaId) => {
        const userPersonId = "03cba052-ad35-4bf8-b917-5a2f404a07c4";
        try {
            await axios.delete(`${API_BASE_URL}${ENDPOINTS.GOAL_USER_DELETE(metaId, userPersonId)}`);
            console.log(`✅ Meta ${metaId} excluída da API com sucesso.`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(`ℹ️ Meta ${metaId} não encontrada na API, provavelmente era uma meta local.`);
            } else {
                console.error("❌ Falha ao excluir meta da API:", error.message);
                alert("Não foi possível excluir a meta. Verifique sua conexão e tente novamente.");
                return;
            }
        }
        try {
            await deleteLocalGoal(metaId);
            console.log(`✅ Meta ${metaId} excluída do SQLite com sucesso.`);
        } catch (error) {
            console.error("❌ Falha ao excluir meta do banco de dados local:", error.message);
        }
        setMetas((prevMetas) => prevMetas.filter((meta) => meta.id !== metaId));
    };

    // Lida com a confirmação da exclusão
    const handleConfirmDelete = async () => {
        if (goalToDeleteId) {
            await excluirMeta(goalToDeleteId);
            setShowConfirmDeleteModal(false);
            setGoalToDeleteId(null);
        }
    };

    // ➕ Adicionar nova meta
    const addNewGoal = async () => {
        const description = novaMetaText.trim();
        const numberDays = Number(numeroDias);
        const userPersonId = "03cba052-ad35-4bf8-b917-5a2f404a07c4";

        if (!description || !numberDays) {
            alert("Preencha todos os campos!");
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}${ENDPOINTS.GOAL}`, {
                userPersonId,
                description,
                numberDays,
            });
        } catch (error) {
            console.log("⚠️ Erro de rede/API, salvando apenas no SQLite:", error.message);
        }

        await saveLocalGoal({ userPersonId, description, numberDays });
        await loadMetas();

        setNovaMetaText("");
        setNumeroDias("");
        setModalVisible(false); // ✅ CORRIGIDO: Movido para o final
    };

    return (
        <LinearGradient colors={["#eff6ff", "#dbeafe"]} style={styles.background}>
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
                                        <View style={styles.progressRow}>
                                            <ProgressBar
                                                progress={meta.daysCompleted}
                                                total={meta.totalDias}
                                            />
                                            <Text style={styles.daysText}>
                                                {meta.daysCompleted}/{meta.totalDias}
                                            </Text>
                                        </View>
                                        <View style={styles.actionsContainer}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setGoalToDeleteId(meta.id);
                                                    setShowConfirmDeleteModal(true);
                                                }}
                                            >
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

                {/* ➕ Botão para nova meta */}
                <TouchableOpacity
                    style={styles.newMetaContainer}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.plusIcon}>+</Text>
                </TouchableOpacity>

                {/* 📌 Modal para adicionar nova meta */}
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
                                value={novaMetaText}
                                onChangeText={setNovaMetaText}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Número de dias"
                                keyboardType="numeric"
                                value={numeroDias}
                                onChangeText={setNumeroDias}
                            />
                            <TouchableOpacity style={styles.modalButton} onPress={addNewGoal}>
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

                {/* 🗑️ Modal para CONFIRMAR EXCLUSÃO */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showConfirmDeleteModal} // ✅ CORRIGIDO
                    onRequestClose={() => setShowConfirmDeleteModal(false)} // ✅ CORRIGIDO
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
                            <Text style={styles.modalBodyText}>
                                Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
                            </Text>
                            <View style={styles.modalButtonRow}>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: '#6c757d' }]}
                                    onPress={() => setShowConfirmDeleteModal(false)}
                                >
                                    <Text style={styles.modalButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: '#dc3545' }]}
                                    onPress={handleConfirmDelete}
                                >
                                    <Text style={styles.modalButtonText}>Excluir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* 🎉 Modal de celebração */}
                {showCelebration && (
                    <TouchableOpacity
                        style={styles.celebrationContainer}
                        onPress={() => setShowCelebration(false)}
                        activeOpacity={1}
                    >
                        <View style={styles.celebrationContent}>
                            <Text style={styles.celebrationTitle}>Meta Concluída!</Text>
                            <Image source={celebrationGif} style={styles.gif} />
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
        top: 5,
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
        paddingRight: 30, // Garante que o texto não fique sob os ícones
    },
    progressRow: { // Adicionado para encapsular a barra e o texto
        width: '100%',
        marginTop: 10,
    },
    daysText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: "center",
        marginTop: 4, // Espaçamento entre a barra e o texto
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
        padding: 12,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#2980B9',
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
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
    // ✅ NOVOS ESTILOS PARA O MODAL DE CONFIRMAÇÃO
    modalBodyText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#333'
    },
    modalButtonRow: {
        flexDirection: 'column',
        marginBottom:'5%',
        gap:10,
        justifyContent: 'space-between',
        width: '50%',
    },
});