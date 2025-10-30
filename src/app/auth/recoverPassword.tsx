import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert, // 1. Importado para a imagem de fundo
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
} from 'react-native';
import { CustomAlert, useCustomAlert } from "../../components/CustomAlert";
import { API_BASE_URL, ENDPOINTS } from '../../config/api';

export default function RecuperarSenha() {
    const [email, setEmail] = useState('');
    const { alertConfig, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();
    const { id, returnTo } = useLocalSearchParams();

    const handleRecuperar = async () => {
        if (!email.trim()) {
            Alert.alert('Campo obrigatório', 'Por favor, digite seu e-mail.');
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.RECOVER_PASSWORD}`,
                {
                    email: email
                })
            showSuccess(
                'Sucesso!',
                'Código enviado com sucesso!'
            );
            setTimeout(() => {
                router.push({
                    pathname: '/auth/verifyCode',
                    params: { email, returnTo }
                });
            }, 1500);
            console.log("Solicitando recuperação para:", email);

        } catch (error: any) {
            if (error.response?.status == 404)
                showError(
                    'Erro ao enviar código',
                    'Verifique se você digitou um e-mail válido e tente novamente.'
                );
            console.log("Email invalido:", email);
        }


    };

    const handleGoBack = () => {

        if (returnTo) {
            router.replace(returnTo as any);
        } else {
            router.replace('/pages/Home');
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <LinearGradient
                colors={['#eff6ff', '#dbeafe']} // Cores do seu padrão
                style={styles.background}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View style={styles.mainContainer}>

                            {/* --- Header (Botão Voltar) --- */}
                            <View style={styles.header}>
                                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                                    <ChevronLeft color="#333" size={24} />
                                    <Text style={styles.backButtonText}>Voltar</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.title}>Recuperar Senha</Text>

                            <Text style={styles.instructions}>
                                Digite seu e-mail abaixo. Enviaremos um link para você redefinir sua senha.
                            </Text>

                            {/* --- Input de E-mail --- */}
                            <View style={styles.inputContainer}>
                                <Mail size={20} color={'#161616ff'} style={styles.icon} />
                                <TextInput
                                    placeholder="Seu e-mail"
                                    placeholderTextColor={'#9ca3af'}
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            {/* --- Botão Enviar --- */}
                            <TouchableOpacity
                                onPress={handleRecuperar}
                                style={styles.button}>
                                <Text style={styles.buttonText}>
                                    Enviar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </LinearGradient>
            <CustomAlert
                visible={alertConfig.visible}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={hideAlert}
            />
        </View>
    );
}

const styles = StyleSheet.create({

    background: { // Estilo para o LinearGradient
        flex: 1,
        // Se a imagem de fundo for muito forte, adicione transparência:
        // backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    },
    mainContainer: {
        flex: 1,
        paddingTop: StatusBar.currentHeight || 0,
        paddingHorizontal: 20,
        justifyContent: 'center', // Centraliza o conteúdo (útil para login/recuperação)
    },
    header: {
        position: 'absolute', // Posição absoluta para ficar no topo
        top: StatusBar.currentHeight || 40,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
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
        marginBottom: 15,
    },
    instructions: {
        fontSize: 16,
        fontFamily: 'Nunito',
        color: '#4b5563',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    inputContainer: { // Estilo do input (baseado no searchContainer do Diario)
        width: '100%',
        alignSelf: 'center',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderRadius: 20,
        height: 50,
        paddingLeft: 40,
        paddingRight: 15,
        fontSize: 16,
        backgroundColor: 'white',
        borderColor: 'transparent',
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        color: '#1f2937', // Cor do texto digitado
    },
    icon: { // Ícone de e-mail (baseado no icon do Diario)
        position: 'absolute',
        left: 12,
        top: 15, // Ajustado para 15 (altura 50 / 2 - 10)
        zIndex: 1,
    },
    button: { // Estilo do botão (baseado no saveButton do Anotacoes)
        backgroundColor: '#2980B9',
        borderRadius: 15,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: { // Estilo do texto do botão (baseado no saveButtonText)
        color: '#ffffff',
        fontFamily: 'Nunito',
        fontWeight: '700',
        fontSize: 18
    },
});