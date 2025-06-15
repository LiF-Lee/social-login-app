import { createContext, useContext, useState } from 'react';

export const UserContext = createContext(null);

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children, initialUser }) {
  const [user, setUser] = useState(initialUser);
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}