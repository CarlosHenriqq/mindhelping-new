import { Tabs } from 'expo-router';
import { ChartBar, HomeIcon, NotebookTabs, Phone, Trophy } from 'lucide-react-native';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: width * 0.025, // equivalente a ~10px em 400px de largura
          fontWeight: 'bold',
          textTransform: 'uppercase',
          paddingBottom: 4,
        },
        tabBarActiveTintColor: '#3386BC',
        tabBarInactiveTintColor: '#4A4A4A',
        tabBarStyle: {
          width: '100%',
          backgroundColor: '#F6F6F6',
          height: width < 400 ? 60 : 65, // ligeiro ajuste para telas menores
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 5 },
          shadowRadius: 10,
          elevation: 3,
        },
      }}
    >
      
       <Tabs.Screen
        name="Metas/index"
        options={{
          title: 'Metas',
          tabBarIcon: ({ color }) => (
            <Trophy name="trophy" color={color} size={25}/>
          ),
        }}
      />
      <Tabs.Screen
        name="Diario/index"
        options={{
          title: 'Diario',
          tabBarIcon: ({ color }) => (
            <NotebookTabs name="notebook" color={color} size={25}/>
          ),
        }}
      />
      <Tabs.Screen
        name="Home/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <HomeIcon name="home" color={color} size={25} />
          ),
        }}
      />
      <Tabs.Screen
        name="CVV/index"
        options={{
          title: 'CVV',
          tabBarIcon: ({ color }) => (
            <Phone name="phone" color={color} size={25}/>
          ),
        }}
      />
      <Tabs.Screen
        name="Charts/index"
        options={{
          title: 'Relatórios',
          tabBarIcon: ({ color }) => (
            <ChartBar name="chart" color={color} size={25}/>
          ),
        }}
      />
      <Tabs.Screen 
        name="Charts/Month/index" // ou o nome do seu arquivo
        options={{ href: null }} 
      />
      <Tabs.Screen 
        name="Diario/Anotacoes/index" // ou o nome do seu arquivo
        options={{ href: null }} 
      />
    </Tabs>
  );
}
