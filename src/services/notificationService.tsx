import axios from 'axios';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import { API_BASE_URL, ENDPOINTS } from '../config/api';

// Configura o app para mostrar notificação mesmo com app aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ------------------------
// Função para registrar permissão
// ------------------------
async function registerForPushNotificationsAsync() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permissão negada',
      'Você precisa habilitar as notificações para receber lembretes!'
    );
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Lembretes',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
}

// ------------------------
// Função genérica para agendar notificações
// ------------------------
async function scheduleNotification(identifier: string, content: any, trigger: any) {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    await Notifications.scheduleNotificationAsync({ identifier, content, trigger });
    console.log(`Notificação '${identifier}' agendada com sucesso.`);
  } catch (err) {
    console.error(`Erro ao agendar notificação '${identifier}':`, err);
  }
}

// ------------------------
// Notificação diária: sentimento
// ------------------------
async function dailyFeelingReminder(userId: string) {
  const hasPermission = await registerForPushNotificationsAsync();
  if (!hasPermission) return;

  try {
    const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.USER_FEELINGS(userId)}`);
    const today = new Date().toISOString().split('T')[0];
    const hasFeelingToday = response.data.some(
      (f: any) => f.date.split('T')[0] === today
    );

    if (hasFeelingToday) return;

    await scheduleNotification(
      'daily-feeling-reminder',
      {
        title: "Como você está se sentindo hoje? 🤔",
        body: "Não se esqueça de registrar seu sentimento!",
        data: { screen: 'Home' },
      },
      { hour: 20, minute: 0, repeats: true }
    );
  } catch (err) {
    console.error('Erro ao verificar sentimentos:', err);
  }
}

// ------------------------
// Notificação diária: metas
// ------------------------
async function dailyGoalsReminder(userId: string) {
  const hasPermission = await registerForPushNotificationsAsync();
  if (!hasPermission) return;

  try {
    const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.GOAL_USER(userId)}`);
    const today = new Date().toISOString().split('T')[0];

    const pendingGoals = response.data.filter((goal: any) =>
      !goal.executions.some((exec: any) => exec.date.split('T')[0] === today)
    );

    if (pendingGoals.length === 0) return;

    await scheduleNotification(
      'daily-goals-reminder',
      {
        title: "Você já realizou sua meta hoje?",
        body: "Não deixe de concluir suas metas, você consegue!",
        data: { screen: 'Charts' },
      },
      { hour: 20, minute: 0, repeats: true }
    );
  } catch (err) {
    console.error('Erro ao verificar metas:', err);
  }
}

// ------------------------
// Notificação mensal: relatório
// ------------------------
async function monthlyReportReminder(userId: string) {
  const hasPermission = await registerForPushNotificationsAsync();
  if (!hasPermission) return;

  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  if (now.getDate() !== lastDayOfMonth) return;

  await scheduleNotification(
    'monthly-report-reminder',
    {
      title: "Seu relatório mensal está pronto! 📊",
      body: "Confira como foi seu mês e seus sentimentos!",
      data: { screen: 'Relatorios' },
    },
    { hour: 20, minute: 0, repeats: false }
  );
}

// ------------------------
// Notificação de consulta agendada
// ------------------------
export async function scheduleAppointmentReminder(appointmentDetails: any) {
  const hasPermission = await registerForPushNotificationsAsync();
  if (!hasPermission) return;

  const { id, professionalName, date } = appointmentDetails;
  const identifier = `appointment-reminder-${id}`;
  const reminderDate = new Date(date.getTime() - 60 * 60 * 1000);

  if (reminderDate < new Date()) return;

  const appointmentTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  await scheduleNotification(
    identifier,
    {
      title: "Lembrete de Consulta ⏰",
      body: `Sua consulta com ${professionalName} é hoje às ${appointmentTime}!`,
      data: { screen: 'Home' },
    },
    { date: reminderDate }
  );
}

// ------------------------
// Função central: agenda todas as notificações
// ------------------------
export async function scheduleAllNotifications(userId: string) {
  await dailyFeelingReminder(userId);
  await dailyGoalsReminder(userId);
  await monthlyReportReminder(userId);
  // consultas você chama scheduleAppointmentReminder separadamente para cada agendamento
}

// ------------------------
// 🔥 Função de teste: dispara notificação em 10 segundos
// ------------------------
export async function testNotification() {
  const hasPermission = await registerForPushNotificationsAsync();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🚀 Teste de Notificação",
      body: "Se você está vendo isso, está tudo funcionando! 😄",
      data: { screen: 'Home' },
    },
    trigger: { seconds: 10 }, // dispara em 10 segundos
  });

  console.log("✅ Notificação de teste agendada!");
}
