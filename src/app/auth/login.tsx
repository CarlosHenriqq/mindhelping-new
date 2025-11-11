import axios from 'axios';
import Checkbox from 'expo-checkbox';
import { useRouter } from "expo-router";
import { Eye, EyeOff, LockKeyhole, User } from 'lucide-react-native'; // 👈 importados ícones
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Logo from '../../../assets/logo.svg';
import Mascote from '../../../assets/mascote.svg';
import { CustomAlert, useCustomAlert } from '../../components/CustomAlert';
import { API_BASE_URL, ENDPOINTS } from '../../config/api';
import { useUser } from '../../context/UserContext';

const { width } = Dimensions.get('window');

export default function Login() {
    const router = useRouter();
    const { alertConfig, showError, hideAlert } = useCustomAlert();
    const [toggleCheck, setToggleCheck] = useState(false);
    const [login, setLogin] = useState('');
    const [senha, setSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false); // 👈 controle do olho
    const [loading, setLoading] = useState(false);

    const { setUserId } = useUser();

    async function handleLogin() {
        if (!login || !senha) {
            showError('Ops, algo deu errado!', 'Preencha todos os campos e tente novamente');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.LOGIN}`, {
                email: login,
                password: senha
            });

            const id = response.data?.user?.userId;
            console.log("[LOGIN] Resposta completa da API:", JSON.stringify(response.data, null, 2));
            console.log("[LOGIN] ID extraído da API:", id);

            if (!id) {
                Alert.alert("Erro de Login", "A API não retornou um ID de usuário.");
                setLoading(false);
                return;
            }

            await setUserId(id, toggleCheck);
            router.replace('/pages/Home');

        } catch (error: any) {
            showError('Erro ao logar', 'E-mail ou senha incorretos');
            console.error("[LOGIN] Erro na requisição de login:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    }

    function handleRecover(id: string) {
        router.replace({
            pathname: "/auth/recoverPassword",
            params: { id, returnTo: '/auth/login' }
        });
    }

    return (
        <ImageBackground
            source={require('../../../assets/images/gradiente.png')}
            style={styles.gradientBackground}
            blurRadius={20}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'android' ? -50 : 0}
            >
                <ScrollView contentContainerStyle={styles.principal} keyboardShouldPersistTaps="handled">
                    <Logo />
                    <View style={{ alignItems: 'center', bottom: '57%', position: 'absolute' }}>
                        <Mascote width={350} height={160} />
                    </View>
                    <Text style={styles.titulo}>FAÇA SEU LOGIN!</Text>

                    <View style={styles.inputContainer}>
                        <User color='#3386bC' size={20} style={styles.icon} />
                        <TextInput
                            placeholder='E-mail'
                            onChangeText={setLogin}
                            style={styles.input}
                            placeholderTextColor="#3386BC"
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    {/* CAMPO DE SENHA COM ÍCONE DE OLHO */}
                    <View style={styles.inputContainer}>
                        <LockKeyhole color='#3386bC' size={20} style={styles.icon} />
                        <TextInput
                            placeholder='Senha'
                            onChangeText={setSenha}
                            secureTextEntry={!showPassword}
                            style={styles.input}
                            placeholderTextColor="#3386BC"
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIconContainer}
                        >
                            {showPassword
                                ? <EyeOff color="#3386BC" size={20} />
                                : <Eye color="#3386BC" size={20} />}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.optionsContainer}>
                        <View style={styles.checkboxContainer}>
                            <Checkbox
                                value={toggleCheck}
                                onValueChange={setToggleCheck}
                                color={toggleCheck ? '#3386BC' : undefined}
                                style={styles.check}
                            />
                            <Text style={styles.checkboxText}>Lembrar</Text>
                        </View>
                        <TouchableOpacity onPress={handleRecover}>
                            <Text style={styles.textSenha}>Esqueceu sua senha?</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        style={[styles.button, loading && { opacity: 0.7 }]}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Entrar</Text>}
                    </TouchableOpacity>

                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>Não tem uma conta? </Text>
                        <TouchableOpacity onPress={() => router.push('/auth/register')}>
                            <Text style={styles.signupLink}>Inscreva-se</Text>
                        </TouchableOpacity>
                    </View>

                    <CustomAlert
                        visible={alertConfig.visible}
                        type={alertConfig.type}
                        title={alertConfig.title}
                        message={alertConfig.message}
                        onClose={hideAlert}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

// --- estilos ---
const styles = StyleSheet.create({
    gradientBackground: {
        flex: 1,
        backgroundColor: '#3386BC',
    },
    principal: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
        marginBottom: '10%',
    },
    titulo: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
        marginTop: '20%',
        marginBottom: '10%',
        textShadowColor: 'rgba(255, 255, 255, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    inputContainer: {
        width: width * 0.85,
        marginBottom: 15,
        justifyContent: 'center',
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        height: 48,
        fontSize: 16,
        paddingLeft: 45,
        paddingRight: 45, // 👈 espaço pro ícone de olho
        color: '#000',
    },
    icon: {
        position: 'absolute',
        left: 15,
        top: 13,
        zIndex: 1,
    },
    eyeIconContainer: {
        position: 'absolute',
        right: 15,
        top: 13,
    },
    optionsContainer: {
        width: width * 0.85,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: '3%',
    },
    check: {
        width: 18,
        height: 18,
        borderColor: 'white',
    },
    checkboxText: {
        color: 'white',
        fontSize: 14,
        marginLeft: width * 0.03,
    },
    textSenha: {
        color: 'white',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    button: {
        backgroundColor: '#3D9CDA',
        borderRadius: 20,
        height: 44,
        width: width * 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowRadius: 6,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    signupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    signupText: {
        color: 'white',
        fontSize: 14,
    },
    signupLink: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
        textShadowColor: 'rgba(255, 255, 255, 0.5)',
        textShadowOffset: { width: 1, height: 0.5 },
        textShadowRadius: 1,
    },
});
