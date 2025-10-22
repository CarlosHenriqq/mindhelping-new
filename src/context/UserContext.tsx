import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from "react";

type UserContextType = {
  userId: string | null;
  setUserId: (id: string | null) => void;
  loadingUser: boolean;
};

const UserContext = createContext<UserContextType>({
  userId: null,
  setUserId: () => {},
  loadingUser: true,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const storedId = await AsyncStorage.getItem('userId');
      if (storedId) setUserIdState(storedId);
      setLoadingUser(false);
    }
    loadUser();
  }, []);

  const setUserId = (id: string | null) => {
    setUserIdState(id);
    if (id === null) AsyncStorage.removeItem('userId'); // limpar se deslogar
    else AsyncStorage.setItem('userId', id);
  }

  return (
    <UserContext.Provider value={{ userId, setUserId, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
