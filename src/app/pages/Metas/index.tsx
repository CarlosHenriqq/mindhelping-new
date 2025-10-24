import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { Pencil, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import ProgressBar from "../../../components/progessBar";
import { API_BASE_URL, ENDPOINTS } from "../../../config/api";
import { useUser } from "../../../context/UserContext";

const celebrationGif = require("../../../../assets/animations/celebration.gif");

interface Meta {
    id: string;
    text: string;
    totalDias: number;
    daysCompleted: number;
    disabled: boolean;
}

const Metas = () => {
    const [metas, setMetas] = useState<Meta[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [novaMetaText, setNovaMetaText] = useState("");
    const [numeroDias, setNumeroDias] = useState("");
    const [showCelebration, setShowCelebration] = useState(false);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [goalToDeleteId, setGoalToDeleteId] = useState<string | null>(null);
    const [isExecuted, setIsExecuted] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Meta | null>(null);

    const { userId } = useUser();

    useFocusEffect(
        useCallback(() => {
            loadMetas();
        }, [])
    );

    useEffect(() => {
        let timer;
        if (showCelebration) {
            timer = setTimeout(() => setShowCelebration(false), 5000);
        }
        return () => clearTimeout(timer);
    }, [showCelebration]);

    const loadMetas = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.GOAL_USER(userId)}`);
            const data = response.data;

            if (!data || !Array.isArray(data.goals)) {
                console.warn("Formato inesperado de resposta:", data);
                setMetas([]);
                return;
            }

            const today = new Date().toISOString().split("T")[0];

            const mappedMetas = data.goals.map(goal => {
                const goalDate = goal.updatedAt ? new Date(goal.updatedAt).toISOString().split("T")[0] : null;
                return {
                    id: goal.id,
                    text: goal.description,
                    totalDias: goal.numberDays,
                    daysCompleted: goal.counter || 0,
                    disabled: goal.counter > 0 && goalDate === today && goal.counter == goal.numberDays,
                };
            });



            setMetas(mappedMetas);
        } catch (error) {
            console.error("Erro ao carregar metas:", error);
            setMetas([]);
        } finally {
            setIsLoading(false);
        }
    };


    const handlePress = async (metaId: string) => {
        try {
            // Atualiza o contador no backend e marca como executada
            await axios.patch(`${API_BASE_URL}${ENDPOINTS.GOAL_USER_COUNTER(metaId, userId)}`);
            await axios.patch(`${API_BASE_URL}${ENDPOINTS.GOAL_USER_EXECUTE(metaId, userId)}`);

            // Atualiza localmente
            setMetas(prevMetas =>
                prevMetas.map(meta => {
                    if (meta.id === metaId) {
                        const newDaysCompleted = meta.daysCompleted + 1;
                        return {
                            ...meta,
                            daysCompleted: newDaysCompleted,
                            disabled: true, // se já executou hoje
                        };
                    }
                    return meta;
                })
            );

            // Mostra celebração se a meta terminou
            const metaAtualizada = metas.find(m => m.id === metaId);
            if (metaAtualizada && metaAtualizada.daysCompleted + 1 >= metaAtualizada.totalDias) {
                setShowCelebration(true);
            }

        } catch (error) {
            console.error("Erro ao atualizar meta:", error);
            alert("Não foi possível atualizar a meta. Verifique sua conexão.");
            loadMetas();
        }
    };


    const excluirMeta = async (metaId: string) => {
        try {
            await axios.delete(`${API_BASE_URL}${ENDPOINTS.GOAL_USER_DELETE(metaId, userId)}`);
            setMetas(prev => prev.filter(meta => meta.id !== metaId));
        } catch (error) {
            console.error(error);
            alert("Não foi possível excluir a meta. Tente novamente.");
        }
    };

    const handleConfirmDelete = async () => {
        if (goalToDeleteId) {
            await excluirMeta(goalToDeleteId);
            setShowConfirmDeleteModal(false);
            setGoalToDeleteId(null);
        }
    };

    // Função usada para criar OU editar
    const addNewGoal = async () => {
        const description = novaMetaText.trim();
        const numberDays = Number(numeroDias);

        if (!description || !numberDays || numberDays <= 0) {
            alert("Preencha todos os campos com valores válidos!");
            return;
        }

        try {
            if (editingGoal) {
                // Atualiza meta existente
                await axios.patch(`${API_BASE_URL}${ENDPOINTS.GOAL_USER_UPDATE(editingGoal.id, userId)}`, {
                    description,
                    numberDays,
                });
            } else {
                // Cria nova meta
                await axios.post(`${API_BASE_URL}${ENDPOINTS.GOAL}`, {
                    userPersonId:userId,
                    description,
                    numberDays,
                });
            }

            await loadMetas();
            closeModal();
        } catch (error) {
            console.error("Erro ao salvar meta:", error);
            alert("Não foi possível salvar a meta. Tente novamente.");
        }
    };

    const updateGoal = (meta: Meta) => {
        if (!isExecuted) {
            setEditingGoal(meta);
            setNovaMetaText(meta.text);
            setNumeroDias(meta.totalDias.toString());
            setModalVisible(true);
        } else {
            alert("Não é possível editar a meta, pois ela já foi executada.");
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingGoal(null);
        setNovaMetaText("");
        setNumeroDias("");
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#2980B9" />
                    <Text style={styles.emptyText}>Carregando metas...</Text>
                </View>
            );
        }

        if (metas.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Nenhuma meta registrada</Text>
                    <Text>Clique no '+' para começar!</Text>
                </View>
            );
        }

        return metas.map(meta => (
            <View key={meta.id} style={styles.cardContainer}>
                <TouchableOpacity
                    style={[styles.cards, meta.disabled && styles.disabledCard]}
                    onPress={() => handlePress(meta.id)}
                    disabled={meta.disabled}
                >
                    <Text style={styles.textCard}>{meta.text}</Text>
                    <View style={styles.progressRow}>
                        <ProgressBar progress={meta.daysCompleted} total={meta.totalDias} />
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
                        <TouchableOpacity onPress={() => updateGoal(meta)}>
                            <Pencil color="black" size={24} />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </View>
        ));
    };

    return (
        <LinearGradient colors={["#eff6ff", "#dbeafe"]} style={styles.background}>
            <View style={styles.mainContainer}>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.textMetas}>
                        <Text style={styles.text}>Minhas Metas</Text>
                    </View>
                    <View style={styles.cardsMeta}>{renderContent()}</View>
                </ScrollView>

                <TouchableOpacity style={styles.newMetaContainer} onPress={() => setModalVisible(true)}>
                    <Text style={styles.plusIcon}>+</Text>
                </TouchableOpacity>

                {/* Modal adicionar/editar meta */}
                <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={closeModal}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {editingGoal ? "Editar Meta" : "Adicionar Nova Meta"}
                            </Text>
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
                                <Text style={styles.modalButtonText}>
                                    {editingGoal ? "Salvar Alterações" : "Adicionar"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButtonCancel} onPress={closeModal}>
                                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Modal confirmar exclusão */}
                <Modal animationType="fade" transparent visible={showConfirmDeleteModal} onRequestClose={() => setShowConfirmDeleteModal(false)}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
                            <Text style={styles.modalBodyText}>
                                Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
                            </Text>
                            <View style={styles.modalButtonRow}>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: "#6c757d", width: '100%' }]}
                                    onPress={() => setShowConfirmDeleteModal(false)}
                                >
                                    <Text style={styles.modalButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: "#dc3545", width: '100%' }]}
                                    onPress={handleConfirmDelete}
                                >
                                    <Text style={styles.modalButtonText}>Excluir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Modal celebração */}
                {showCelebration && (
                    <TouchableOpacity style={styles.celebrationContainer} onPress={() => setShowCelebration(false)} activeOpacity={1}>
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
        top: 20,
        right: 15,
        flexDirection: 'column',
        gap: 12,
    },
    container: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 16,
        paddingBottom: 100, // Espaço para o botão flutuante
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
        backgroundColor: '#f0f0f0', // Cor de fundo para indicar que está desabilitado
        opacity: 0.7,
    },
    textCard: {
        fontSize: 16,
        fontWeight: '500',
        paddingRight: 30,
        marginBottom: '5%',
    },
    progressRow: {
        width: '100%',
        marginTop: 0,
    },
    daysText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: "center",
        bottom: 19
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
        borderRadius: 20,
        width: '80%',
        alignItems: 'center',
        backgroundColor: '#2980B9',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        elevation: 5,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalButtonCancel: {
        backgroundColor: '#fc445a',
        marginTop: 10,
        padding: 12,
        borderRadius: 20,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        elevation: 5,
    },
    modalButtonTextCancel: {
        color: 'white',
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '50%',
        gap: 10,
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
    modalBodyText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#333'
    },
    modalButtonRow: {
        gap: 10,

        width: '80%',

    },
});