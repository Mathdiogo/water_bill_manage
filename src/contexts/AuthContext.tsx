import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Morador } from '../types';

interface AuthContextType {
  user: any;
  morador: Morador | null;
  isAdmin: boolean;
  loading: boolean;
  loginAdmin: (email: string, password: string) => Promise<void>;
  loginMorador: (numeroChacara: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [morador, setMorador] = useState<Morador | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const savedMorador = localStorage.getItem('morador');
    if (savedMorador) {
      setMorador(JSON.parse(savedMorador));
    }
    setLoading(false);

    return () => subscription.unsubscribe();
  }, []);

  const loginAdmin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setUser(data.user);
    setMorador(null);
    localStorage.removeItem('morador');
  };

  const loginMorador = async (numeroChacara: string) => {
    const { data, error } = await supabase
      .from('moradores')
      .select('*')
      .eq('numero_chacara', numeroChacara)
      .eq('ativo', true)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Chácara não encontrada');

    setMorador(data);
    setUser(null);
    localStorage.setItem('morador', JSON.stringify(data));
  };

  const logout = async () => {
    if (user) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setMorador(null);
    localStorage.removeItem('morador');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        morador,
        isAdmin: !!user,
        loading,
        loginAdmin,
        loginMorador,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
