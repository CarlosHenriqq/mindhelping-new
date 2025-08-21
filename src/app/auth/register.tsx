import { useFocusEffect, useNavigation, } from '@react-navigation/native';
import { router } from 'expo-router';
import { Calendar, ChevronDown, ChevronUp, IdCard, Lock, Mail, Phone, User, XCircleIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { isValidCPF, isValidEmail, isValidPassword, isValidPhone } from '../../validators/validator';



export default function SignUp() {
    const navigation = useNavigation();
    const [errors, setErrors] = useState({
        name: '',
        birthDate: '',
        cpf: '',
        gender: '',
        phone: '',
        email: '',
        password: '',
        cep: '',
        numero: ''
    });
    const validateForm = () => {
        let isValid = true;
        const newErrors = { ...errors };

        if (!name) {
            newErrors.name = 'Nome é obrigatório';
            isValid = false;
        } else {
            newErrors.name = '';
        }

        if (!birthDate) {
            newErrors.birthDate = 'Data de nascimento é obrigatória';
            isValid = false;
        } else {
            newErrors.birthDate = '';
        }

        if (!cpf) {
            newErrors.cpf = 'CPF é obrigatório';
            isValid = false;
        } else if (!isValidCPF(cpf)) {
            newErrors.cpf = 'CPF inválido';
            isValid = false;
        } else {
            newErrors.cpf = '';
        }
        if (!gender) {
            newErrors.gender = 'Identidade de gênero é obrigatória';
            isValid = false;
        } else {
            newErrors.gender = '';
        }

        if (!phone) {
            newErrors.phone = 'Telefone é obrigatório';
            isValid = false;
        } else if (!isValidPhone(phone)) {
            newErrors.phone = 'Telefone inválido';
            isValid = false;
        } else {
            newErrors.phone = '';
        }

        if (!email) {
            newErrors.email = 'E-mail é obrigatório';
            isValid = false;
        } else if (!isValidEmail(email)) {
            newErrors.email = 'E-mail inválido';
            isValid = false;
        } else {
            newErrors.email = '';
        }

        if (!password) {
            newErrors.password = 'Senha é obrigatória';
            isValid = false;
        } else if (!isValidPassword(password)) {
            newErrors.password = 'Senha deve ter ao menos 6 caracteres';
            isValid = false;
        } else {
            newErrors.password = '';
        }

        if (!cep) {
            newErrors.cep = 'CEP é obrigatório';
            isValid = false;
        } else {
            newErrors.cep = '';
        }

        if (!numero) {
            newErrors.numero = 'Número é obrigatório';
            isValid = false;
        } else {
            newErrors.numero = '';
        }

        // Continue para os outros campos...

        setErrors(newErrors);
        return isValid;
    };


    const handleSignUp = () => {
        if (validateForm()) {
            navigation.navigate('Login');
        }
    };



    // Estados para os campos do formulário
    const [name, setName] = useState('');
    const [cpf, setCPF] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cep, setCep] = useState('');
    const [endereco, setEndereco] = useState('');
    const [numero, setNumero] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [uf, setUf] = useState('');


    // Estados para o dropdown de gênero

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [gender, setGender] = useState(null);
    const [genderItem, setGenderItem] = useState([
        { label: 'Homem cisgênero', value: 'cism' },
        { label: 'Mulher cisgênero', value: 'cisf' },
        { label: 'Homem transgênero', value: 'transm' },
        { label: 'Mulher transgênero', value: 'transf' },
        { label: 'Não-binário', value: 'nbin' },
        { label: 'Travesti', value: 'travest' },
        { label: 'Prefiro não dizer', value: 'naodizer' }
    ]);
    const enderecoCompleto = `${endereco}${numero ? ', ' + numero : ''}${bairro ? ' - ' + bairro : ''}${cidade ? ', ' + cidade : ''}${uf ? '/' + uf : ''}`;
    const inputFields = [
        {
            placeholder: 'Nome',
            key: 'name',
            icon: <User color="#3386BC" size={20} />,
            fullWidth: true,
            value: name,
            onChangeText: setName,
            error: errors.name
        },
        {
            placeholder: 'Data de nascimento',
            key: 'birthDate',
            keyboardType: 'numeric',
            icon: <Calendar color="#3386BC" size={20} />,
            maxLength: 10,
            value: birthDate,
            onChangeText: (text: string) => {
                let cleanedText = text.replace(/\D/g, '');
                if (cleanedText.length > 4) {
                    cleanedText = `${cleanedText.slice(0, 2)}/${cleanedText.slice(2, 4)}/${cleanedText.slice(4, 8)}`;
                } else if (cleanedText.length > 2) {
                    cleanedText = `${cleanedText.slice(0, 2)}/${cleanedText.slice(2)}`;
                }
                setBirthDate(cleanedText);
            },
            error: errors.birthDate
        },
        {
            placeholder: 'CPF',
            key: 'cpf',
            icon: <IdCard color="#3386BC" size={20} />,
            keyboardType: 'numeric',
            maxLength: 14,
            value: cpf,
            onChangeText: (text: string) => {
                let cpfCleaned = text.replace(/\D/g, '');

                if (cpfCleaned.length <= 3) {
                    setCPF(cpfCleaned);
                } else if (cpfCleaned.length <= 6) {
                    setCPF(`${cpfCleaned.slice(0, 3)}.${cpfCleaned.slice(3)}`);
                } else if (cpfCleaned.length <= 9) {
                    setCPF(`${cpfCleaned.slice(0, 3)}.${cpfCleaned.slice(3, 6)}.${cpfCleaned.slice(6)}`);
                } else {
                    setCPF(`${cpfCleaned.slice(0, 3)}.${cpfCleaned.slice(3, 6)}.${cpfCleaned.slice(6, 9)}-${cpfCleaned.slice(9, 11)}`);
                }
            },
            error: errors.cpf
        },
        {
            key: 'genderPicker',
            render: () => (
                <View style={{ width: '100%', marginBottom: 10 }}>
                    <View style={errors.gender ? { borderColor: '#DDD', borderWidth: 0, borderRadius: 20 } : null}>
                        
                        <DropDownPicker
                            open={open}
                            value={value}
                            listMode="SCROLLVIEW"
                            placeholder='Selecione sua identidade de gênero'
                            items={genderItem}
                            
                            setOpen={setOpen}
                            setValue={setValue}
                            setItems={setGenderItem}
                            style={{ borderRadius: 20, borderWidth: 1, borderColor: '#DDD' }}
                            dropDownContainerStyle={{ borderColor: '#DDD', borderBottomEndRadius: 20, borderBottomStartRadius: 20 }}
                            textStyle={{ color: '#3386BC' }}
                            ArrowDownIconComponent={() => (
                                <ChevronDown color="#3386BC" size={20} />
                            )}
                            ArrowUpIconComponent={() => (
                                <ChevronUp color="#3386BC" size={20} /> // Use a mesma cor ou uma diferente
                            )}
                        />
                    </View>
                    {errors.gender && (
                        <>
                            <XCircleIcon color="red" size={20} style={{ position: 'absolute', right: 15, top: 15 }} />
                            <Text style={{
                                color: '#d64a4aff',
                                fontSize: 14,
                                marginBottom: -5,
                                top: 5,
                                marginLeft: 10,
                                alignSelf: 'flex-start',
                                width: '100%'
                            }}>{errors.gender}</Text>
                        </>
                    )}
                </View>
            )
        },
        {
            placeholder: 'Telefone',
            key: 'phone',
            icon: <Phone color="#3386BC" size={20} />,
            keyboardType: 'numeric',
            fullWidth: true,
            value: phone,
            onChangeText: (text: string) => {
                let cleaned = text.replace(/\D/g, ''); // Remove tudo que não for número

                if (cleaned.length <= 2) {
                    // Apenas DDD
                    setPhone(`(${cleaned}`);
                } else if (cleaned.length <= 6) {
                    // DDD + começo do número
                    setPhone(`(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`);
                } else if (cleaned.length <= 10) {
                    // Número fixo: (11) 1234-5678
                    setPhone(`(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`);
                } else {
                    // Celular com 9 dígitos: (11) 91234-5678
                    setPhone(`(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`);
                }
            },
            error: errors.phone

        },
        {
            placeholder: 'Endereço de e-mail',
            key: 'email',
            icon: <Mail color="#3386BC" size={20} />,
            fullWidth: true,
            value: email,
            onChangeText: setEmail,
            error: errors.email
        },
        {
            placeholder: 'Senha',
            key: 'password',
            icon: <Lock color="#3386BC" size={20} />,
            secure: true,
            fullWidth: true,
            value: password,
            onChangeText: setPassword,
            error: errors.password
        }
    ]





    useFocusEffect(
        React.useCallback(() => {
            StatusBar.setTranslucent(true);
            StatusBar.setBackgroundColor('transparent');
        }, [])
    );

    return (
        <ImageBackground
            source={require('../../../assets/images/gradiente.png')}
            style={styles.gradientBackground}
            blurRadius={20}
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.header}>


                    <Text style={styles.title}>INSCREVA-SE</Text>
                    <Text style={styles.subtitle}>Crie sua conta!</Text>
                </View>
               



                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled" // Permite tocar no dropdown
                >
                    {inputFields.map((field) => (
                        field.render ? (
                            <View key={field.key} style={{ width: '85%', marginBottom: 5 }}>
                                {field.render()}
                                {errors[field.key] && <Text style={styles.errorText}>{errors[field.key]}</Text>}
                            </View>
                        ) : field.fields ? (
                            <View key={field.key} style={styles.rowContainer}>
                                {field.fields.map((subField) => (
                                    <View key={subField.key} style={{ flex: subField.flex || 1, marginHorizontal: 4 }}>
                                        <View style={[
                                            styles.inputWrapper,
                                            errors[subField.key] && styles.errorInputWrapper
                                        ]}>
                                            <View style={styles.iconContainer}>{subField.icon}</View>
                                            <TextInput
                                                placeholder={subField.placeholder}
                                                placeholderTextColor="#3386BC"
                                                style={styles.input}
                                                value={subField.value}
                                                onChangeText={(text) => {
                                                    // Padronize para usar onChangeText em todos os campos
                                                    if (subField.onChangeText) {
                                                        subField.onChangeText(text);
                                                    } else if (subField.onChange) {
                                                        subField.onChange({ target: { value: text } }); // Converte para formato compatível
                                                    }
                                                    setErrors({ ...errors, [subField.key]: '' });
                                                }}
                                                keyboardType={subField.keyboardType}
                                                maxLength={subField.maxLength}
                                                secureTextEntry={subField.secure || false}
                                            />
                                            {errors[subField.key] && (
                                                <XCircleIcon color="red" size={20} style={styles.errorIcon} />
                                            )}
                                        </View>
                                        {errors[subField.key] && <Text style={styles.errorText}>{errors[subField.key]}</Text>}
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View key={field.key} style={{ width: '85%', marginBottom: 5 }}>
                                <View style={[
                                    styles.inputWrapper,
                                    errors[field.key] && styles.errorInputWrapper
                                ]}>
                                    <View style={styles.iconContainer}>{field.icon}</View>
                                    <TextInput
                                        placeholder={field.placeholder}
                                        placeholderTextColor="#3386BC"
                                        style={styles.input}
                                        value={field.value}
                                        onChangeText={(text) => {
                                            // Padronize para usar onChangeText em todos os campos
                                            if (field.onChangeText) {
                                                field.onChangeText(text);
                                            } else if (field.onChange) {
                                                field.onChange({ target: { value: text } }); // Converte para formato compatível
                                            }
                                            setErrors({ ...errors, [field.key]: '' });
                                        }}
                                        keyboardType={field.keyboardType}
                                        maxLength={field.maxLength}
                                        secureTextEntry={field.secure || false}
                                        editable={field.editable !== false}
                                    />
                                    {errors[field.key] && (
                                        <XCircleIcon color="red" size={20} style={styles.errorIcon} />
                                    )}
                                </View>
                                {errors[field.key] && <Text style={styles.errorText}>{errors[field.key]}</Text>}
                            </View>
                        )
                    ))}

                    <View style={{ top: 30 }}>
                        <Text style={{ textAlign: 'center', color: 'white', fontSize: 11, bottom: 15 }}>Se registrando, você concorda com os nossos</Text>
                        <TouchableOpacity>
                            <Text style={{
                                textAlign: 'center', color: 'white', fontSize: 11, bottom: 15, textDecorationLine: 'underline',
                                textShadowColor: 'rgba(255, 255, 255, 0.5)',
                                textShadowOffset: { width: 1, height: 1 },
                                textShadowRadius: 3,
                            }}>Termos de uso e a Politica de privacidade.</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.textButtonContainer}>
                        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                            <Text style={styles.buttonText}>Inscreva-se</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ top: 30, flexDirection: 'row', justifyContent: "space-between" }}>
                        <Text style={{ textAlign: 'center', color: 'white', fontSize: 14, bottom: 15 }}>Você tem uma conta?</Text>
                        <TouchableOpacity onPress={() => router.replace('./login')}>
                            <Text style={{
                                textAlign: 'center', color: 'white', fontSize: 14, bottom: 15, textDecorationLine: 'underline',
                                textShadowColor: 'rgba(255, 255, 255, 0.5)',
                                textShadowOffset: { width: 0.5, height: 1 },
                                textShadowRadius: 0.5, left: 5, fontWeight: '600'
                            }}>Faça Login.</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>

            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    gradientBackground: {
        flex: 1,
        backgroundColor: '#3386BC'
    },
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight || 0,
        marginTop:'15%'
    },
    header: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 50,
    },
    title: {
        color: '#F8F7FF',
        fontSize: 28,
        fontWeight: '600',
        bottom: 50,
        textShadowColor: 'rgba(255, 255, 255, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        color: '#F8F7FF',
        fontSize: 20,
        fontWeight: '400',
        marginBottom: -50,
        bottom: 50,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '87%',
        marginBottom: 0,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 20,
        paddingLeft: 15,
        borderWidth: 1,
        borderColor: '#DDD',
        height: 46,
        marginBottom: 10
    },
    iconContainer: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#333',
        paddingRight: 15,
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 30,
    },
    textButtonContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
        top: 40
    },
    button: {
        borderRadius: 20,
        backgroundColor: '#3D9CDA',
        height: 40,
        width: 252,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
        shadowColor: '#000000',
        shadowRadius: 5,
        shadowOpacity: 0.50,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
        bottom: 30
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    errorText: {
        color: '#d64a4aff',
        fontSize: 14,
        marginBottom: -10,
        marginTop: 5,
        bottom: 10,
        marginLeft: 10,
        alignSelf: 'flex-start',
        width: '100%'
    },

    errorInputWrapper: {
        borderWidth: 1,
        borderRadius: 20, // Mantém o mesmo border-radius dos inputs
    },
    errorIcon: {
        position: 'absolute',
        right: 15,
    }
});