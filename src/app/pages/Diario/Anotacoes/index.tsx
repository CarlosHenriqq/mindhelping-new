import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput, // <-- 1. IMPORTAÇÃO CORRIGIDA
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";

export default function Anotacoes() {
    const { anotacao } = useLocalSearchParams();

    const [anotacaoTexto, setAnotacaoTexto] = useState('');
    const [anotacaoId, setAnotacaoId] = useState(null);
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio',
        'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    const today = new Date();
    const mes = meses[today.getMonth()];
    const diaSemana = dias[today.getDay()];

    useEffect(() => {
        if (anotacao) {
            const item = JSON.parse(anotacao);
            setAnotacaoTexto(item.texto);
            setAnotacaoId(item.id);
        }
    }, [anotacao]);

    const handleSalvar = async () => {
        if (!anotacaoTexto.trim()) {
            Alert.alert('Anotação vazia', 'Por favor, digite algo para salvar.');
            return;
        }

        try {
            const stored = await AsyncStorage.getItem('@anotacoes');
            const arr = stored ? JSON.parse(stored) : [];

            if (anotacaoId) {
                // Atualiza a anotação existente
                const index = arr.findIndex(a => a.id === anotacaoId);
                if (index !== -1) {
                    arr[index].texto = anotacaoTexto;
                    arr[index].data = today.toISOString();
                }
            } else {
                // Cria uma nova anotação
                const novaNota = {
                    id: Date.now().toString(),
                    texto: anotacaoTexto,
                    data: today.toISOString()
                };
                arr.push(novaNota);
            }

            await AsyncStorage.setItem('@anotacoes', JSON.stringify(arr));
            router.replace("/pages/Diario");
        } catch (e) {
            console.error("Erro ao salvar anotação", e);
            Alert.alert('Erro', 'Não foi possível salvar a anotação.');
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
                    {/* 2. CONTAINER PRINCIPAL CORRIGIDO PARA USAR flex: 1 */}
                    <View style={styles.mainContainer}>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => router.replace("/pages/Diario")} style={styles.backButton}>
                                <ChevronLeft color="#333" size={24} />
                                <Text style={styles.backButtonText}>Voltar</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.title}>
                            {anotacaoId ? "Editar Anotação" : "Nova Anotação"}
                        </Text>

                        <View style={styles.dateContainer}>
                            <Text style={styles.dateText}>{diaSemana}, {today.getDate()} de {mes} de {today.getFullYear()}</Text>
                        </View>

                        {/* 3. ÁREA DE TEXTO AGORA OCUPA O ESPAÇO CORRETAMENTE */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="Comece a escrever aqui..."
                                placeholderTextColor={'#9ca3af'}
                                style={styles.input}
                                multiline={true}
                                onChangeText={setAnotacaoTexto}
                                value={anotacaoTexto}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleSalvar}
                            style={styles.saveButton}>
                            <Text style={styles.saveButtonText}>
                                {anotacaoId ? "Atualizar" : "Salvar"}
                            </Text>
                        </TouchableOpacity>
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
        flex: 1, // <-- FAZ O CONTAINER DO TEXTO OCUPAR O RESTO DA TELA
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 20,
    },
    input: {
        flex: 1,
        fontSize: 16,
        textAlignVertical: 'top',
        lineHeight: 24,
        color: '#1f2937',
    },
    saveButton: {
        backgroundColor: '#2980B9',
        borderRadius: 15,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20, // Espaço para o teclado não cobrir
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

