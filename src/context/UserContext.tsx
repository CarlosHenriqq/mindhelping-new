import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from "react";

type UserContextType = {
  userId: string | null;
  setUserId: (id: string | null, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  loadingUser: boolean;
};

const UserContext = createContext<UserContextType>({
  userId: null,
  setUserId: async () => {},
  logout: async () => {},
  loadingUser: true,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    console.log(`[UserContext] ⚡ userId MUDOU para: ${userId}`);
  }, [userId]);

  useEffect(() => {
    async function loadUser() {
      setLoadingUser(true);
      try {
        console.log("[CONTEXTO] 🔍 Carregando usuário...");
        
        // Tenta carregar userId permanente primeiro
        const storedId = await AsyncStorage.getItem('userId');
        
        if (storedId) {
          console.log("[CONTEXTO] ✅ ID permanente encontrado:", storedId);
          setUserIdState(storedId);
        } else {
          console.log("[CONTEXTO] ⚠️ Nenhum ID encontrado.");
        }
      } catch (e) {
        console.error("[CONTEXTO] ❌ ERRO ao ler AsyncStorage:", e);
      } finally {
        setLoadingUser(false);
      }
    }
    loadUser();
  }, []);

  const setUserId = async (id: string | null, remember = false) => {
    console.log(`[CONTEXTO] 📝 setUserId chamado: ID=${id}, remember=${remember}`);
    setUserIdState(id);
    
    if (id) {
      if (remember) {
        // Salva PERMANENTEMENTE
        try {
          console.log("[CONTEXTO] 💾 SALVANDO permanentemente...");
          await AsyncStorage.setItem('userId', id);
          console.log("[CONTEXTO] ✅ Salvo permanentemente!");
        } catch (e) {
          console.error("[CONTEXTO] ❌ ERRO ao salvar:", e);
        }
      } else {
        // Session only - garante que não tem nada salvo
        try {
          console.log("[CONTEXTO] 🔄 Modo sessão (não salvando)...");
          await AsyncStorage.removeItem('userId');
        } catch (e) {
          console.error("[CONTEXTO] ❌ ERRO ao limpar:", e);
        }
      }
    }
  };

  const logout = async () => {
    console.log(`[CONTEXTO] 🚪 Logout...`);
    setUserIdState(null);
    
    try {
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('notificationsScheduled');
      console.log("[CONTEXTO] ✅ Logout completo!");
    } catch (e) {
      console.error("[CONTEXTO] ❌ ERRO no logout:", e);
    }
  };

  return (
    <UserContext.Provider value={{ userId, setUserId, logout, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);