import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Shield } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
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

export default function VerificarCodigo() {
    const [code, setCode] = useState(['', '', '', '']);
    const { alertConfig, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();
    const { email, returnTo } = useLocalSearchParams();
    
    // Refs para cada input
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const handleCodeChange = (text: string, index: number) => {
        // Permite apenas números
        const numericText = text.replace(/[^0-9]/g, '');
        
        if (numericText.length <= 1) {
            const newCode = [...code];
            newCode[index] = numericText;
            setCode(newCode);

            // Move para o próximo input se digitou um número
            if (numericText && index < 3) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Volta para o input anterior ao pressionar backspace
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerificar = async () => {
        const fullCode = code.join('');
        
        if (fullCode.length !== 4) {
            Alert.alert('Código incompleto', 'Por favor, digite o código de 4 dígitos.');
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.VERIFY_CODE}`, {
                email: email,
                code: fullCode
            });
            
            showSuccess(
                'Código verificado!',
                'Você será redirecionado para criar uma nova senha.'
            );
            
            // Redireciona para tela de nova senha após 1.5s
            setTimeout(() => {
                router.push({
                    pathname: '/auth/alterPassword',
                    params: { email, code: fullCode, returnTo }
                });
            }, 500);

        } catch(error: any) { 
            if(error.response?.status === 404) {
                showError(
                    'Código inválido',
                    'O código digitado está incorreto. Verifique e tente novamente.'
                );
            } else {
                showError(
                    'Erro',
                    'Ocorreu um erro ao verificar o código. Tente novamente.'
                );
            }
            console.log("Erro ao verificar código:", error.response?.status);
        }
    };

    const handleReenviar = async () => {
        try {
            await axios.post(`${API_BASE_URL}${ENDPOINTS.RECOVER_PASSWORD}`, {
                email: email
            });
            
            showSuccess(
                'Código reenviado!',
                'Verifique seu e-mail.'
            );
        } catch(error: any) {
            showError(
                'Erro',
                'Não foi possível reenviar o código. Tente novamente.'
            );
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

                            {/* --- Ícone --- */}
                            <View style={styles.iconContainer}>
                                <Shield size={60} color="#2980B9" />
                            </View>

                            <Text style={styles.title}>Verificar Código</Text>

                            <Text style={styles.instructions}>
                                Digite o código de 4 dígitos enviado para seu e-mail
                            </Text>
                            {email && (
                                <Text style={styles.emailText}>{email}</Text>
                            )}

                            {/* --- Inputs do Código --- */}
                            <View style={styles.codeContainer}>
                                {code.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => inputRefs.current[index] = ref}
                                        style={styles.codeInput}
                                        value={digit}
                                        onChangeText={(text) => handleCodeChange(text, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        selectTextOnFocus
                                    />
                                ))}
                            </View>

                            {/* --- Botão Verificar --- */}
                            <TouchableOpacity
                                onPress={handleVerificar}
                                style={styles.button}>
                                <Text style={styles.buttonText}>
                                    Verificar Código
                                </Text>
                            </TouchableOpacity>

                            {/* --- Reenviar Código --- */}
                            <TouchableOpacity
                                onPress={handleReenviar}
                                style={styles.resendButton}>
                                <Text style={styles.resendText}>
                                    Não recebeu o código? <Text style={styles.resendTextBold}>Reenviar</Text>
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
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
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
        marginBottom: 10,
        lineHeight: 24,
    },
    emailText: {
        fontSize: 14,
        fontFamily: 'Nunito',
        fontWeight: '600',
        color: '#2980B9',
        textAlign: 'center',
        marginBottom: 30,
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        marginBottom: 30,
    },
    codeInput: {
        width: 60,
        height: 70,
        borderRadius: 15,
        backgroundColor: 'white',
        fontSize: 32,
        fontFamily: 'Nunito',
        fontWeight: '700',
        textAlign: 'center',
        color: '#111827',
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
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
    resendButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    resendText: {
        fontSize: 14,
        fontFamily: 'Nunito',
        color: '#4b5563',
    },
    resendTextBold: {
        fontWeight: '700',
        color: '#2980B9',
    },
});