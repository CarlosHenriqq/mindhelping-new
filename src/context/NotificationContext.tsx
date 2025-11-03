import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert, Platform } from 'react-native';
import { API_BASE_URL, ENDPOINTS } from '../config/api';

type NotificationSettings = {
  dailyReminders: boolean;
  appointmentReminders: boolean;
  newsAndUpdates: boolean;
};

type NotificationContextType = {
  settings: NotificationSettings;
  updateSetting: (key: keyof NotificationSettings, value: boolean) => Promise<void>;
  loadingSettings: boolean;
  scheduleSmartNotifications: (userId: string) => Promise<void>;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,   // ✅ Novo (mostra banner no topo)
    shouldShowList: true,      // ✅ Novo (mostra na lista de notificações)
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NotificationContext = createContext<NotificationContextType>({
  settings: {
    dailyReminders: true,
    appointmentReminders: true,
    newsAndUpdates: false,
  },
  updateSetting: async () => {},
  loadingSettings: true,
  scheduleSmartNotifications: async () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    dailyReminders: true,
    appointmentReminders: true,
    newsAndUpdates: false,
  });
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    loadSettings();
    requestNotificationPermissions();
  }, []);

  const requestNotificationPermissions = async () => {
    if (!Device.isDevice) {
      console.log('[Notifications] ⚠️ Notificações só funcionam em dispositivos físicos');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] ❌ Permissão negada');
      return false;
    }

    console.log('[Notifications] ✅ Permissão concedida');

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('mood-reminders', {
        name: 'Lembretes de Humor',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563eb',
      });

      await Notifications.setNotificationChannelAsync('appointments', {
        name: 'Consultas',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#f59e0b',
      });

      await Notifications.setNotificationChannelAsync('goals', {
        name: 'Metas',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10b981',
      });

      await Notifications.setNotificationChannelAsync('monthly-report', {
        name: 'Relatório Mensal',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8b5cf6',
      });
    }

    return true;
  };

  const loadSettings = async () => {
    try {
      console.log('[NotificationContext] 📥 Carregando preferências...');
      
      const stored = await AsyncStorage.getItem('notificationSettings');
      
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('[NotificationContext] ✅ Preferências carregadas:', parsed);
        setSettings(parsed);
      } else {
        console.log('[NotificationContext] ℹ️ Usando preferências padrão');
      }
    } catch (error) {
      console.error('[NotificationContext] ❌ Erro ao carregar:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  // ====== NOTIFICAÇÕES INTELIGENTES ======
  const scheduleSmartNotifications = async (userId: string) => {
    if (!userId) {
      console.log('[Notifications] ⚠️ userId não fornecido');
      return;
    }

    if (!Device.isDevice) {
      console.log('[Notifications] ⚠️ Pulando agendamento (não é dispositivo físico)');
      return;
    }

    try {
      console.log('[Notifications] 🧠 Agendando notificações inteligentes...');

      // Cancela TODAS as notificações antigas antes de reagendar
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('[Notifications] 🗑️ Notificações antigas canceladas');

      // 1. Verificar se registrou sentimento hoje (só se ativado)
      if (settings.dailyReminders) {
        await checkAndScheduleMoodReminder(userId);
      }

      // 2. Verificar consultas próximas (só se ativado)
      if (settings.appointmentReminders) {
        await checkAndScheduleAppointmentReminders(userId);
      }

      // 3. Verificar metas em aberto
      await checkAndScheduleGoalReminders(userId);

      // 4. Agendar relatório mensal (último dia do mês)
      await scheduleMonthlyReport();

      console.log('[Notifications] ✅ Notificações inteligentes agendadas');
    } catch (error) {
      console.error('[Notifications] ❌ Erro ao agendar notificações inteligentes:', error);
    }
  };

  // Verifica se o usuário registrou humor hoje e agenda lembrete se não registrou
  const checkAndScheduleMoodReminder = async (userId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await axios.get(
        `${API_BASE_URL}${ENDPOINTS.FEELINGS_USER(userId)}`
      );

      // 🔥 PROTEÇÃO: Garante que response.data é um array
      const feelings = Array.isArray(response.data) ? response.data : [];
      
      if (feelings.length === 0) {
        console.log('[Notifications] ℹ️ Nenhum sentimento encontrado no histórico');
      }

      // Filtra apenas sentimentos de hoje
      const hasMoodToday = feelings.some((feeling: any) => {
        const feelingDate = new Date(feeling.date).toISOString().split('T')[0];
        return feelingDate === today;
      });

      if (!hasMoodToday) {
        console.log('[Notifications] 📝 Nenhum sentimento registrado hoje');
        
        const now = new Date();
        const currentHour = now.getHours();

        // Agenda notificação baseada no horário atual
        let notificationTime = new Date();

        if (currentHour < 12) {
          // Se for de manhã, agenda para 14h (meio da tarde)
          notificationTime.setHours(14, 0, 0, 0);
        } else if (currentHour < 18) {
          // Se for tarde, agenda para 20h (noite)
          notificationTime.setHours(20, 0, 0, 0);
        } else {
          // Se já for noite, agenda para amanhã às 10h
          notificationTime.setDate(notificationTime.getDate() + 1);
          notificationTime.setHours(10, 0, 0, 0);
        }

        // Só agenda se for no futuro
        if (notificationTime > now) {
          await Notifications.scheduleNotificationAsync({
            identifier: 'mood-reminder',
            content: {
              title: '💭 Como você está se sentindo?',
              body: 'Você ainda não registrou seu humor hoje. Que tal fazer isso agora?',
              sound: true,
              data: { type: 'mood-reminder', screen: '/pages/Diario' },
            },
            trigger: {
              date: notificationTime,
              channelId: 'mood-reminders',
            },
          });

          console.log(`[Notifications] 📝 Lembrete de humor agendado para ${notificationTime.toLocaleString('pt-BR')}`);
        }
      } else {
        console.log('[Notifications] ✅ Humor já registrado hoje, sem notificação');
      }
    } catch (error: any) {
      // Erro detalhado para debug
      if (error.response) {
        console.error('[Notifications] ❌ Erro ao verificar humor - Status:', error.response.status);
        console.error('[Notifications] ❌ Dados:', error.response.data);
      } else {
        console.error('[Notifications] ❌ Erro ao verificar humor:', error.message);
      }
    }
  };

  // Verifica consultas e agenda lembretes 1 dia antes
  const checkAndScheduleAppointmentReminders = async (userId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.SCHEDULING_USER(userId)}`);
      
      // 🔥 PROTEÇÃO: Garante que response.data é um array
      const appointments = Array.isArray(response.data) ? response.data : [];

      if (appointments.length === 0) {
        console.log('[Notifications] ℹ️ Nenhuma consulta encontrada');
        return;
      }

      const now = new Date();
      let count = 0;

      for (const appointment of appointments) {
        // Valida que o appointment tem os dados necessários
        if (!appointment.date || !appointment.time) {
          console.log('[Notifications] ⚠️ Consulta sem data/hora, pulando...');
          continue;
        }

        const appointmentDate = new Date(appointment.date + 'T' + appointment.time);
        
        // Agenda para 1 dia antes, às 18h
        const reminderDate = new Date(appointmentDate);
        reminderDate.setDate(reminderDate.getDate() - 1);
        reminderDate.setHours(18, 0, 0, 0);

        // Só agenda se a data do lembrete for no futuro
        if (reminderDate > now) {
          await Notifications.scheduleNotificationAsync({
            identifier: `appointment-${appointment.id}`,
            content: {
              title: '📅 Consulta amanhã!',
              body: `Você tem consulta${appointment.professional ? ` com ${appointment.professional}` : ''} amanhã às ${appointment.time}.`,
              sound: true,
              data: { 
                type: 'appointment-reminder', 
                appointmentId: appointment.id,
                screen: '/pages/Consultas'
              },
            },
            trigger: {
              date: reminderDate,
              channelId: 'appointments',
            },
          });

          count++;
          console.log(`[Notifications] 📅 Lembrete de consulta agendado para ${reminderDate.toLocaleString('pt-BR')}`);
        }
      }

      console.log(`[Notifications] ✅ ${count} lembretes de consultas agendados`);
    } catch (error: any) {
      if (error.response) {
        console.error('[Notifications] ❌ Erro ao verificar consultas - Status:', error.response.status);
      } else {
        console.error('[Notifications] ❌ Erro ao verificar consultas:', error.message);
      }
    }
  };

  // Verifica metas em aberto e agenda lembretes
  const checkAndScheduleGoalReminders = async (userId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.GOAL_USER(userId)}`);
      
      // 🔥 PROTEÇÃO: Garante que response.data é um array
      const goals = Array.isArray(response.data) ? response.data : [];

      if (goals.length === 0) {
        console.log('[Notifications] ℹ️ Nenhuma meta encontrada');
        return;
      }

      const now = new Date();
      let count = 0;

      for (const goal of goals) {
        // Só notifica metas não concluídas e com deadline
        if (goal.completed || goal.status === 'completed' || !goal.deadline) {
          continue;
        }

        const goalDeadline = new Date(goal.deadline);
        const reminderDate = new Date(goalDeadline);
        reminderDate.setDate(reminderDate.getDate() - 1);
        reminderDate.setHours(19, 0, 0, 0); // 19h do dia anterior

        // Só agenda se a meta ainda não expirou e o lembrete é no futuro
        if (reminderDate > now && goalDeadline > now) {
          await Notifications.scheduleNotificationAsync({
            identifier: `goal-${goal.id}`,
            content: {
              title: '🎯 Lembrete de Meta',
              body: `A meta "${goal.title}" vence amanhã! Já executou?`,
              sound: true,
              data: { 
                type: 'goal-reminder', 
                goalId: goal.id,
                screen: '/pages/Metas'
              },
            },
            trigger: {
              date: reminderDate,
              channelId: 'goals',
            },
          });

          count++;
          console.log(`[Notifications] 🎯 Lembrete de meta agendado para ${reminderDate.toLocaleString('pt-BR')}`);
        }
      }

      console.log(`[Notifications] ✅ ${count} lembretes de metas agendados`);
    } catch (error: any) {
      if (error.response) {
        console.error('[Notifications] ❌ Erro ao verificar metas - Status:', error.response.status);
      } else {
        console.error('[Notifications] ❌ Erro ao verificar metas:', error.message);
      }
    }
  };

  // Agenda relatório mensal (último dia de cada mês às 20h)
  const scheduleMonthlyReport = async () => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Último dia do mês atual
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
      lastDayOfMonth.setHours(20, 0, 0, 0);

      // Se já passou, agenda para o próximo mês
      if (lastDayOfMonth <= now) {
        const nextMonth = currentMonth + 1;
        const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear;
        const nextMonthIndex = nextMonth > 11 ? 0 : nextMonth;
        
        lastDayOfMonth.setFullYear(nextYear);
        lastDayOfMonth.setMonth(nextMonthIndex + 1, 0); // Último dia do próximo mês
        lastDayOfMonth.setHours(20, 0, 0, 0);
      }

      await Notifications.scheduleNotificationAsync({
        identifier: 'monthly-report',
        content: {
          title: '📊 Relatório Mensal Disponível!',
          body: 'Seu relatório mensal de humor está pronto. Veja como foi seu mês!',
          sound: true,
          data: { type: 'monthly-report', screen: '/pages/Relatorios' },
        },
        trigger: {
          date: lastDayOfMonth,
          channelId: 'monthly-report',
        },
      });

      console.log(`[Notifications] 📊 Relatório mensal agendado para ${lastDayOfMonth.toLocaleString('pt-BR')}`);
    } catch (error) {
      console.error('[Notifications] ❌ Erro ao agendar relatório mensal:', error);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    try {
      const newSettings = { ...settings, [key]: value };
      
      setSettings(newSettings);
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      
      console.log(`[NotificationContext] 💾 ${key} = ${value}`);

      // Feedback visual
      if (key === 'dailyReminders') {
        if (value) {
          Alert.alert(
            'Lembretes ativados! 🔔',
            'Você receberá lembretes apenas quando não registrar seu humor durante o dia.'
          );
        } else {
          Alert.alert(
            'Lembretes desativados',
            'Você não receberá mais lembretes de humor.'
          );
        }
      }

      if (key === 'appointmentReminders') {
        if (value) {
          Alert.alert(
            'Lembretes de consultas ativados! 📅',
            'Você será notificado 1 dia antes de cada consulta.'
          );
        } else {
          Alert.alert(
            'Lembretes de consultas desativados',
            'Você não receberá mais lembretes de consultas.'
          );
        }
      }
    } catch (error) {
      console.error('[NotificationContext] ❌ Erro ao salvar:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      settings, 
      updateSetting, 
      loadingSettings,
      scheduleSmartNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);