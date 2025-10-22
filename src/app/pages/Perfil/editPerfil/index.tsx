import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, Camera, ChevronDown, ChevronUp, IdCard, Mail, MapPin, Phone, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import FotoPerfil from '../../../../../assets/mascote.svg';
import { API_BASE_URL, ENDPOINTS } from "../../../../config/api";
import { useUser } from "../../../../context/UserContext";

export default function EditPerfil() {
    const { userId } = useUser();
    const [userData, setUserData] = useState(null)
    const [userPhoto, setUserPhoto] = useState(null);
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCPF] = useState('');
    const [cep, setCep] = useState('');
    const [endereco, setEndereco] = useState('');
    const [numero, setNumero] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    // Estado para o Dropdown
    const [open, setOpen] = useState(false);
    const [gender, setGender] = useState('');
    const [genderItem, setGenderItem] = useState([
        { label: "Homem cisgênero", value: "cism" },
        { label: "Mulher cisgênero", value: "cisf" },
        { label: "Homem transgênero", value: "transm" },
        { label: "Mulher transgênero", value: "transf" },
        { label: "Não-binário", value: "nbin" },
        { label: "Travesti", value: "travest" },
        { label: "Prefiro não dizer", value: "naodizer" },
    ]);



    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.USER(userId)}`, {

                });
                const data = response.data.user;
                setUserData(data);

                // popular os states do formulário
                setName(data.name);
                setBirthDate(new Date(data.birthDate).toLocaleDateString());
                setPhone(data.phone);
                setEmail(data.email);
                setCPF(data.cpf);
                setGender(data.gender);
                setEndereco(data.address?.street || "");
                setNumero(data.address?.number?.toString() || "");
                setBairro(data.address?.neighborhood || "");
                setCidade(data.address?.city || "");
                setCep(data.address?.cep || "");
            } catch (error) {
                console.error("Erro ao buscar usuário:", error.response || error.message);
            }
        };

        fetchUser();
    }, []);
    useEffect(() => {
        const loadLocalPhoto = async () => {
            try {
                const fileUri = `${FileSystem.documentDirectory}profile/user_photo.jpg`;
                const fileInfo = await FileSystem.getInfoAsync(fileUri);

                if (fileInfo.exists) {
                    setUserPhoto(fileUri);
                } else {
                    console.log("Foto local não encontrada");
                }
            } catch (err) {
                console.error("Erro ao carregar imagem local:", err);
            }
        };

        loadLocalPhoto();
    }, []);

    const handleSaveProfile = async () => {
        try {
            const payload = {
                name,
                cpf,
                address: endereco,
                neighborhood: bairro,
                number: parseInt(numero) || 0,
                complement: '',
                cep,
                city: cidade,
                uf: 'SP',
                phone,
                email,
                gender,
            };

            const response = await axios.patch(
                `${API_BASE_URL}${ENDPOINTS.USER(userId)}`,
                payload
            );

            console.log('Perfil atualizado:', response.data);
            alert('Perfil atualizado com sucesso!');
        } catch (error: any) {
            console.error('Erro ao atualizar perfil:', error.response || error.message);
            alert('Erro ao atualizar perfil. Tente novamente.');
        }
    };
    const handleChangePhoto = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            alert("Permissão para acessar a galeria é necessária!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            const sourceUri = result.assets[0].uri;

            try {
                // cria uma pasta específica no armazenamento interno
                const dir = `${FileSystem.documentDirectory}profile/`;
                const fileUri = `${dir}user_photo.jpg`; // sempre o mesmo nome

                // garante que a pasta exista
                const dirInfo = await FileSystem.getInfoAsync(dir);
                if (!dirInfo.exists) {
                    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
                }

                // copia ou sobrescreve a imagem escolhida
                await FileSystem.copyAsync({
                    from: sourceUri,
                    to: fileUri,
                });

                setUserPhoto(fileUri);
                alert("Foto de perfil atualizada!");
            } catch (err) {
                console.error("Erro ao salvar a imagem localmente:", err);
                alert("Erro ao salvar imagem.");
            }
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
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header Perfil */}
                    <View style={styles.headerContainer}>
                        <View style={styles.avatarContainer}>
                            {userPhoto ? (
                                <Image source={{ uri: userPhoto }} style={styles.foto} />
                            ) : (
                                <View style={styles.foto}>
                                    <FotoPerfil width={94} height={94} /> {/* 100 - 3px de borda de cada lado */}
                                </View>
                            )}


                            <TouchableOpacity
                                style={styles.editFotoButton}
                                onPress={handleChangePhoto}
                            >
                                <Camera size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.nome}>{name}</Text>
                        <View style={styles.locationContainer}>
                            <MapPin size={16} color={"#4b5563"} />
                            <Text style={styles.locationText}>Birigui - São Paulo</Text>
                        </View>
                    </View>

                    {/* Formulário */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputWrapper}>
                            <User color="#3386BC" size={20} style={styles.icon} />
                            <TextInput
                                placeholder="Nome Completo"
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputWrapper, { flex: 1 }]}>
                                <Calendar color="#3386BC" size={20} style={styles.icon} />
                                <TextInput
                                    placeholder="Data de nascimento"
                                    style={styles.input}
                                    value={birthDate}
                                    onChangeText={setBirthDate}
                                />
                            </View>
                            <View style={[styles.inputWrapper, { flex: 1 }]}>
                                <Phone color="#3386BC" size={20} style={styles.icon} />
                                <TextInput
                                    placeholder="Telefone"
                                    style={styles.input}
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Mail color="#3386BC" size={20} style={styles.icon} />
                            <TextInput
                                placeholder="Endereço de e-mail"
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <IdCard color="#3386BC" size={20} style={styles.icon} />
                            <TextInput
                                placeholder="CPF"
                                style={styles.input}
                                value={cpf}
                                onChangeText={setCPF}
                                keyboardType="numeric"
                            />
                        </View>

                        <DropDownPicker
                            open={open}
                            value={gender}
                            items={genderItem}
                            setOpen={setOpen}
                            setValue={setGender}
                            setItems={setGenderItem}
                            listMode="SCROLLVIEW"
                            placeholder="Identidade de gênero"
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownContainer}
                            textStyle={{ color: "#333" }}
                            ArrowDownIconComponent={() => <ChevronDown color="#3386BC" size={20} />}
                            ArrowUpIconComponent={() => <ChevronUp color="#3386BC" size={20} />}
                            zIndex={3000}
                            zIndexInverse={1000}
                        />

                        <View style={styles.inputWrapper}>
                            <MapPin color="#3386BC" size={20} style={styles.icon} />
                            <TextInput
                                placeholder="Endereço"
                                style={styles.input}
                                value={endereco}
                                onChangeText={setEndereco}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputWrapper, { flex: 2 }]}>
                                <TextInput
                                    placeholder="Bairro"
                                    style={styles.input}
                                    value={bairro}
                                    onChangeText={setBairro}
                                />
                            </View>
                            <View style={[styles.inputWrapper, { flex: 1 }]}>
                                <TextInput
                                    placeholder="Nº"
                                    style={styles.input}
                                    value={numero}
                                    onChangeText={setNumero}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputWrapper, { flex: 1 }]}>
                                <TextInput
                                    placeholder="CEP"
                                    style={styles.input}
                                    value={cep}
                                    onChangeText={setCep}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={[styles.inputWrapper, { flex: 1 }]}>
                                <TextInput
                                    placeholder="Cidade"
                                    style={styles.input}
                                    value={cidade}
                                    onChangeText={setCidade}
                                />
                            </View>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSaveProfile}>
                                <Text style={styles.buttonText}>Salvar alterações</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.deleteButton]}>
                                <Text style={[styles.buttonText, styles.deleteButtonText]}>Deletar conta</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1, // <-- 2. CORREÇÃO DE LAYOUT
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        marginTop: '10%'
    },
    headerContainer: {
        alignItems: "center",
        paddingVertical: 20,
    },
    avatarContainer: {
        position: "relative",
    },
    foto: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: "#3b82f6",
    },
    editFotoButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#3386BC",
        borderRadius: 20,
        padding: 8,
        borderWidth: 2,
        borderColor: "#eff6ff",
    },
    nome: {
        fontSize: 22,
        color: "#111827",
        fontWeight: "700",
        marginTop: 12,
        marginBottom: 4,
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    locationText: {
        fontSize: 15,
        color: "#4b5563",
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9fafb",
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        paddingLeft: 10,
    },
    icon: {
        marginRight: 5,
    },
    row: {
        flexDirection: "row",
        gap: 15,
    },
    dropdown: {
        backgroundColor: "#f9fafb",
        borderColor: '#e5e7eb',
        borderRadius: 12,
        marginBottom: 15,
    },
    dropdownContainer: {
        backgroundColor: "#f9fafb",
        borderColor: '#e5e7eb',
        borderRadius: 12,
    },
    buttonContainer: {
        marginTop: 20,
    },
    button: {
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: "center",
        marginBottom: 10,
    },
    saveButton: {
        backgroundColor: "#3386BC",
    },
    deleteButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    deleteButtonText: {
        color: "#ef4444",
    },
});
