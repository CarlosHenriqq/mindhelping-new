import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient"; // <-- 1. CORREÇÃO CRÍTICA AQUI
import { router, useFocusEffect } from "expo-router";
import {
    Bell,
    ChevronRight,
    CircleQuestionMark,
    Cog,
    LogOut,
    MapPin,
    TrophyIcon
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    Image,
    ScrollView, // <-- 2. ADICIONADO SCROLLVIEW
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { getMaxGoalsCompleted } from "../../../services/database";

export default function Perfil() {
    const [lastFeeling, setLastFeeling] = useState("");
    const [qtdeMetas, setQtdeMetas] = useState(0)

    async function loadLastFeeling() {
        try {
            const data = await AsyncStorage.getItem("@dailyFeelings");
            if (!data) return;

            const feelings = JSON.parse(data);
            const dates = Object.keys(feelings).sort();
            if (dates.length === 0) return;

            const lastDate = dates[dates.length - 1];
            const lastDayEntries = feelings[lastDate];

            if (Array.isArray(lastDayEntries) && lastDayEntries.length > 0) {
                const lastEntry = lastDayEntries[lastDayEntries.length - 1];
                setLastFeeling(lastEntry?.feeling || "Nenhum");
            } else {
                setLastFeeling("Nenhum");
            }
        } catch (error) {
            console.log("Erro ao carregar último sentimento:", error);
        }
    }

    async function getMetas() {
        try {
            const qtde = await getMaxGoalsCompleted()
            setQtdeMetas(qtde)
            console.log(qtdeMetas)
        }
        catch {
            console.log(error)
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            loadLastFeeling();
            getMetas()
        }, [])
    );
       useEffect(() => {
        getMetas();
    }, []);
    return (
        <LinearGradient
            colors={['#eff6ff', '#dbeafe']}
            style={styles.background}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* CARD PRINCIPAL DO PERFIL */}
                <View style={styles.profileCard}>
                    <TouchableOpacity
                        style={styles.trophyButton}
                        onPress={() => router.replace("/pages/Metas")}
                    >
                        <TrophyIcon color={"#333"} size={20} />
                        <Text style={styles.topButtonText}>Metas</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutButton}>
                        <LogOut size={20} color={"#ef4444"} />
                        <Text style={styles.logoutText}>Sair</Text>
                    </TouchableOpacity>

                    <Image
                        source={{ uri: "https://i.pravatar.cc/150?img=38" }}
                        style={styles.foto}
                    />
                    <Text style={styles.nome}>Juliana Alves</Text>
                    <View style={styles.locationContainer}>
                        <MapPin size={16} color={"#555"} />
                        <Text style={styles.locationText}>Birigui-SP</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton} onPress={() => router.replace('/pages/Perfil/editPerfil')}>
                        <Text style={styles.editButtonText}>Editar Perfil</Text>
                    </TouchableOpacity>

                    <View style={styles.cardsContainer}>
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>Metas concluídas</Text>
                            <Text style={styles.cardValue}>{qtdeMetas}</Text>
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.cardLabel}>Último humor</Text>
                            <Text style={styles.cardValue}>{lastFeeling || "Nenhum"}</Text>
                        </View>
                    </View>
                </View>

                {/* SEÇÃO DE CONFIGURAÇÕES */}
                <View style={styles.settingsContainer}>
                    <TouchableOpacity style={styles.settingsItem} onPress={() => router.replace('/pages/Perfil/Privacidade')}>
                        <Cog size={20} color={"#333"} />
                        <Text style={styles.settingsItemText}>Privacidade e segurança</Text>
                        <ChevronRight size={20} color={"#999"} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingsItem} onPress={() => router.replace('/pages/Perfil/Notificacoes')}>
                        <Bell size={20} color={"#333"} />
                        <Text style={styles.settingsItemText}>Notificações</Text>
                        <ChevronRight size={20} color={"#999"} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingsItem} onPress={() => router.replace('/pages/Perfil/FAQ')}>
                        <CircleQuestionMark size={20} color={"#333"} />
                        <Text style={styles.settingsItemText}>FAQ</Text>
                        <ChevronRight size={20} color={"#999"} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    scrollContainer: {
        padding: 20,
    },
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginTop: 40, // Espaço para o topo da tela
        marginBottom: 20,
    },
    trophyButton: {
        position: "absolute",
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        top: 15,
        right: 15,
        zIndex: 1,
        backgroundColor: '#f0f0f0',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
    },
    topButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333'
    },
    logoutButton: {
        position: "absolute",
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        top: 15,
        left: 15,
        zIndex: 1,
    },
    logoutText: {
        fontSize: 14,
        fontWeight: "bold",
        fontFamily: "Nunito",
        color: "#ef4444",
    },
    foto: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderColor: "#ededed",
        borderWidth: 3,
        marginBottom: 12,
        marginTop: 20, // Espaço para os botões de cima
    },
    nome: {
        fontSize: 22,
        color: "#111827",
        fontFamily: "Nunito",
        fontWeight: "700",
        marginBottom: 4,
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginBottom: 15,
    },
    locationText: {
        fontSize: 15,
        color: "#4b5563",
        fontFamily: "Nunito",
    },
    editButton: {
        borderRadius: 20,
        backgroundColor: "#2980B9",
        paddingVertical: 10,
        paddingHorizontal: 25,
        marginBottom: 20,
    },
    editButtonText: {
        textAlign: "center",
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
    },
    cardsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: '100%',
        gap: 15
    },
    card: {
        flex: 1,
        height: 70,
        backgroundColor: "#f9fafb",
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        padding: 5,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    cardLabel: {
        fontSize: 12,
        color: "#6b7280",
        textAlign: 'center',
    },
    cardValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1f2937",
        textTransform: 'capitalize'
    },
    settingsContainer: {
        width: '100%',
    },
    settingsItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,

    },
    settingsItemText: {
        flex: 1,
        marginLeft: 15,
        fontSize: 16,
        fontWeight: "600",
        fontFamily: "Nunito",
        color: '#374151'
    },
});
