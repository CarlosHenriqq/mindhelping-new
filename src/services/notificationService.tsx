import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

// Configura como o app se comporta ao receber uma notificação com o app aberto
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// Função para registrar o dispositivo e pedir permissões
async function registerForPushNotificationsAsync() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Você precisa habilitar as notificações para receber lembretes!');
        return false;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Lembretes Diários',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }
    
    return true;
}

// 1. Função para agendar o lembrete diário
/**
 * Envia uma notificação para o usuário, lembrando para ele registrar o sentimento.
 */
export async function scheduleDailyReminderNotification() {
    const hasPermission = await registerForPushNotificationsAsync();
    if (!hasPermission) return;

    const identifier = 'daily-feeling-reminder';

    // Cancela apenas a notificação anterior com o mesmo identificador
    await Notifications.cancelScheduledNotificationAsync(identifier);

    await Notifications.scheduleNotificationAsync({
        identifier: identifier, // <-- IDENTIFICADOR ÚNICO
        content: {
            title: "Como você está se sentindo agora? 🤔",
            body: 'Não se esqueça de registrar seu sentimento. Leva só um segundo!',
            data: { screen: 'Home' },
        },
        trigger: {
            hour: 20,
            minute: 0,
            repeats: true,
        },
    });

    console.log(`Notificação '${identifier}' agendada com sucesso.`);
}

// 2. NOVA FUNÇÃO DE EXEMPLO: Lembrete semanal
/**
 * Envia uma notificação para o usuário, falando que o relatório está pronto
 */
export async function scheduleWeeklyReportNotification() {
    const hasPermission = await registerForPushNotificationsAsync();
    if (!hasPermission) return;

    const identifier = 'weekly-report-reminder';

    // Cancela apenas a notificação anterior com o mesmo identificador
    await Notifications.cancelScheduledNotificationAsync(identifier);

    await Notifications.scheduleNotificationAsync({
        identifier: identifier, // <-- OUTRO IDENTIFICADOR ÚNICO
        content: {
            title: "Seu relatório semanal está pronto! 📊",
            body: 'Veja um resumo de como foi sua semana e seus sentimentos.',
            data: { screen: 'Relatorios' }, // Leva para outra tela
        },
        trigger: {
            hour: 20,
            minute: 0,
            repeats: true,
        },
    });

    console.log(`Notificação '${identifier}' relatorio com sucesso.`);
}
/**
 * Envia uma notificação para o usuário, lembrando para ele realizar a meta.
 */
export async function goalsWeeklyNotification() {
    const hasPermission = await registerForPushNotificationsAsync();
    if (!hasPermission) return;

    const identifier = 'goals-reminder';

    // Cancela apenas a notificação anterior com o mesmo identificador
    await Notifications.cancelScheduledNotificationAsync(identifier);

    await Notifications.scheduleNotificationAsync({
        identifier: identifier, // <-- OUTRO IDENTIFICADOR ÚNICO
        content: {
            title: "Você já realizou sua meta hoje? Não se esqueça de marcar no app!",
            body: 'Não deixe de concluir suas metas, você consegue.',
            data: { screen: 'Charts' }, // Leva para outra tela
        },
        trigger: {
            hour: 20,
            minute: 0,
            repeats: true,
        },
    });

    console.log(`Notificação '${identifier}' meta com sucesso.`);
}

// 3. NOVA FUNÇÃO: Lembrete de consulta agendada com variáveis
/**
 * Agenda um lembrete para uma consulta específica, 1 hora antes do horário marcado.
 * @param {object} appointmentDetails - Um objeto contendo os detalhes da consulta.
 * @param {string} appointmentDetails.id - Um ID único para a consulta (ex: "consulta-123").
 * @param {string} appointmentDetails.professionalName - O nome do profissional (ex: "Dra. Alessandra").
 * @param {Date} appointmentDetails.date - O objeto Date completo da consulta (ex: new Date("2024-10-15T16:00:00")).
 */
export async function scheduleAppointmentReminder(appointmentDetails) {
    const hasPermission = await registerForPushNotificationsAsync();
    if (!hasPermission) return;

    const { id, professionalName, date } = appointmentDetails;

    // Cria um identificador único para esta consulta específica
    const identifier = `appointment-reminder-${id}`;

    // Calcula a data do lembrete (1 hora antes da consulta)
    const reminderDate = new Date(date.getTime() - 60 * 60 * 1000);

    // Verifica se a data do lembrete ainda está no futuro
    if (reminderDate < new Date()) {
        console.log(`A data do lembrete para a consulta '${id}' já passou. Nenhuma notificação será agendada.`);
        return;
    }

    // Formata a hora da consulta para a mensagem
    const appointmentTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Cancela qualquer lembrete anterior para esta mesma consulta
    await Notifications.cancelScheduledNotificationAsync(identifier);

    // Agenda a nova notificação
    await Notifications.scheduleNotificationAsync({
        identifier: identifier,
        content: {
            title: "Lembrete de Consulta ⏰",
            body: `Sua consulta com ${professionalName} é hoje às ${appointmentTime}!`,
            data: { screen: 'Home' }, // Pode direcionar para uma tela de agendamentos
        },
        trigger: {
            date: reminderDate, // Dispara na data e hora exatas calculadas
        },
    });

    console.log(`Lembrete para a consulta '${id}' agendado para ${reminderDate.toLocaleString('pt-BR')}.`);
}




