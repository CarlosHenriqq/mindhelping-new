import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Pencil, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import ProgressBar from '../../../../components/progessBar';



const Metas = () => {
    const [metas, setMetas] = useState([]);
    const [maxValue, setMaxValue] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);
    const [novaMetaText, setNovaMetaText] = useState('');
    const [numeroDias, setNumeroDias] = useState('');

    useEffect(() => {
        const loadMetas = async () => {
            const savedMetas = await AsyncStorage.getItem('@metas');
            if (savedMetas) {
                setMetas(JSON.parse(savedMetas));
            }
        };
        loadMetas();
    }, []);

    useEffect(() => {
        const saveMetas = async () => {
            await AsyncStorage.setItem('@metas', JSON.stringify(metas));
        };
        saveMetas();
    }, [metas]);

    const checkIfClickedToday = async () => {
        const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

        const updatedMetas = await Promise.all(
            metas.map(async (meta) => {
                const lastClickDate = await AsyncStorage.getItem(`@lastClickDate_${meta.id}`);

                if (lastClickDate === today) {
                    return { ...meta, disabled: true }; // Desabilita o botão se já clicou hoje
                }
                return meta;
            })
        );

        setMetas(updatedMetas);
    };

    const handlePress = async (metaId) => {
        const today = new Date().toISOString().split('T')[0];

        const updatedMetas = metas.map((meta) => {
            if (meta.id === metaId) {
                const newDaysCompleted = meta.daysCompleted + 1;
                return { ...meta, daysCompleted: newDaysCompleted, disabled: true };
            }
            return meta;
        });

        setMetas(updatedMetas);

        await AsyncStorage.setItem(`@lastClickDate_${metaId}`, today);
        await AsyncStorage.setItem(`@daysCompleted_${metaId}`, updatedMetas.find(meta => meta.id === metaId).daysCompleted.toString());
    };

    const loadDaysCompleted = async () => {
        const updatedMetas = await Promise.all(
            metas.map(async (meta) => {
                const daysCompleted = await AsyncStorage.getItem(`@daysCompleted_${meta.id}`);
                return { ...meta, daysCompleted: daysCompleted ? parseInt(daysCompleted, 10) : 0 };
            })
        );
        setMetas(updatedMetas);
    };

    useEffect(() => {
        checkIfClickedToday();
        loadDaysCompleted();
    }, []);

    const excluirMeta = (metaId) => {
        const updatedMetas = metas.filter((meta) => meta.id !== metaId);
        setMetas(updatedMetas);
    };


    return (
        <LinearGradient
            colors={['#eff6ff', '#dbeafe']}
            style={styles.background}
        >
            <View style={styles.mainContainer}>

                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.textMetas}>
                        <Text style={styles.text}>Minhas Metas</Text>
                    </View>
                    <View style={styles.cardsMeta}>
                        {metas.length === 0 ? (
                            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: '70%' }}>
                                <Text style={{ color: '#161616ff', fontWeight: 'bold', fontSize: 16 }}>Nenhuma meta registrada</Text>
                            </View>
                        ) : (
                            metas.map((meta) => {
                                const progress = (meta.daysCompleted / meta.totalDias) * 100;

                                return (
                                    <View key={meta.id} style={styles.cardContainer}>
                                        <TouchableOpacity
                                            style={[styles.cards, meta.disabled && styles.disabledCard]}
                                            onPress={() => handlePress(meta.id)}
                                            disabled={meta.disabled}
                                        >
                                            <Text style={styles.textCard}>{meta.text}</Text>
                                            <View style={{ marginTop: '5%', marginBottom: '5%', flexDirection: 'row' }}>
                                                <ProgressBar progress={meta.daysCompleted} total={meta.totalDias} />
                                                <Text style={styles.daysText}>{meta.daysCompleted}/{meta.totalDias}</Text>
                                            </View>
                                            <View style={styles.actionsContainer}>
                                                <TouchableOpacity onPress={() => excluirMeta(meta.id)}>
                                                    <Trash2 color="red" size={24} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => console.log("editar", meta.id)}>
                                                    <Pencil color="black" size={24} />
                                                </TouchableOpacity>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })
                        )}
                    </View>

                </ScrollView>

                <TouchableOpacity
                    style={styles.newMetaContainer}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 35, alignItems: 'center', justifyContent: 'center', position: 'absolute', bottom: '20%', right: '35.5%' }}>+</Text>
                </TouchableOpacity>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Adicionar Nova Meta</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nome da meta"
                                placeholderTextColor={'#00000060'}
                                value={novaMetaText}
                                onChangeText={setNovaMetaText}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Número de dias"
                                placeholderTextColor={'#00000060'}
                                keyboardType="numeric"
                                value={numeroDias.toString()}
                                onChangeText={(text) => setNumeroDias(Number(text))}
                            />
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => {
                                    if (novaMetaText.trim() === '' || numeroDias <= 0) {
                                        alert('Por favor, preencha os campos corretamente.');
                                        return;
                                    }
                                    const novaMeta = {
                                        id: metas.length + 1,
                                        text: novaMetaText,
                                        daysCompleted: 0,
                                        disabled: false,
                                        totalDias: numeroDias,
                                    };
                                    setMetas([...metas, novaMeta]);
                                    setModalVisible(false);
                                    setNovaMetaText('');
                                    setNumeroDias(30);
                                }}
                            >
                                <Text style={styles.modalButtonText}>Adicionar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButtonCancel}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </View>
        </LinearGradient>
    );
};

export default Metas;

const styles = StyleSheet.create({
    background: {
        flex: 1
    },
    mainContainer: {
        flex: 1,
        position: 'relative', // Permitirá o botão flutuar no final da tela
    },
    actionsContainer: {
        position: 'absolute',
        top: 20,
        right: 15,
        flexDirection: 'column',
        gap: 12, // dá espaço entre os botões (RN >= 0.71 suporta)
    },

    container: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 16,
    },
    textMetas: {
        marginTop: '20%',
        fontFamily: 'Nunito'
    },
    text: {
        color: '#161616ff',
        fontWeight: '700',
        fontSize: 22,
        fontFamily: 'Nunito',

    },
    cardsMeta: {
        width: '100%',
        marginTop: 20,
    },
    cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

    },
    cards: {
        backgroundColor: '#ffffff',
        borderColor: 'black',
        width: '95%',
        marginBottom: 16,
        borderRadius: 20,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: 16,
        flexDirection: 'column',
        shadowColor: '#000000',
        shadowRadius: 10,
        shadowOpacity: 0.25,
        shadowOffset: { width: 2, height: 2 },
        elevation: 5,

    },
    disabledCard: {
        opacity: 0.7,
    },
    textCard: {
        fontSize: 16,
        fontWeight: '500',
    },
    chartContainer: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',

    },
    daysText: {
        fontSize: 14,
        fontWeight: '600',

        textAlign: "center",
        position: 'absolute',
        bottom: '15%',
        left: '50%'
    },
    lixeiraContainer: {
        position: 'absolute',
        right: '10%',
    },
    lixeiraIcon: {
        width: 15,
        height: 15,
    },
    newMetaContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#2980B9',
        width: 60,
        height: 60,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        elevation: 5,
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
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 15,
        padding: 10,
        marginBottom: 15,
    },
    modalButton: {
        backgroundColor: '#2980B9',
        padding: 10,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalButtonCancel: {
        backgroundColor: '#fc445a',
        marginTop: 10,
        padding: 10,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonTextCancel: {
        color: 'white',
        fontWeight: 'bold',
    },
});