
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabase';
import { type Session } from '@supabase/supabase-js';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { Transactions } from './components/Transactions';
import { Reports } from './components/Reports';
import { Insights } from './components/Insights';
import { type AppUser } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Auth />;
  }

  const user = session.user as AppUser;

  return (
    <HashRouter>
      <div className="flex h-screen bg-gray-50">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/transactions" element={<Transactions user={user} />} />
            <Route path="/reports" element={<Reports user={user} />} />
            <Route path="/insights" element={<Insights user={user} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
