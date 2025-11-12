import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { CustomAlert, useCustomAlert } from "../../../../components/CustomAlert"; // ✅ importação do alerta
import { API_BASE_URL, ENDPOINTS } from "../../../../config/api";
import { useUser } from "../../../../context/UserContext";

export default function Anotacoes() {
    const { dailyId } = useLocalSearchParams();
    const { userId } = useUser();

    const [anotacaoTexto, setAnotacaoTexto] = useState('');
    const [anotacaoId, setAnotacaoId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [displayDate, setDisplayDate] = useState(new Date());

    // ✅ Hook do alerta customizado
    const { alertConfig, showSuccess, showError, hideAlert } = useCustomAlert();

    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio',
        'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    const formatarData = (dateObj) => {
        if (!dateObj) return '';
        const mes = meses[dateObj.getMonth()];
        const diaSemana = dias[dateObj.getDay()];
        return `${diaSemana}, ${dateObj.getDate()} de ${mes} de ${dateObj.getFullYear()}`;
    };

    const carregarAnotacao = async (id) => {
        setLoading(true);
        try {
            console.log(`📖 Buscando anotação com ID: ${id}`);

            const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.DAILY(userId)}/${id}`);
            console.log("✅ Resposta da API:", response.data);

            const anotacao = response.data.daily || response.data;

            if (anotacao && anotacao.content) {
                setAnotacaoTexto(anotacao.content);
                setDisplayDate(new Date(anotacao.createdAt));
                console.log("✅ Anotação carregada com sucesso");
            } else {
                console.error("❌ Formato de resposta inesperado:", response.data);
                showError("Erro", "Não foi possível ler os dados da anotação.");
            }

        } catch (error) {
            console.error("❌ Erro ao carregar anotação:", error.response?.data || error.message);
            showError("Erro", "Não foi possível carregar a anotação.");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            console.log("\n🔍 [FOCUS] Tela focada");
            console.log("🔍 [FOCUS] dailyId recebido:", dailyId);

            setLoading(true);

            const idToUse = Array.isArray(dailyId) ? dailyId[0] : dailyId;
            const isValidId = idToUse &&
                idToUse !== 'undefined' &&
                idToUse !== 'null' &&
                typeof idToUse === 'string' &&
                idToUse.length > 10;

            if (isValidId) {
                console.log("📝 Modo EDIÇÃO/VISUALIZAÇÃO");
                setAnotacaoId(idToUse);
                carregarAnotacao(idToUse);
            } else {
                console.log("✨ Modo NOVA ANOTAÇÃO - LIMPANDO TUDO");
                setAnotacaoTexto('');
                setAnotacaoId(null);
                setDisplayDate(new Date());
                setLoading(false);
            }

            return () => console.log("👋 [FOCUS] Tela desfocada - limpando estados");
        }, [dailyId, userId])
    );

    const handleSalvar = async () => {
        if (!anotacaoTexto.trim()) {
            showError('Anotação vazia', 'Por favor, digite algo para salvar.');
            return;
        }

        try {
            console.log("💾 Salvando nova anotação...");
            const payload = { content: anotacaoTexto };

            const response = await axios.post(
                `${API_BASE_URL}${ENDPOINTS.DAILY(userId)}`,
                payload
            );

            console.log("✅ Anotação criada:", response.data);
            showSuccess('Sucesso', 'Anotação salva com sucesso!');
            setTimeout(() => router.back(), 1200);

        } catch (e) {
            console.error("❌ Erro ao salvar:", e.response?.data || e.message);
            showError('Erro', `Não foi possível salvar a anotação.`);
        }
    };

    return (
        <LinearGradient
            colors={['#eff6ff', '#dbeafe']}
            style={styles.background}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.mainContainer}>
                        <View style={styles.header}>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                style={styles.backButton}
                            >
                                <ChevronLeft color="#333" size={24} />
                                <Text style={styles.backButtonText}>Voltar</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.title}>
                            {anotacaoId ? "Visualizar Anotação" : "Nova Anotação"}
                        </Text>

                        <View style={styles.dateContainer}>
                            <Text style={styles.dateText}>{formatarData(displayDate)}</Text>
                        </View>

                        <View style={styles.inputContainer}>
                            {loading ? (
                                <ActivityIndicator size="large" color="#2980B9" />
                            ) : (
                                <TextInput
                                    placeholder="Comece a escrever aqui..."
                                    placeholderTextColor={'#9ca3af'}
                                    style={[
                                        styles.input,
                                        anotacaoId ? styles.inputReadOnly : null
                                    ]}
                                    multiline={true}
                                    onChangeText={setAnotacaoTexto}
                                    value={anotacaoTexto}
                                    editable={!anotacaoId}
                                />
                            )}
                        </View>

                        {!anotacaoId && !loading && (
                            <TouchableOpacity
                                onPress={handleSalvar}
                                style={styles.saveButton}
                            >
                                <Text style={styles.saveButtonText}>Salvar</Text>
                            </TouchableOpacity>
                        )}

                        {/* ✅ Alerta customizado */}
                        <CustomAlert
                            visible={alertConfig.visible}
                            type={alertConfig.type}
                            title={alertConfig.title}
                            message={alertConfig.message}
                            onClose={hideAlert}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    mainContainer: {
        flex: 1,
        paddingTop: StatusBar.currentHeight || 40,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    backButtonText: {
        color: '#333',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'Nunito',
        marginLeft: 5,
    },
    title: {
        fontSize: 28,
        fontFamily: 'Nunito',
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 10,
    },
    dateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 12,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dateText: {
        fontSize: 14,
        color: '#4b5563',
        fontWeight: '500',
    },
    inputContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 20,
        justifyContent: 'center'
    },
    input: {
        flex: 1,
        fontSize: 16,
        textAlignVertical: 'top',
        lineHeight: 24,
        color: '#1f2937',
    },
    inputReadOnly: {
        color: '#555',
        backgroundColor: '#f9f9f9'
    },
    saveButton: {
        backgroundColor: '#2980B9',
        borderRadius: 15,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    saveButtonText: {
        color: '#ffffff',
        fontFamily: 'Nunito',
        fontWeight: '700',
        fontSize: 18
    },
});
