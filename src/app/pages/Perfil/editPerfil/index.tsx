import { Calendar, Camera, ChevronDown, ChevronUp, IdCard, Mail, MapPin, Phone, User } from "lucide-react-native";
import { useState } from "react";
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

export default function EditPerfil() {
    const [errors, setErrors] = useState({});
    const [name, setName] = useState("Juliana Alves da Silva");
    const [birthDate, setBirthDate] = useState("01/01/2000");
    const [phone, setPhone] = useState("(18) 99999-9999");
    const [email, setEmail] = useState("julianaalves@gmail.com");
    const [cpf, setCPF] = useState("000.000.000-00");
    const [password, setPassword] = useState("");
    const [cep, setCep] = useState("16000-201");
    const [endereco, setEndereco] = useState("Rua das palmeiras");
    const [numero, setNumero] = useState("2011");
    const [bairro, setBairro] = useState("Centro");
    const [cidade, setCidade] = useState("Birigui");

    const [open, setOpen] = useState(false);
    const [gender, setGender] = useState("cisf");
    const [genderItem, setGenderItem] = useState([
        { label: "Homem cisgênero", value: "cism" },
        { label: "Mulher cisgênero", value: "cisf" },
        { label: "Homem transgênero", value: "transm" },
        { label: "Mulher transgênero", value: "transf" },
        { label: "Não-binário", value: "nbin" },
        { label: "Travesti", value: "travest" },
        { label: "Prefiro não dizer", value: "naodizer" },
    ]);

    return (
        <ImageBackground
            source={require("../../../../../assets/images/gradiente.png")}
            style={{ flex: 1 }}
            blurRadius={20}
        >
            {/* Header Perfil */}
            <View style={styles.container}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: "https://i.pravatar.cc/150?img=38" }}
                        style={styles.foto}
                    />
                    <TouchableOpacity
                        style={styles.editFoto}
                        onPress={() => console.log("Trocar foto")}
                    >
                        <Camera size={18} color="#fff" />
                        {/* Pode trocar o User por <Camera /> ou <Pencil /> */}
                    </TouchableOpacity>
                </View>

                <Text style={styles.nome}>Juliana Alves</Text>
                <View style={styles.locationContainer}>
                    <MapPin size={18} color={"black"} />
                    <Text style={styles.locationText}>Birigui - São Paulo</Text>
                </View>
            </View>


            <ScrollView
                contentContainerStyle={styles.scrollContent}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
            >
                {/* Nome */}
                <View style={styles.inputWrapper}>
                    <User color="#3386BC" size={20} style={styles.icon} />
                    <TextInput
                        placeholder="Nome"
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                {/* Data e Telefone lado a lado */}
                <View style={styles.row}>
                    <View style={[styles.inputWrapper, styles.half]}>
                        <Calendar color="#3386BC" size={20} style={styles.icon} />
                        <TextInput
                            placeholder="Data de nascimento"
                            style={styles.input}
                            value={birthDate}
                            onChangeText={setBirthDate}
                        />
                    </View>
                    <View style={[styles.inputWrapper, styles.half]}>
                        <Phone color="#3386BC" size={20} style={styles.icon} />
                        <TextInput
                            placeholder="Telefone"
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>
                </View>

                {/* Email */}
                <View style={styles.inputWrapper}>
                    <Mail color="#3386BC" size={20} style={styles.icon} />
                    <TextInput
                        placeholder="Endereço de e-mail"
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                {/* CPF */}
                <View style={styles.inputWrapper}>
                    <IdCard color="#3386BC" size={20} style={styles.icon} />
                    <TextInput
                        placeholder="CPF"
                        style={styles.input}
                        value={cpf}
                        onChangeText={setCPF}
                    />
                </View>

                {/* Identidade de gênero */}
                <DropDownPicker
                    open={open}
                    value={gender}
                    listMode="SCROLLVIEW"
                    placeholder="Identidade de gênero"
                    items={genderItem}
                    setOpen={setOpen}
                    setValue={setGender}
                    setItems={setGenderItem}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    textStyle={{ color: "#000000" }}
                    listItemLabelStyle={{ color: "#000000" }}
                    ArrowDownIconComponent={() => <ChevronDown color="#3386BC" size={20} />}
                    ArrowUpIconComponent={() => <ChevronUp color="#3386BC" size={20} />}
                />

                {/* Endereço */}
                <View style={styles.inputWrapper}>
                    <TextInput
                        placeholder="Endereço"
                        style={styles.input}
                        value={endereco}
                        onChangeText={setEndereco}
                    />
                </View>

                {/* Bairro e Número lado a lado */}
                <View style={styles.row}>
                    <View style={[styles.inputWrapper, styles.half]}>
                        <TextInput
                            placeholder="Bairro"
                            style={styles.input}
                            value={bairro}
                            onChangeText={setBairro}
                        />
                    </View>
                    <View style={[styles.inputWrapper, styles.half]}>
                        <TextInput
                            placeholder="Nº"
                            style={styles.input}
                            value={numero}
                            onChangeText={setNumero}
                        />
                    </View>
                </View>

                {/* CEP e Cidade lado a lado */}
                <View style={styles.row}>
                    <View style={[styles.inputWrapper, styles.half]}>
                        <TextInput
                            placeholder="CEP"
                            style={styles.input}
                            value={cep}
                            onChangeText={setCep}
                        />
                    </View>
                    <View style={[styles.inputWrapper, styles.half]}>
                        <TextInput
                            placeholder="Cidade"
                            style={styles.input}
                            value={cidade}
                            onChangeText={setCidade}
                        />
                    </View>
                </View>

                {/* Botões */}
                <View style={styles.buttonRow}>
                     <TouchableOpacity style={[styles.button, styles.save]}>
                        <Text style={styles.buttonText}>Salvar alterações</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.delete]}>
                        <Text style={styles.buttonText}>Deletar conta</Text>
                    </TouchableOpacity>
                   
                </View>
            </ScrollView>
            <View style={{height:10}}/>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: "15%",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        margin: "5%",
        backgroundColor: "#ededed",
        borderRadius: 20,
    },
    foto: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderColor: "white",
        borderWidth: 2,
        marginTop: "10%",
        marginBottom: 12,
    },
    avatarContainer: {
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },
    editFoto: {
        position: "absolute",
        bottom: 10,
        right: 0,
        backgroundColor: "#3386BC",
        borderRadius: 20,
        padding: 6,
        borderWidth: 2,
        borderColor: "#fff", // pra dar aquele contorno bonito
    },

    nome: {
        fontSize: 22,
        color: "black",
        fontWeight: "700",
        marginBottom: 6,
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginBottom: "5%",
    },
    locationText: {
        fontSize: 16,
        color: "black",
        fontWeight: "700",
    },
    scrollContent: {
        alignItems: "center",
        padding: 20,
backgroundColor:'#ffffff',
margin:'5%',


        alignSelf: 'center',
        borderRadius: 20
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "transparent",
        borderRadius: 20,
        paddingHorizontal: 10,
        height: 50,
        marginBottom: "5%",
        backgroundColor: "#ededed",
        shadowColor: '#000000',
        shadowRadius: 4,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
        
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#333",
    },
    icon: {
        marginRight: 8,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
       gap:15,
    },
    half: {
        width: "48%",
        
    },
    dropdown: {
        borderRadius: 20,
        borderColor: "#DDD",
        backgroundColor: "#ededed",
        shadowColor: '#000000',
        shadowRadius: 4,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
        marginBottom: "5%",
    },
    dropdownContainer: {
        borderColor: "#DDD",
        borderRadius: 20,
        width: '90%',
        alignSelf: 'center',
    },
    buttonRow: {
        justifyContent: "space-between",
        width: "90%",
        marginTop: '5%',
       
    },
    button: {
         marginBottom:'5%',
         
        padding: 15,
        borderRadius: 20,
        alignItems: "center",
        marginHorizontal: 5,
    },
    delete: {
        backgroundColor: "#d64a4a",
    },
    save: {
        backgroundColor: "#3386BC",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
    },
});
