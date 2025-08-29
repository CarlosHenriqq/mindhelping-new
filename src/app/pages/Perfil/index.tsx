import AsyncStorage from "@react-native-async-storage/async-storage";
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
import React, { useState } from "react";
import {
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function Perfil() {
    const [lastFeeling, setLastFeeling] = useState("");

    async function loadLastFeeling() {
        try {
            const data = await AsyncStorage.getItem("@dailyFeelings");

            if (!data) return;

            const feelings = JSON.parse(data);
            const dates = Object.keys(feelings).sort(); // ordena as datas
            const lastDate = dates[dates.length - 1]; // pega a última data
            const lastEntry = feelings[lastDate];

            let last;
            if (Array.isArray(lastEntry)) {
                last = lastEntry[lastEntry.length - 1]?.feeling || "Nenhum";
            } else if (typeof lastEntry === "string") {
                last = lastEntry;
            } else {
                last = "Nenhum";
            }

            setLastFeeling(last);
        } catch (error) {
            console.log("Erro ao carregar último sentimento:", error);
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            loadLastFeeling();
        }, [])
    );

    return (
        <ImageBackground
            source={require("../../../../assets/images/gradiente.png")}
            style={styles.background}
            blurRadius={20}
        >
            {/* Botão do troféu */}
            <TouchableOpacity
                style={styles.trophyButton}
                onPress={() => router.replace("/pages/Metas")}
            >
                <TrophyIcon color={"black"} size={20} />
                <Text style={{ fontSize: 14 }}>Metas</Text>
            </TouchableOpacity>
            {/* Botão do logout */}
            <TouchableOpacity style={styles.logout}>
                <LogOut size={20} color={"red"} />
                <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>

            {/* Perfil */}
            <View style={styles.container}>
                <Image
                    source={{ uri: "https://i.pravatar.cc/150?img=38" }}
                    style={styles.foto}
                />

                <Text style={styles.nome}>Juliana Alves</Text>

                <View style={styles.locationContainer}>
                    <MapPin size={18} color={"black"} />
                    <Text style={styles.locationText}>Birigui-SP</Text>
                </View>

                <TouchableOpacity style={styles.editButton} onPress={()=>router.replace('/pages/Perfil/editPerfil')}>
                    <Text style={styles.editButtonText}>Editar Perfil</Text>
                </TouchableOpacity>
                {/* Cards */}
                <View style={styles.cardsContainer}>
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Metas concluídas:</Text>
                        <Text style={styles.cardValue}>2</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Último humor:</Text>
                        <Text style={styles.cardValue}>{lastFeeling || "Nenhum"}</Text>
                    </View>
                </View>
            </View>

            {/* Configurações */}
            <View style={styles.containerConfig}>
                <Text style={styles.textConfig}>Configurações</Text>

                <TouchableOpacity style={styles.infosConfig}>
                    <Cog size={18} color={"black"} />
                    <Text style={styles.infosConfigText}>Privacidade e segurança</Text>
                    <ChevronRight size={18} color={"black"} style={styles.chevron} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.infosConfig}>
                    <Bell size={18} color={"black"} />
                    <Text style={styles.infosConfigText}>Notificações</Text>
                    <ChevronRight size={18} color={"black"} style={styles.chevron} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.infosConfig}>
                    <CircleQuestionMark size={18} color={"black"} />
                    <Text style={styles.infosConfigText}>FAQ</Text>
                    <ChevronRight size={18} color={"black"} style={styles.chevron} />
                </TouchableOpacity>



            </View>

        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    container: {
        marginTop: "15%",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        margin: '5%',
        backgroundColor: '#ededed',
        borderRadius: 20
    },
    trophyButton: {
        position: "absolute",
        
        gap:5,
        top: 80,
        right: 35,
        alignItems: "center",
        zIndex: 1,
    },
    foto: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderColor: "white",
        borderWidth: 2,
        marginTop:'10%',
        marginBottom: 12,
    },
    nome: {
        fontSize: 22,
        color: "black",
        fontFamily: "Nunito",
        fontWeight: "700",
        marginBottom: 6,
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginBottom: "5%",
    },
    locationText: {
        fontSize: 16,
        color: "black",
        fontFamily: "Nunito",
        fontWeight: "700",
    },
    editButton: {
        borderRadius: 20,
        backgroundColor: "#2980B9",
        paddingVertical: 10,
        paddingHorizontal: 20,
        shadowColor: '#000000',
        shadowRadius: 10,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
    },
    editButtonText: {
        textAlign: "center",
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
    },
    containerConfig: {
        borderRadius: 20,
        margin: '5%',
        marginTop: "5%",
        paddingHorizontal: "5%",
        padding: 10,
        flex: 1,
        backgroundColor:'#ededed'
    },
    textConfig: {
        marginTop: '5%',
        fontSize: 22,
        fontFamily: "Nunito",
        fontWeight: "bold",
    },
    infosConfig: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: "5%",
        alignItems: "center",
        
    },
    infosConfigText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 20,
        fontWeight: "bold",
        fontFamily: "Nunito",
    },
    chevron: {
        marginLeft: "auto",
    },
    cardsContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginTop: "5%",
        paddingHorizontal: 20,
        gap: 15
    },
    card: {
        width: 120,
        height: 60,
        backgroundColor: "#f0f0f0f0",

        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: '#000000',
        shadowRadius: 10,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
    },
    cardLabel: {
        fontSize: 12,
        color: "#333",
    },
    cardValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    logout: {
        position: "absolute",
        flexDirection:'row',
        gap:5,
        top: 80,
        left: 35,
        alignItems: "center",
        zIndex: 1,
    },
    logoutText: {
        fontSize: 14,
        fontWeight: "bold",
        fontFamily: "Nunito",
        color: "red", // já aplica direto aqui
    },

});
