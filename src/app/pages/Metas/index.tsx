import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle2, Edit3, Info, Plus, Target, Trash2, X } from "lucide-react-native";
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
            const metaAtual = metas.find(m => m.id === metaId);
            if (!metaAtual) return;

            if (metaAtual.daysCompleted >= metaAtual.totalDias) {
                alert("🎯 Essa meta já foi concluída!");
                return;
            }

            await axios.patch(`${API_BASE_URL}${ENDPOINTS.GOAL_USER_COUNTER(metaId, userId)}`);
            await axios.patch(`${API_BASE_URL}${ENDPOINTS.GOAL_USER_EXECUTE(metaId, userId)}`);

            setMetas(prevMetas =>
                prevMetas.map(meta => {
                    if (meta.id === metaId) {
                        const newDaysCompleted = Math.min(meta.daysCompleted + 1, meta.totalDias);
                        return {
                            ...meta,
                            daysCompleted: newDaysCompleted,
                            disabled: true,
                        };
                    }
                    return meta;
                })
            );

            if (metaAtual.daysCompleted + 1 >= metaAtual.totalDias) {
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

    const addNewGoal = async () => {
        const description = novaMetaText.trim();
        const numberDays = Number(numeroDias);

        if (!description || !numberDays || numberDays <= 0) {
            alert("Preencha todos os campos com valores válidos!");
            return;
        }

        try {
            if (editingGoal) {
                await axios.patch(`${API_BASE_URL}${ENDPOINTS.GOAL_USER_UPDATE(editingGoal.id, userId)}`, {
                    description,
                    numberDays,
                });
            } else {
                await axios.post(`${API_BASE_URL}${ENDPOINTS.GOAL}`, {
                    userPersonId: userId,
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
                    <ActivityIndicator size="large" color="#0284c7" />
                    <Text style={styles.loadingText}>Carregando metas...</Text>
                </View>
            );
        }

        if (metas.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Target size={64} color="#cbd5e1" />
                    <Text style={styles.emptyTitle}>Nenhuma meta ainda</Text>
                    <Text style={styles.emptyText}>Comece criando sua primeira meta!</Text>
                </View>
            );
        }

        return metas.map(meta => {
            const isCompleted = meta.daysCompleted >= meta.totalDias;
            const progress = (meta.daysCompleted / meta.totalDias) * 100;

            return (
                <TouchableOpacity
                    key={meta.id}
                    style={[styles.card, isCompleted && styles.completedCard]}
                    onPress={() => handlePress(meta.id)}
                    disabled={meta.disabled}
                    activeOpacity={0.7}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.cardTitleRow}>
                            {isCompleted ? (
                                <CheckCircle2 size={24} color="#10b981" fill="#d1fae5" />
                            ) : (
                                <Target size={24} color="#0284c7" />
                            )}
                            <Text style={[styles.cardTitle, isCompleted && styles.completedText]}>
                                {meta.text}
                            </Text>
                        </View>
                        <View style={styles.cardActions}>
                            <TouchableOpacity
                                onPress={() => updateGoal(meta)}
                                style={styles.iconButton}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Edit3 size={20} color="#64748b" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setGoalToDeleteId(meta.id);
                                    setShowConfirmDeleteModal(true);
                                }}
                                style={styles.iconButton}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Trash2 size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.progressSection}>
                        <View style={styles.progressBarWrapper}>
                            <View style={styles.progressBarBg}>
                                <View 
                                    style={[
                                        styles.progressBarFill, 
                                        { 
                                            width: `${progress}%`,
                                            backgroundColor: isCompleted ? '#10b981' : '#0284c7'
                                        }
                                    ]} 
                                />
                            </View>
                        </View>
                        <View style={styles.progressInfo}>
                            <Text style={styles.progressText}>
                                {meta.daysCompleted} / {meta.totalDias} dias
                            </Text>
                            <Text style={styles.percentageText}>
                                {Math.round(progress)}%
                            </Text>
                        </View>
                    </View>

                    {isCompleted && (
                        <View style={styles.completedBadge}>
                            <Text style={styles.completedBadgeText}>✓ Concluída!</Text>
                        </View>
                    )}
                </TouchableOpacity>
            );
        });
    };

    return (
        <LinearGradient colors={['#f0f9ff', '#e0f2fe', '#bae6fd']} style={styles.background}>
            <View style={styles.mainContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Minhas Metas</Text>
                    <Text style={styles.headerSubtitle}>
                        {metas.length} {metas.length === 1 ? 'meta' : 'metas'}
                    </Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <Info size={18} color="#0284c7" />
                        <Text style={styles.infoText}>Toque na meta para marcar o dia como concluído</Text>
                    </View>

                    {/* Cards de Metas */}
                    <View style={styles.cardsContainer}>
                        {renderContent()}
                    </View>
                </ScrollView>

                {/* FAB */}
                <TouchableOpacity 
                    style={styles.fab} 
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#0284c7', '#0369a1']}
                        style={styles.fabGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Plus size={28} color="#fff" strokeWidth={3} />
                    </LinearGradient>
                </TouchableOpacity>

                {/* Modal Adicionar/Editar */}
                <Modal 
                    animationType="slide" 
                    transparent 
                    visible={modalVisible} 
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {editingGoal ? "Editar Meta" : "Nova Meta"}
                                </Text>
                                <TouchableOpacity onPress={closeModal}>
                                    <X size={24} color="#1e293b" />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="Nome da meta"
                                value={novaMetaText}
                                onChangeText={setNovaMetaText}
                                placeholderTextColor="#94a3b8"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Número de dias"
                                keyboardType="numeric"
                                value={numeroDias}
                                onChangeText={setNumeroDias}
                                placeholderTextColor="#94a3b8"
                            />

                            <TouchableOpacity 
                                style={styles.modalButtonWrapper}
                                onPress={addNewGoal}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#0284c7', '#0369a1']}
                                    style={styles.modalButton}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.modalButtonText}>
                                        {editingGoal ? "Salvar Alterações" : "Criar Meta"}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.modalButtonCancel} 
                                onPress={closeModal}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Modal Confirmar Exclusão */}
                <Modal 
                    animationType="fade" 
                    transparent 
                    visible={showConfirmDeleteModal} 
                    onRequestClose={() => setShowConfirmDeleteModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.deleteIconContainer}>
                                <Trash2 size={32} color="#ef4444" />
                            </View>
                            <Text style={styles.modalTitle}>Excluir Meta?</Text>
                            <Text style={styles.modalBodyText}>
                                Esta ação não pode ser desfeita. Tem certeza que deseja continuar?
                            </Text>
                            <View style={styles.modalButtonRow}>
                                <TouchableOpacity
                                    style={styles.modalButtonSecondary}
                                    onPress={() => setShowConfirmDeleteModal(false)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.modalButtonSecondaryText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalButtonDanger}
                                    onPress={handleConfirmDelete}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.modalButtonDangerText}>Excluir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Celebração */}
                {showCelebration && (
                    <TouchableOpacity 
                        style={styles.celebrationContainer} 
                        onPress={() => setShowCelebration(false)} 
                        activeOpacity={1}
                    >
                        <View style={styles.celebrationContent}>
                            <Text style={styles.celebrationTitle}>🎉 Meta Concluída! 🎉</Text>
                            <Image source={celebrationGif} style={styles.gif} />
                            <Text style={styles.celebrationSubtitle}>Parabéns pelo seu esforço!</Text>
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
        flex: 1,
    },
    mainContainer: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 15,
        color: '#64748b',
        fontWeight: '500',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#e0f2fe',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 20,
    },
    infoText: {
        fontSize: 14,
        color: '#0369a1',
        fontWeight: '500',
        flex: 1,
    },
    cardsContainer: {
        gap: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: "#0284c7",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    completedCard: {
        backgroundColor: '#f0fdf4',
        borderWidth: 2,
        borderColor: '#86efac',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
        flex: 1,
    },
    completedText: {
        color: '#10b981',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        padding: 4,
    },
    progressSection: {
        gap: 8,
    },
    progressBarWrapper: {
        marginBottom: 4,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    percentageText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0284c7',
    },
    completedBadge: {
        marginTop: 12,
        backgroundColor: '#d1fae5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    completedBadgeText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#10b981',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    emptyText: {
        fontSize: 15,
        color: '#64748b',
    },
    loadingText: {
        fontSize: 15,
        color: '#64748b',
        fontWeight: '500',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        overflow: 'hidden',
        shadowColor: "#0284c7",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    fabGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
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
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
        color: '#0f172a',
        backgroundColor: '#f8fafc',
    },
    modalButtonWrapper: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
    },
    modalButton: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    modalButtonCancel: {
        backgroundColor: '#f1f5f9',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonTextCancel: {
        color: '#475569',
        fontWeight: '700',
        fontSize: 16,
    },
    deleteIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalBodyText: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
        color: '#64748b',
        lineHeight: 22,
    },
    modalButtonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButtonSecondary: {
        flex: 1,
        backgroundColor: '#f1f5f9',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonSecondaryText: {
        color: '#475569',
        fontWeight: '700',
        fontSize: 16,
    },
    modalButtonDanger: {
        flex: 1,
        backgroundColor: '#ef4444',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonDangerText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    celebrationContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    celebrationContent: {
        alignItems: 'center',
        gap: 16,
    },
    celebrationTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '800',
    },
    celebrationSubtitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    gif: {
        width: 300,
        height: 300,
    },
});