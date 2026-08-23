import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isImportador: boolean;
  isVerificador: boolean;
  login: (cedula: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
}

const DEMO_USERS: Record<string, { user: User; password: string }> = {
  '00112345678': {
    password: '123456',
    user: {
      id: 'usr-imp-01',
      name: 'Ricardo García',
      email: 'ricardo.garcia@caribeimport.com.do',
      role: 'importador',
      rnc: '130-98765-4',
      cedula: '00112345678',
      compania: 'Caribe Import Logistics S.R.L.',
      telefono: '(809) 540-2020',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    },
  },
  '00187654321': {
    password: '123456',
    user: {
      id: 'usr-ver-02',
      name: 'Lic. María González',
      email: 'maria.gonzalez@aduanas.gob.do',
      role: 'verificador',
      rnc: '401-00745-1',
      cedula: '00187654321',
      compania: 'Dirección General de Aduanas (DGA)',
      telefono: '(809) 547-7070',
      profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    },
  },
};

const AUTH_STORAGE_KEY = '@siga_auth_user_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
      // No auto-login: show login screen if no stored session
    } catch (e) {
      console.error('Error cargando sesión de usuario:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (input: string, passwordInput: string): Promise<{ success: boolean; message?: string }> => {
    const cleanInput = input.toLowerCase().trim();
    const cleanDigits = input.replace(/\D/g, '');

    const foundEntry = Object.values(DEMO_USERS).find(
      (entry) =>
        entry.user.email.toLowerCase() === cleanInput ||
        entry.user.cedula.replace(/\D/g, '') === cleanDigits ||
        (entry.user.rnc && entry.user.rnc.replace(/\D/g, '') === cleanDigits) ||
        cleanInput.includes('ejemplo') ||
        cleanInput.includes('ricardo') ||
        cleanInput.includes('admin')
    );

    if (foundEntry) {
      setUser(foundEntry.user);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundEntry.user));
      return { success: true };
    }

    // Default fallback demo user
    const defaultUser = DEMO_USERS['00112345678'].user;
    setUser(defaultUser);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUser));
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  };

  const switchRole = async (newRole: UserRole) => {
    const templateUser = newRole === 'importador' ? DEMO_USERS['00112345678'].user : DEMO_USERS['00187654321'].user;
    setUser(templateUser);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(templateUser));
  };

  const isImportador = user?.role === 'importador';
  const isVerificador = user?.role === 'verificador';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isImportador,
        isVerificador,
        login,
        logout,
        updateProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
