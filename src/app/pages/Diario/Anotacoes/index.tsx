import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import { Alert, ImageBackground, Keyboard, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

export default function Anotacoes() {

    const [anotacao, setAnotacao] = useState('')
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio',
        'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    const today = new Date();
    const mes = meses[today.getMonth()];
    const diaSemana = dias[today.getDay()]

    const handleSalvar = async () => {

        const anotacaoSalva = anotacao || ''
        const anotacaoString = anotacaoSalva.toString()
        const today = new Date().toDateString();
        
        if (anotacaoString) {
            AsyncStorage.setItem('AnotacaoDiario', anotacaoString)
            AsyncStorage.setItem('dataAnotacao', today)
            setAnotacao('')
        } else {
            Alert.alert('Digite alguma informação para salvar.')
        }
        const teste = await AsyncStorage.getItem('AnotacaoDiario')
        console.log(teste)
    }

    return (
        <ImageBackground
            source={require('../../../../../assets/images/gradiente.png')}
            style={{ flex: 1 }}
            blurRadius={20}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1 }}>
                    <View style={styles.Seta}>
                        <TouchableOpacity onPress={() => router.replace("/pages/Diario")} style={styles.botaoVoltar}>
                            <ChevronLeft color="black" />
                        </TouchableOpacity>
                        <Text style={{ color: 'black', fontSize: 18, fontWeight: 700, fontFamily: 'Nunito' }}>Voltar</Text>
                    </View>
                    <View style={{
                        alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{ fontSize: 24, fontFamily: 'Nunito', fontWeight: 700, color: 'black' }}>Nova Anotação</Text>
                    </View>
                    <View style={styles.dataContainer}>
                        <Text>{diaSemana}, {today.getDate()} de {mes} de {today.getFullYear()}</Text>
                    </View>

                    <View style={styles.boxWrapper}>
                        <ScrollView style={styles.box}>
                            <TextInput
                                placeholder="Digite aqui"
                                placeholderTextColor={'#3a3a3aff'}
                                style={styles.input}
                                multiline={true}
                                onChangeText={(text) => setAnotacao(text)}
                                value={anotacao}
                            />
                        </ScrollView>
                    </View>

                    <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 12 }}>

                        <TouchableOpacity
                            onPress={handleSalvar}

                            style={{
                                backgroundColor: '#2980B9', alignItems: 'center', justifyContent: 'center',
                                borderRadius: 20, width: '40%', padding: 5,
                                marginTop: '5%',
                                marginBottom: '5%',
                                shadowColor: '#000000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 8,
                                elevation: 5,
                            }}>
                            <Text style={{ textAlign: 'center', textAlignVertical: 'center', color: '#ffffff', fontFamily: 'Nunito', fontWeight: 700, fontSize: 18 }}>Anotar</Text>
                        </TouchableOpacity>

                    </View>
                </View>

            </TouchableWithoutFeedback>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    dataContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '3%',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: '#e9e1e1ff',
        width: '88%',
        padding: 10,
        alignSelf: 'center',
        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 5,
    },
    boxWrapper: {
        flex: 1,
        marginTop: '5%',
        marginHorizontal: '6%',
        borderRadius: 20,
        backgroundColor: '#e9e1e1ff',
        // sombra
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    box: {
        flex: 1,
        paddingLeft:15,
        paddingTop:15,
        borderRadius: 20,
        backgroundColor: 'transparent', // o fundo fica no wrapper
    },
    input: {
        flex: 1,
        fontSize: 16,
        textAlignVertical: 'top',
    },
    Seta: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 5,
        marginTop: StatusBar.currentHeight || '9%',
    },
    botaoVoltar: {
        padding: 10,
        borderRadius: 5,
        left: 10,
    },
})