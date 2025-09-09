import Checkbox from 'expo-checkbox';
import { useRouter } from "expo-router";
import { LockKeyhole, User } from 'lucide-react-native';
import { useState } from 'react';
import { Dimensions, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Logo from '../../../assets/logo.svg';
import Mascote from '../../../assets/mascote.svg';

const { width, height } = Dimensions.get('window');

export default function Login() {
    const router = useRouter();
    const [toggleCheck, setToggleCheck] = useState(false);

   


    return (
        <ImageBackground
            source={require('../../../assets/images/gradiente.png')}
            style={styles.gradientBackground}
            blurRadius={20}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                            style={styles.input}
                            placeholderTextColor="#3386BC"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <LockKeyhole color='#3386bC' size={20} style={styles.icon} />
                        <TextInput
                            placeholder='Senha'
                            secureTextEntry
                            style={styles.input}
                            placeholderTextColor="#3386BC"
                        />
                    </View>

                    <View style={styles.optionsContainer}>
                        <View style={styles.checkboxContainer}>
                            <Checkbox
                                value={toggleCheck}
                                onValueChange={(newValue) => setToggleCheck(newValue)}
                                color={toggleCheck ? '#3386BC' : undefined}
                                style={styles.check}
                            />
                            <Text style={styles.checkboxText}>Lembrar</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.textSenha}>Esqueceu sua senha?</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => router.push('/pages/Home')} style={styles.button}>
                        <Text style={styles.buttonText}>Entrar</Text>
                    </TouchableOpacity>

                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>Não tem uma conta? </Text>
                        <TouchableOpacity onPress={() => router.push('/auth/register')}>
                            <Text style={styles.signupLink}>Inscreva-se</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

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
        marginBottom: '10%'

    },
    imagem: {
        width: width * 1.0,
        height: '40%',
        
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
        color: '#000',
    },
    icon: {
        position: 'absolute',
        left: 15,
        top: 13,
        zIndex: 1,
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
        marginLeft: '3%'
    },
    check: {
        width: 18,
        height: 18,
        borderColor: 'white'
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