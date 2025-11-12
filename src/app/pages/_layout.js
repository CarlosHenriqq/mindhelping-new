import { Tabs } from 'expo-router';
import { ChartColumn, HomeIcon, NotebookTabs, Phone } from 'lucide-react-native';
import { Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: width * 0.025,
          fontWeight: 'bold',
          textTransform: 'uppercase',
          paddingBottom: 4,
        },
        tabBarActiveTintColor: '#3386BC',
        tabBarInactiveTintColor: '#4A4A4A',
        tabBarStyle: {
          width: '100%',
          backgroundColor: '#F6F6F6',
          height: width < 400 ? 60 : 65,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 5 },
          shadowRadius: 10,
          elevation: 3,
          // 👇 Adiciona margem segura na parte inferior
          paddingBottom: Platform.OS === 'android' ? insets.bottom + 8 : insets.bottom,
        },
      }}
    >

      <Tabs.Screen
        name="Diario/index"
        options={{
          title: 'Diario',
          tabBarIcon: ({ color }) => (
            <NotebookTabs color={color} size={25} />
          ),
        }}
      />

      <Tabs.Screen
        name="Home/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <HomeIcon color={color} size={25} />
          ),
        }}
      />

      <Tabs.Screen
        name="Charts/index"
        options={{
          title: 'Relatórios',
          tabBarIcon: ({ color }) => (
            <ChartColumn color={color} size={25} />
          ),
        }}
      />

      <Tabs.Screen
        name="CVV/index"
        options={{
          title: 'CVV',
          tabBarIcon: ({ color }) => (
            <Phone color={color} size={25} />
          ),
        }}
      />

      {/* Telas ocultas da Tab */}
      <Tabs.Screen name="Charts/Month/index" options={{ href: null }} />
      <Tabs.Screen name="Diario/Anotacoes/index" options={{ href: null }} />
      <Tabs.Screen name="Agendamento/index" options={{ href: null }} />
      <Tabs.Screen name="Agendamento/Agendar/index" options={{ href: null }} />
      <Tabs.Screen name="Perfil/index" options={{ href: null }} />
      <Tabs.Screen name="Metas/index" options={{ href: null }} />
      <Tabs.Screen name="Perfil/editPerfil/index" options={{ href: null }} />
      <Tabs.Screen name="Perfil/Privacidade/index" options={{ href: null }} />
      <Tabs.Screen name="Perfil/FAQ/index" options={{ href: null }} />
      <Tabs.Screen name="Perfil/Notificacoes/index" options={{ href: null }} />

    </Tabs>
  );
}
