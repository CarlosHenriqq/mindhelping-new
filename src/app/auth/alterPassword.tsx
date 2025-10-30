import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Eye, EyeOff, Lock } from 'lucide-react-native';
import React, { useState } from 'react';
import {
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
} from 'react-native';
import { CustomAlert, useCustomAlert } from "../../components/CustomAlert";
import { API_BASE_URL, ENDPOINTS } from '../../config/api';

export default function NovaSenha() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { alertConfig, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();
    const { email, code, returnTo } = useLocalSearchParams();

    const handleRedefinir = async () => {
        if (!newPassword.trim() || !confirmPassword.trim()) {
            Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos.');
            return;
        }

        if (newPassword.length < 6) {
            showWarning(
                'Senha fraca',
                'A senha deve ter pelo menos 6 caracteres.'
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            showError(
                'Senhas não coincidem',
                'As senhas digitadas não são iguais. Verifique e tente novamente.'
            );
            return;
        }

        try {
            const response = await axios.patch(`${API_BASE_URL}${ENDPOINTS.RESET_PASSWORD}`, {
                email: email,
                repeatPassword: confirmPassword,
                newPassword: newPassword
            });
            
            showSuccess(
                'Senha redefinida!',
                'Sua senha foi alterada com sucesso.'
            );
            
            // Redireciona para login após 2s
            setTimeout(() => {
                router.replace('/auth/login');
            }, 2000);

        } catch(error: any) { 
            if(error.response?.status === 400) {
                showError(
                    'Código expirado',
                    'O código de verificação expirou. Solicite um novo código.'
                );
            } else if(error.response?.status === 404) {
                showError(
                    'Erro',
                    'Não foi possível redefinir a senha. Verifique os dados e tente novamente.'
                );
            } else {
                showError(
                    'Erro',
                    'Ocorreu um erro ao redefinir a senha. Tente novamente.'
                );
            }
            console.log("Erro ao redefinir senha:", error.response?.status);
        }
    };

    const handleGoBack = () => {
        router.back();
    };

    return (
        <View style={{ flex: 1 }}>
            <LinearGradient
                colors={['#eff6ff', '#dbeafe']}
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

                            <Text style={styles.title}>Nova Senha</Text>

                            <Text style={styles.instructions}>
                                Digite sua nova senha abaixo
                            </Text>

                            {/* --- Input Nova Senha --- */}
                            <View style={styles.inputContainer}>
                                <Lock size={20} color={'#161616ff'} style={styles.icon} />
                                <TextInput
                                    placeholder="Nova senha"
                                    placeholderTextColor={'#9ca3af'}
                                    style={styles.input}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showNewPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                    style={styles.eyeIcon}>
                                    {showNewPassword ? (
                                        <EyeOff size={20} color={'#161616ff'} />
                                    ) : (
                                        <Eye size={20} color={'#161616ff'} />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* --- Input Confirmar Senha --- */}
                            <View style={styles.inputContainer}>
                                <Lock size={20} color={'#161616ff'} style={styles.icon} />
                                <TextInput
                                    placeholder="Confirmar senha"
                                    placeholderTextColor={'#9ca3af'}
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeIcon}>
                                    {showConfirmPassword ? (
                                        <EyeOff size={20} color={'#161616ff'} />
                                    ) : (
                                        <Eye size={20} color={'#161616ff'} />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* --- Dicas de Senha --- */}
                            <View style={styles.tipsContainer}>
                                <Text style={styles.tipsTitle}>Sua senha deve ter:</Text>
                                <Text style={styles.tipsText}>• No mínimo 6 caracteres</Text>
                                <Text style={styles.tipsText}>• Letras e números (recomendado)</Text>
                            </View>

                            {/* --- Botão Redefinir --- */}
                            <TouchableOpacity
                                onPress={handleRedefinir}
                                style={styles.button}>
                                <Text style={styles.buttonText}>
                                    Redefinir Senha
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
    background: {
        flex: 1,
    },
    mainContainer: {
        flex: 1,
        paddingTop: StatusBar.currentHeight || 0,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    header: {
        position: 'absolute',
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
    inputContainer: {
        width: '100%',
        alignSelf: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    input: {
        borderWidth: 1,
        borderRadius: 20,
        height: 50,
        paddingLeft: 40,
        paddingRight: 50,
        fontSize: 16,
        backgroundColor: 'white',
        borderColor: 'transparent',
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        color: '#1f2937',
    },
    icon: {
        position: 'absolute',
        left: 12,
        top: 15,
        zIndex: 1,
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        top: 15,
        zIndex: 1,
    },
    tipsContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
    },
    tipsTitle: {
        fontSize: 14,
        fontFamily: 'Nunito',
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    tipsText: {
        fontSize: 13,
        fontFamily: 'Nunito',
        color: '#4b5563',
        marginBottom: 4,
    },
    button: {
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
    buttonText: {
        color: '#ffffff',
        fontFamily: 'Nunito',
        fontWeight: '700',
        fontSize: 18
    },
});