import React, { createContext, useContext, useState } from "react";

type UserContextType = {
  userId: string | '';
  setUserId: (id: string | null) => void;
};

const UserContext = createContext<UserContextType>({
  userId: '',
  setUserId: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | ''>('');

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
