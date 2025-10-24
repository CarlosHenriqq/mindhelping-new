import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator // Importar para o loading
    ,


    Alert,
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
import { API_BASE_URL, ENDPOINTS } from "../../../../config/api";
import { useUser } from "../../../../context/UserContext";

export default function Anotacoes() {
    // 1. CORREÇÃO: Receber 'dailyId' (que a tela Diario envia)
    const { dailyId } = useLocalSearchParams();
    const { userId } = useUser();

    const [anotacaoTexto, setAnotacaoTexto] = useState('');

    // Este estado agora controla se estamos em modo de visualização/edição
    const [anotacaoId, setAnotacaoId] = useState(dailyId || null);
    const [loading, setLoading] = useState(false);

    // Estado para guardar a data da anotação (para visualização)
    const [displayDate, setDisplayDate] = useState(new Date());

    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio',
        'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    // Função helper para formatar a data
    const formatarData = (dateObj) => {
        if (!dateObj) return '';
        const mes = meses[dateObj.getMonth()];
        const diaSemana = dias[dateObj.getDay()];
        return `${diaSemana}, ${dateObj.getDate()} de ${mes} de ${dateObj.getFullYear()}`;
    };

    // ##### useEffect CORRIGIDO #####
    useEffect(() => {
        const carregarAnotacao = async (dailyId) => {
            setLoading(true);
            try {
                // 1. Log para confirmar que a busca está sendo feita
                console.log(`Buscando anotação com ID: ${dailyId} para userId: ${userId}`);

                const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.DAILY(userId)}/${dailyId}`);

                // 2. Log para ver o que a API realmente retornou
                console.log("Resposta da API (item único):", JSON.stringify(response.data, null, 2));

                // 3. CORREÇÃO: Acessar o objeto "daily" aninhado
                const anotacao = response.data.daily; // <--- A MUDANÇA ESTÁ AQUI

                if (anotacao && anotacao.content) {
                    setAnotacaoTexto(anotacao.content);
                    setDisplayDate(new Date(anotacao.createdAt));
                } else {
                    // Fallback se a resposta for plana (o que eu tinha antes)
                    if (response.data.content) {
                        setAnotacaoTexto(response.data.content);
                        setDisplayDate(new Date(response.data.createdAt));
                    } else {
                        console.error("Formato de resposta inesperado:", response.data);
                        Alert.alert("Erro", "Não foi possível ler os dados da anotação.");
                    }
                }

            } catch (error) {
                console.error("Erro ao carregar anotação:", error.response?.data || error.message);
                Alert.alert("Erro", "Não foi possível carregar a anotação.");
                router.replace("/pages/Diario");
            } finally {
                setLoading(false);
            }
        };

        if (dailyId) {
            setAnotacaoId(dailyId);
            carregarAnotacao(dailyId);
        } else {
            // Se não tem dailyId, é uma nova anotação
            setAnotacaoTexto('');
            setAnotacaoId(null);
            setDisplayDate(new Date()); // Usa a data de hoje
        }
    }, [dailyId, userId]); // Depende do dailyId e userId

    // Esta função agora só será chamada para CRIAR novas anotações
    const handleSalvar = async () => {
        if (!anotacaoTexto.trim()) {
            Alert.alert('Anotação vazia', 'Por favor, digite algo para salvar.');
            return;
        }

        try {
            const payload = {
                content: anotacaoTexto
            };

            // A lógica de 'anotacaoId' (PATCH) não é mais necessária aqui,
            // pois o botão de salvar só aparece para novas anotações.
            // Mas manter a lógica completa não prejudica.

            if (anotacaoId) {
                // Este bloco não deve mais ser acessado se o botão estiver oculto
                Alert.alert("Erro", "Não é possível atualizar uma anotação existente por aqui.");
                return;

            } else {
                // Cria uma nova anotação
                const response = await axios.post(
                    `${API_BASE_URL}${ENDPOINTS.DAILY(userId)}`,
                    payload
                );
                console.log("Anotação criada", response.data);
            }

            Alert.alert('Sucesso', 'Anotação salva com sucesso!');
            router.replace("/pages/Diario");

        } catch (e) {
            console.error("Erro ao salvar:", e.response?.data || e.message);
            Alert.alert('Erro', `Não foi possível salvar a anotação: ${e.response?.data?.message || e.message}`);
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
                            <TouchableOpacity onPress={() => router.replace("/pages/Diario")} style={styles.backButton}>
                                <ChevronLeft color="#333" size={24} />
                                <Text style={styles.backButtonText}>Voltar</Text>
                            </TouchableOpacity>
                        </View>

                        {/* 3. TÍTULO CORRIGIDO */}
                        <Text style={styles.title}>
                            {anotacaoId ? "Visualizar Anotação" : "Nova Anotação"}
                        </Text>

                        {/* 4. DATA CORRIGIDA (usa o estado 'displayDate') */}
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
                                        // Estilo de "desabilitado" se anotacaoId existir
                                        anotacaoId ? styles.inputReadOnly : null
                                    ]}
                                    multiline={true}
                                    onChangeText={setAnotacaoTexto}
                                    value={anotacaoTexto}
                                    // 5. TRAVA DE EDIÇÃO
                                    editable={!anotacaoId}
                                />
                            )}
                        </View>

                        {/* 6. BOTÃO SÓ APARECE SE FOR UMA NOVA ANOTAÇÃO */}
                        {!anotacaoId && (
                            <TouchableOpacity
                                onPress={handleSalvar}
                                style={styles.saveButton}>
                                <Text style={styles.saveButtonText}>
                                    Salvar
                                </Text>
                            </TouchableOpacity>
                        )}
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
        // Adicionado para centralizar o loading
        justifyContent: 'center'
    },
    input: {
        flex: 1,
        fontSize: 16,
        textAlignVertical: 'top',
        lineHeight: 24,
        color: '#1f2937',
    },
    // Novo estilo para o modo "somente leitura"
    inputReadOnly: {
        color: '#555', // Texto um pouco mais claro
        backgroundColor: '#f9f9f9' // Fundo levemente acinzentado
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