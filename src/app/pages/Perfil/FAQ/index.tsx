import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronDown, ChevronLeft, ChevronUp } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    LayoutAnimation,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';

// Habilita LayoutAnimation para Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Dados para o FAQ ---
const FAQ_DATA = [
    {
        id: '1',
        question: 'Como meus dados são protegidos?',
        answer: 'Utilizamos criptografia de ponta a ponta para proteger todas as suas informações. Seus dados de humor e anotações são armazenados de forma segura e só podem ser acessados por você.',
    },
    {
        id: '2',
        question: 'Posso exportar meu histórico?',
        answer: 'Sim! Na seção "Gerenciar Conta" (em breve), você poderá solicitar uma cópia de todos os seus dados, incluindo registros de humor e anotações do diário.',
    },
    {
        id: '3',
        question: 'O que acontece se eu esquecer minha senha?',
        answer: 'Você pode redefinir sua senha facilmente através da tela de login. Enviaremos um link seguro para o seu e-mail de cadastro para que você possa criar uma nova senha.',
    },
    {
        id: '4',
        question: 'Como as notificações funcionam?',
        answer: 'As notificações são agendadas localmente no seu dispositivo e não dependem de uma conexão com a internet. Você pode gerenciá-las a qualquer momento na tela de "Notificações".',
    },
];

const FaqItem = ({ item, expanded, setExpanded }) => {
    const isExpanded = expanded === item.id;

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(isExpanded ? null : item.id);
    };

    return (
        <View style={styles.faqItemContainer}>
            <TouchableOpacity onPress={toggleExpand} style={styles.questionContainer}>
                <Text style={styles.questionText}>{item.question}</Text>
                {isExpanded ? <ChevronUp color="#3b82f6" /> : <ChevronDown color="#6b7280" />}
            </TouchableOpacity>
            {isExpanded && (
                <View style={styles.answerContainer}>
                    <Text style={styles.answerText}>{item.answer}</Text>
                </View>
            )}
        </View>
    );
};

export default function FAQ() {
    const [expanded, setExpanded] = useState(null);

    return (
        <LinearGradient
            colors={['#eff6ff', '#dbeafe']}
            style={styles.background}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.replace("/pages/Perfil")} style={styles.backButton}>
                        <ChevronLeft color="#333" size={24} />
                        <Text style={styles.headerTitle}>Perguntas Frequentes</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.faqList}>
                    {FAQ_DATA.map(item => (
                        <FaqItem
                            key={item.id}
                            item={item}
                            expanded={expanded}
                            setExpanded={setExpanded}
                        />
                    ))}
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    scrollContainer: {
        paddingTop: StatusBar.currentHeight || 40,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        marginLeft: 10,
    },
    faqList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    faqItemContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    questionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    questionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginRight: 10,
    },
    answerContainer: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    answerText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#4b5563',
    },
});
