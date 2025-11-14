import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { AlertCircle, Calendar, Camera, ChevronDown, ChevronLeft, ChevronUp, IdCard, Mail, MapPin, Phone, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import FotoPerfil from '../../../../../assets/mascote.svg';
import { CustomAlert, useCustomAlert } from '../../../../components/CustomAlert';
import { API_BASE_URL, ENDPOINTS } from "../../../../config/api";
import { useUser } from "../../../../context/UserContext";

export default function EditPerfil() {
    const { userId, logout } = useUser();
    const { returnTo } = useLocalSearchParams();
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const { alertConfig, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();
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
    const [uf, setUf] = useState('')
    const [loading, setLoading] = useState(true);
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
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.USER(userId || '')}`, {});
                const data = response.data.user;
                setUserData(data);

                setName(data.name);
                setBirthDate(new Date(data.birthDate).toLocaleDateString());
                setPhone(data.phone || "00000000000");
                setEmail(data.email);
                setCPF(data.cpf || "00000000000");
                setGender(data.gender || "other");
                setEndereco(data.address?.street || "Rua Padrão");
                setNumero(data.address?.number?.toString() || "0");
                setBairro(data.address?.neighborhood || "Centro");
                setCidade(data.address?.city || "São Paulo");
                setCep(data.address?.cep || "00000000");
                setUf(data.address?.uf || "SP");
            } catch (error: any) {
                console.error("Erro ao buscar usuário:", error.response || error.message);
            } finally {
                setLoading(false);
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
                uf: uf,
                phone,
                email,
                gender,
            };

            const response = await axios.patch(
                `${API_BASE_URL}${ENDPOINTS.USER(userId)}`,
                payload
            );

            console.log('Perfil atualizado:', response.data);
            showSuccess('Sucesso', 'Perfil atualizado com sucesso!');
        } catch (error: any) {
            console.error('Erro ao atualizar perfil:', error.response || error.message);
            showError('Erro ao atualizar perfil', 'Tente novamente');
        }
    };

    const deleteProfile = async (userId: string) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}${ENDPOINTS.DELETE_USER(userId)}`);
            showSuccess('Conta excluída', 'Sua conta foi excluída com sucesso');

            // Limpar o userId do contexto
            await logout();

            // Redirecionar após 2 segundos
            setTimeout(() => {
                router.replace('/auth/login');
            }, 2000);
        } catch (error: any) {
            console.error('Erro ao excluir conta:', error.response || error.message);
            showError('Erro ao excluir', 'Tente novamente');
        }
    }

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
                const dir = `${FileSystem.documentDirectory}profile/`;
                const fileUri = `${dir}user_photo.jpg`;

                const dirInfo = await FileSystem.getInfoAsync(dir);
                if (!dirInfo.exists) {
                    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
                }

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

    const buscarEnderecoPorCEP = async (cep: string) => {
        const cepLimpo = cep.replace(/\D/g, '');

        if (cepLimpo.length !== 8) {
            return;
        }

        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);

            if (response.data.erro) {
                alert('CEP não encontrado');
                return;
            }

            setEndereco(response.data.logradouro);
            setBairro(response.data.bairro);
            setCidade(response.data.localidade);
            setUf(response.data.uf);

        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            alert('Erro ao buscar CEP. Tente novamente.');
        }
    };

    // Função para verificar se o perfil está incompleto
    const verificarPerfilIncompleto = () => {
        if (loading) return false;

        // Verifica CPF (padrão: "00000000000")
        if (!cpf || cpf.trim() === "" || cpf === "00000000000") return true;

        // Verifica Phone (padrão: "00000000000")
        if (!phone || phone.trim() === "" || phone === "00000000000") return true;

        // Verifica Gender (padrão: "other")
        if (!gender || gender.trim() === "" || gender === "other") return true;

        // Verifica Endereço (padrão: "Rua Padrão")
        if (!endereco || endereco.trim() === "" || endereco === "Rua Padrão") return true;

        // Verifica Bairro (padrão: "Centro")
        if (!bairro || bairro.trim() === "" || bairro === "Centro") return true;

        // Verifica Número (padrão: 0 ou "0")
        if (!numero || numero === 0 || numero === "0" || numero.toString().trim() === "") return true;

        // Verifica CEP (padrão: "00000000")
        if (!cep || cep.trim() === "" || cep === "00000000") return true;

        // Verifica Cidade (padrão: "São Paulo")
        if (!cidade || cidade.trim() === "" || cidade === "São Paulo") return true;

        // Verifica UF (padrão: "SP")
        if (!uf || uf.trim() === "" || uf === "SP") return true;

        return false;
    };
    const perfilIncompleto = verificarPerfilIncompleto();

    // Função para verificar se um campo específico está incompleto
    const isCampoIncompleto = (valor, valorPadrao) => {
        if (loading) return false;

        return !valor ||
            valor.trim() === "" ||
            valor === valorPadrao ||
            (valorPadrao === "0" && (valor === "0" || valor === 0));
    };

    const handleGoBack = () => {
        if (returnTo) {
            router.replace(returnTo as any);
        } else {
            router.replace('/pages/Home');
        }
    };

    const handleConfirmDelete = async () => {
        if (userId) {
            await deleteProfile(userId);
            setShowConfirmDeleteModal(false);
        }
    };

    return (
        <LinearGradient
            colors={['#f0f9ff', '#e0f2fe', '#bae6fd']}
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
                    <TouchableOpacity onPress={handleGoBack} style={styles.botaoVoltar}>
                        <ChevronLeft color="#0f172a" size={24} strokeWidth={2.5} />
                    </TouchableOpacity>
                    {/* Header Perfil */}
                    <View style={styles.headerContainer}>
                        <View style={styles.avatarContainer}>
                            {userPhoto ? (
                                <Image source={{ uri: userPhoto }} style={styles.foto} />
                            ) : (
                                <View style={styles.foto}>
                                    <FotoPerfil width={94} height={94} />
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.editFotoButton}
                                onPress={handleChangePhoto}
                            >
                                <Camera size={16} color="#fff" />
                            </TouchableOpacity>

                            {/* ÍCONE DE ALERTA */}
                            {perfilIncompleto && (
                                <View style={styles.alertBadge}>
                                    <AlertCircle size={20} color="#fff" />
                                </View>
                            )}
                        </View>

                        <Text style={styles.nome}>{name}</Text>

                        {/* MENSAGEM DE ALERTA */}
                        {perfilIncompleto && (
                            <View style={styles.warningContainer}>
                                <AlertCircle size={16} color="#f59e0b" />
                                <Text style={styles.warningText}>
                                    Complete seu perfil para aproveitar todos os recursos
                                </Text>
                            </View>
                        )}

                        <View style={styles.locationContainer}>
                            <MapPin size={16} color={"#0284c7"} />
                            <Text style={styles.locationText}>Birigui - São Paulo</Text>
                        </View>
                    </View>

                    {/* Formulário */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputWrapper}>
                            <User color="#0284c7" size={20} style={styles.icon} />
                            <TextInput
                                placeholder="Nome Completo"
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputWrapper, { flex: 1 }]}>
                                <Calendar color="#0284c7" size={20} style={styles.icon} />
                                <TextInput
                                    placeholder="Data de nascimento"
                                    style={styles.input}
                                    value={birthDate}
                                    onChangeText={setBirthDate}
                                />
                            </View>
                            <View style={[
                                styles.inputWrapper,
                                { flex: 1 },
                                isCampoIncompleto(phone, "00000000000") && styles.inputIncompleto
                            ]}>
                                <Phone color="#0284c7" size={20} style={styles.icon} />
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
                            <Mail color="#0284c7" size={20} style={styles.icon} />
                            <TextInput
                                placeholder="Endereço de e-mail"
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={[
                            styles.inputWrapper,
                            isCampoIncompleto(cpf, "00000000000") && styles.inputIncompleto
                        ]}>
                            <IdCard color="#0284c7" size={20} style={styles.icon} />
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
                            style={[
                                styles.dropdown,
                                isCampoIncompleto(gender, "other") && styles.dropdownIncompleto
                            ]}
                            dropDownContainerStyle={styles.dropdownContainer}
                            textStyle={{ color: "#333" }}
                            ArrowDownIconComponent={() => <ChevronDown color="#0284c7" size={20} />}
                            ArrowUpIconComponent={() => <ChevronUp color="#0284c7" size={20} />}
                            zIndex={3000}
                            zIndexInverse={1000}
                        />

                        <View style={[
                            styles.inputWrapper,
                            isCampoIncompleto(endereco, "Rua Padrão") && styles.inputIncompleto
                        ]}>
                            <MapPin color="#0284c7" size={20} style={styles.icon} />
                            <TextInput
                                placeholder="Endereço"
                                style={styles.input}
                                value={endereco}
                                onChangeText={setEndereco}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[
                                styles.inputWrapper,
                                { flex: 2 },
                                isCampoIncompleto(bairro, "Centro") && styles.inputIncompleto
                            ]}>
                                <TextInput
                                    placeholder="Bairro"
                                    style={styles.input}
                                    value={bairro}
                                    onChangeText={setBairro}
                                />
                            </View>
                            <View style={[
                                styles.inputWrapper,
                                { flex: 1 },
                                isCampoIncompleto(numero, "0") && styles.inputIncompleto
                            ]}>
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
                            <View style={[
                                styles.inputWrapper,
                                { flex: 1 },
                                isCampoIncompleto(cep, "00000000") && styles.inputIncompleto
                            ]}>
                                <TextInput
                                    placeholder="CEP"
                                    style={styles.input}
                                    value={cep}
                                    onChangeText={(text) => {
                                        setCep(text);
                                        if (text.replace(/\D/g, '').length === 8) {
                                            buscarEnderecoPorCEP(text);
                                        }
                                    }}
                                    keyboardType="numeric"
                                    maxLength={9}
                                />
                            </View>
                            <View style={[
                                styles.inputWrapper,
                                { flex: 1 },
                                isCampoIncompleto(cidade, "São Paulo") && styles.inputIncompleto
                            ]}>
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
                            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => setShowConfirmDeleteModal(true)}>
                                <Text style={[styles.buttonText, styles.deleteButtonText]}>Deletar conta</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Modal animationType="fade" transparent visible={showConfirmDeleteModal} onRequestClose={() => setShowConfirmDeleteModal(false)}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
                                <Text style={styles.modalBodyText}>
                                    Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.
                                </Text>
                                <View style={styles.modalButtonRow}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, { backgroundColor: "#6c757d", width: '100%' }]}
                                        onPress={() => setShowConfirmDeleteModal(false)}
                                    >
                                        <Text style={styles.modalButtonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, { backgroundColor: "#dc3545", width: '100%' }]}
                                        onPress={handleConfirmDelete}
                                    >
                                        <Text style={styles.modalButtonText}>Excluir</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    <CustomAlert
                        visible={alertConfig.visible}
                        type={alertConfig.type}
                        title={alertConfig.title}
                        message={alertConfig.message}
                        onClose={hideAlert}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        marginTop: '10%'
    },
    botaoVoltar: {
        width: 40,
  
        height: 40,
        borderRadius: 12,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#0284c7",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
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
        borderColor: "#0284c7",
    },
    editFotoButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#0284c7",
        borderRadius: 20,
        padding: 8,
        borderWidth: 2,
        borderColor: "#eff6ff",
    },
    alertBadge: {
        position: "absolute",
        top: -5,
        left: -5,
        backgroundColor: "#f59e0b",
        borderRadius: 20,
        padding: 6,
        borderWidth: 2,
        borderColor: "#eff6ff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    nome: {
        fontSize: 22,
        color: "#111827",
        fontWeight: "700",
        marginTop: 12,
        marginBottom: 4,
        textAlign: 'center'
    },
    warningContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fef3c7",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 8,
        gap: 6,
        maxWidth: '90%',
    },
    warningText: {
        fontSize: 13,
        color: "#92400e",
        fontWeight: "500",
        flex: 1,
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginTop: 8,
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
    modalBodyText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#333'
    },
    modalButtonRow: {
        gap: 10,
        width: '80%',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalButton: {
        padding: 12,
        borderRadius: 20,
        width: '80%',
        alignItems: 'center',
        backgroundColor: '#0284c7',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        elevation: 5,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalButtonCancel: {
        backgroundColor: '#fc445a',
        marginTop: 10,
        padding: 12,
        borderRadius: 20,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        elevation: 5,
    },
    modalButtonTextCancel: {
        color: 'white',
        fontWeight: 'bold',
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
        backgroundColor: "#0284c7",
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
    inputIncompleto: {
        borderColor: '#f59e0b',
        borderWidth: 1,
    },
    dropdownIncompleto: {
        borderColor: '#f59e0b',
        borderWidth: 1,
    },
});