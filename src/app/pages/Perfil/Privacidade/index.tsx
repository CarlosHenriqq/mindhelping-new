import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft, ShieldCheck, UserX } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function Privacidade() {
    // Estados para os toggles de privacidade
    const [isProfilePrivate, setIsProfilePrivate] = useState(false);
    const [shareData, setShareData] = useState(true);

    return (
        <LinearGradient
            colors={['#eff6ff', '#dbeafe']}
            style={styles.background}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.replace("/pages/Perfil")} style={styles.backButton}>
                        <ChevronLeft color="#333" size={24} />
                        <Text style={styles.headerTitle}>Privacidade e Segurança</Text>
                    </TouchableOpacity>
                </View>

                {/* Seção de Conta */}
                <Text style={styles.sectionTitle}>Conta</Text>
                <View style={styles.settingsCard}>
                    <View style={styles.settingItem}>
                        <ShieldCheck size={22} color={"#4b5563"} />
                        <Text style={styles.settingItemText}>Tornar perfil privado</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#60a5fa" }}
                            thumbColor={isProfilePrivate ? "#2563eb" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() => setIsProfilePrivate(previousState => !previousState)}
                            value={isProfilePrivate}
                        />
                    </View>
                </View>

                {/* Seção de Dados */}
                <Text style={styles.sectionTitle}>Dados do Aplicativo</Text>
                <View style={styles.settingsCard}>
                    <View style={styles.settingItem}>
                        <UserX size={22} color={"#4b5563"} />
                        <Text style={styles.settingItemText}>Compartilhar dados anonimamente</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#60a5fa" }}
                            thumbColor={shareData ? "#2563eb" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() => setShareData(previousState => !previousState)}
                            value={shareData}
                        />
                    </View>
                    <Text style={styles.settingDescription}>
                        Seus dados de humor e uso são compartilhados de forma anônima para nos ajudar a melhorar o aplicativo.
                    </Text>
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4b5563',
        marginTop: 20,
        marginBottom: 10,
        marginLeft: 5,
    },
    settingsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
    },
    settingItemText: {
        flex: 1,
        marginLeft: 15,
        fontSize: 16,
        color: '#374151',
    },
    settingDescription: {
        fontSize: 13,
        color: '#6b7280',
        marginTop: 5,
        marginLeft: 37, // Alinha com o texto do item
        paddingRight: 10,
    },
});
