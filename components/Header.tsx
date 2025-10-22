
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { ChartPieIcon, DocumentTextIcon, HomeIcon, LightBulbIcon, LogoutIcon, WalletIcon } from './icons';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-primary-100 text-primary-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <header className="flex flex-col w-64 h-screen px-4 py-8 bg-white border-r">
      <div className="flex items-center space-x-2 px-4">
        <WalletIcon className="w-8 h-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-800">FinanSage AI</h1>
      </div>

      <nav className="flex-1 mt-10 space-y-2">
        <NavLink to="/" className={navLinkClass}>
          <HomeIcon className="w-5 h-5 mr-3" />
          Dashboard
        </NavLink>
        <NavLink to="/transactions" className={navLinkClass}>
          <DocumentTextIcon className="w-5 h-5 mr-3" />
          Transactions
        </NavLink>
        <NavLink to="/reports" className={navLinkClass}>
          <ChartPieIcon className="w-5 h-5 mr-3" />
          Reports
        </NavLink>
        <NavLink to="/insights" className={navLinkClass}>
          <LightBulbIcon className="w-5 h-5 mr-3" />
          AI Insights
        </NavLink>
      </nav>

      <div>
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900"
        >
          <LogoutIcon className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </header>
  );
};
