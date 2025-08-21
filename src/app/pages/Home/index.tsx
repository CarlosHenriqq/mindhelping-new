import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import Carousel from 'react-native-reanimated-carousel';

const width = Dimensions.get('window').width;

export default function Home() {

    const [feelings] = useState([
        { text: "FELIZ", image: require('../../../../assets/images/slide/feliz.png') },
        { text: "TRISTE", image: require('../../../../assets/images/slide/triste.png') },
        { text: "RAIVA", image: require('../../../../assets/images/slide/raiva.png') },
        { text: "ANSIOSO", image: require('../../../../assets/images/slide/ansioso.png') },
        { text: "TEDIO", image: require('../../../../assets/images/slide/tedio.png') },
        { text: "NEUTRO", image: require('../../../../assets/images/slide/indeciso.png') },
    ]);

    const [modalSelected, setModalSelect] = useState(false);
    const [inputText, setInputText] = useState('');
    const [selectedFeeling, setSelectedFeeling] = useState();
    const [selectedFeelingIndex, setSelectedFeelingIndex] = useState(true);
    const navigation = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            const loadFeeling = async () => {
                const storedFeeling = await AsyncStorage.getItem('@selectedFeeling');
                setSelectedFeeling(storedFeeling || null);


            };


            loadFeeling();

            ;
        }, [])
    );

    const registerFeelingWithTime = async (feeling) => {
        const currentTime = new Date().toISOString().split('T')[1].substring(0, 5); // Formato HH:MM
        const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

        try {
            const storedFeelings = await AsyncStorage.getItem('@dailyFeelings');
            const dailyFeelings = storedFeelings ? JSON.parse(storedFeelings) : {};

            if (!Array.isArray(dailyFeelings[today])) {
                dailyFeelings[today] = [];
            }

            dailyFeelings[today].push({ feeling, time: currentTime });

            await AsyncStorage.setItem('@dailyFeelings', JSON.stringify(dailyFeelings));
            console.log(`Sentimento registrado às ${currentTime}: ${feeling}`);
        } catch (e) {
            console.log("Erro ao registrar o sentimento: ", e);
        }
    };
   
    const salvarTexto = async () => {
        if (inputText.trim()) {
            const today = new Date().toISOString().split('T')[0];
            try {
                const storedFeelings = await AsyncStorage.getItem('@dailyFeelings');
                const dailyFeelings = storedFeelings ? JSON.parse(storedFeelings) : {};

                const todaysEntries = dailyFeelings[today];

                // Adiciona a nota ao último sentimento registrado hoje
                if (Array.isArray(todaysEntries) && todaysEntries.length > 0) {
                    const lastEntryIndex = todaysEntries.length - 1;
                    todaysEntries[lastEntryIndex].note = inputText; // Adiciona a propriedade 'note'

                    // Salva o objeto inteiro de volta no AsyncStorage
                    await AsyncStorage.setItem('@dailyFeelings', JSON.stringify(dailyFeelings));
                    console.log(`Nota adicionada: "${inputText}"`);
                    
                }

                // Limpa e fecha o modal
                setInputText('');
                setModalSelect(false);

            } catch (e) {
                console.log("Erro ao salvar a nota do sentimento: ", e);
            }
        } else {
            // Se o usuário não digitar nada, apenas feche o modal
            setModalSelect(false);
        }
    };




    return (
        <ScrollView style={styles.screen}>
            
            <View style={styles.feeling}>
                <View style={styles.containerUser}>
                    <View style={styles.textContainer}>
                        <Text style={styles.userText}>Oi Carlos,</Text>
                        <Text style={styles.textFeeling}>Como você está se sentindo?</Text>
                    </View>
                    <TouchableOpacity onPress={() => {
                        navigation.navigate('Perfil')
                    }}>

                    </TouchableOpacity>
                </View>
            </View>


            <Carousel
                loop
                autoPlay
                autoPlayInterval={3000}
                width={width}
                height={200}
                data={feelings}
                scrollAnimationDuration={800}
                onSnapToItem={(index) => setSelectedFeelingIndex(index)}
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        <TouchableOpacity onPress={() => {
                            registerFeelingWithTime(item.text);
                            
                            setModalSelect(true);
                        }}>
                            <Image source={item.image} style={styles.img} />
                        </TouchableOpacity>
                    </View>
                )}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalSelected}
                onRequestClose={() => setModalSelect(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Porquê você está se sentindo assim?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite aqui"
                            value={inputText}
                            onChangeText={setInputText}
                        />
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={salvarTexto}
                        >
                            <Text style={styles.modalButtonText}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <View style={styles.nextConsulta}>
                <Text style={styles.textConsulta}>Sua próxima consulta: </Text>
                <View style={styles.cardConsulta}>
                    <Text style={styles.nameProf}>Dra. Alessandra</Text>
                    <Text>Psicóloga</Text>
                    <View style={styles.dadosPsi}>
                        <TouchableOpacity>

                        </TouchableOpacity>
                        <Text style={styles.contatoProf}>alessandra.psi@gmail.com</Text>
                    </View>
                    <View style={styles.telePsi}>
                        <TouchableOpacity>

                        </TouchableOpacity>
                        <Text style={styles.contatoProf}>18 99756-2102</Text>
                    </View>
                    <View style={styles.dadoConsulta}>
                        <Text style={styles.dateConsulta}>Data</Text>
                        <Text style={styles.dateConsulta}>Horário</Text>
                    </View>
                    <View style={styles.dadosConsulta}>
                        <Text>15/10/2024</Text>
                        <Text>16:00h</Text>
                    </View>
                    <View>
                        <Text style={styles.dateConsulta}>Endereço</Text>
                    </View>
                    <View>
                        <Text style={styles.dadosLocConsulta}>Lorem ipsum dolor sit quaerat minus, Birigui - SP </Text>
                        <View style={styles.maps}>
                            <TouchableOpacity>

                            </TouchableOpacity>
                            <Text style={{ fontWeight: 'normal' }}>Abrir através do Google Maps</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.containerRelax}>
                <Text style={styles.textRelax}>Que tal relaxar?</Text>
                <View style={styles.grid}>
                    <TouchableOpacity style={styles.card}>
                        <Text style={styles.cardText}>Que tal tentarmos meditar?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.card}>
                        <Text style={styles.cardText}>Ou conversar com a nossa comunidade?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.card}>
                        <Text style={styles.cardText}>Talvez um som relaxante</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.card}>
                        <Text style={styles.cardText}>Por quê não praticar um esporte?</Text>
                    </TouchableOpacity>
                </View>

            </View>

        </ScrollView>
    );
};


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#ffffff',

    },
    feeling: {
        marginVertical: 20,
        marginTop: 30,
        paddingHorizontal: 20,
    },
    containerUser: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        top: '50%'// Garante que o texto ocupe o espaço restante
    },
    userText: {
        fontSize: 18,
        fontFamily: 'Roboto-Regular',
        top: 5
    },
    textFeeling: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    page: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imgUser: {
        width: 50,
        height: 50,
        borderRadius: 20,
        marginLeft: 10,
    },
    img: {
        maxWidth: '95%',
        height: '95%',
        alignSelf: 'center',
        borderRadius: 20,
    },

    slide: {

        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',

    },
    nextConsulta: {
        top: 20,
    },
    textConsulta: {
        fontSize: 16,
        marginBottom: -5,
        fontFamily: 'Mukta-Bold', // Fonte personalizada
        textAlign: 'left',
        paddingLeft: 22,
    },
    cardConsulta: {
        backgroundColor: '#ffffff',
        padding: 20,
        margin: 20,
        borderRadius: 20,
        shadowColor: '#000000',
        shadowRadius: 10,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
    },
    nameProf: {
        fontSize: 18,
        fontWeight: 'bold',

    },
    contatoProf: {
        fontWeight: 'bold',
    },
    emailImg: {
        width: 20,
        height: 20,
    },
    dadosPsi: {
        flexDirection: 'row',
        gap: 0,
        marginTop: 5
    },
    telePsi: {
        flexDirection: 'row',
        gap: 0,
        marginBottom: 5
    },
    dadoConsulta: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: '50%',
    },
    dateConsulta: {
        fontWeight: 'bold',
        fontSize: 16,
        gap:'50%'
    },
    dadosConsulta: {
        flexDirection: 'row',
        gap: '41.5%',
        marginBottom: 10,
    },
    dadosLocConsulta: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    maps: {
        flexDirection: 'row',
    },
    mapsImg: {
        width: 20,
        height: 20,
    },
    containerRelax: {
        margin: 15,
    },
    textRelax: {
        fontSize: 16,
        marginBottom: 5,
        fontFamily: 'Mukta-Bold', // Fonte personalizada
        textAlign: 'left',
        paddingLeft: 10,

    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around', // Para espaçar os cards
    },
    card: {
        backgroundColor: '#3386BC',
        width: '45%', // Cada card vai ocupar 45% da largura
        padding: 15,
        borderRadius: 20,
        marginVertical: 10,
    },
    cardText: {
        color: 'white',
        alignItems: 'center',
        fontWeight: 'bold',
        textAlign: 'center',
        justifyContent: 'center',
        paddingTop: 10,
        paddingBottom: 10
    },
    relaxImg: {
        width: '80%',
        height: undefined,
        aspectRatio: 1,
        left: 10,
        resizeMode: 'contain'
    },
    continueButton: {
        backgroundColor: '#A7BED3',
        padding: 15,
        borderRadius: 20,
        marginHorizontal: 20,
        marginTop: 20,
        alignItems: 'center',
        borderWidth: 1
    },
    continueText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo escurecido
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius:20,
        marginBottom: 15,
    },
    modalButton: {
        backgroundColor: '#2980B9',
        padding: 10,
        borderRadius: 20,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

