import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { BellRing, CalendarClock, ChevronLeft, Sparkles } from 'lucide-react-native';
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

export default function Notificacoes() {
    const [dailyReminders, setDailyReminders] = useState(true);
    const [appointmentReminders, setAppointmentReminders] = useState(true);
    const [newsAndUpdates, setNewsAndUpdates] = useState(false);

    return (
        <LinearGradient
            colors={['#f0f9ff', '#e0f2fe', '#bae6fd']}
            style={styles.background}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.replace("/pages/Perfil")} style={styles.backButton}>
                        <ChevronLeft color="#333" size={24} />
                        <Text style={styles.headerTitle}>Notificações</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Lembretes</Text>
                <View style={styles.settingsCard}>
                    {/* Lembretes Diários */}
                    <View style={styles.settingItem}>
                        <BellRing size={22} color={"#4b5563"} />
                        <Text style={styles.settingItemText}>Lembretes diários de humor</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#60a5fa" }}
                            thumbColor={dailyReminders ? "#2563eb" : "#f4f3f4"}
                            onValueChange={() => setDailyReminders(prev => !prev)}
                            value={dailyReminders}
                        />
                    </View>
                    <View style={styles.divider} />
                    {/* Lembretes de Consulta */}
                    <View style={styles.settingItem}>
                        <CalendarClock size={22} color={"#4b5563"} />
                        <Text style={styles.settingItemText}>Lembretes de consultas</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#60a5fa" }}
                            thumbColor={appointmentReminders ? "#2563eb" : "#f4f3f4"}
                            onValueChange={() => setAppointmentReminders(prev => !prev)}
                            value={appointmentReminders}
                        />
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Outras Notificações</Text>
                <View style={styles.settingsCard}>
                    {/* Novidades */}
                    <View style={styles.settingItem}>
                        <Sparkles size={22} color={"#4b5563"} />
                        <Text style={styles.settingItemText}>Novidades e dicas</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#60a5fa" }}
                            thumbColor={newsAndUpdates ? "#2563eb" : "#f4f3f4"}
                            onValueChange={() => setNewsAndUpdates(prev => !prev)}
                            value={newsAndUpdates}
                        />
                    </View>
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
        marginTop: '5%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: '5%',
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
        paddingHorizontal: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
    },
    settingItemText: {
        flex: 1,
        marginLeft: 15,
        fontSize: 16,
        color: '#374151',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginLeft: 52, // Alinha com o texto
    },
});
