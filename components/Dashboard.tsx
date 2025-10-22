
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { type AppUser, type Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: AppUser;
}

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
    <div className={`p-6 bg-white rounded-xl shadow-md`}>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className={`mt-1 text-3xl font-semibold ${color}`}>{value}</p>
    </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select(`*, categories ( name )`)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
      } else if (data) {
        setTransactions(data as any);
      }
      setLoading(false);
    };

    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const { totalIncome, totalExpenses, balance, chartData } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyData = transactions.reduce((acc, t) => {
        const month = new Date(t.date).toLocaleString('default', { month: 'short' });
        if (!acc[month]) {
            acc[month] = { name: month, income: 0, expenses: 0 };
        }
        if (t.type === 'income') {
            acc[month].income += t.amount;
        } else {
            acc[month].expenses += t.amount;
        }
        return acc;
    }, {} as Record<string, {name: string, income: number, expenses: number}>);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      chartData: Object.values(monthlyData).reverse(),
    };
  }, [transactions]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (loading) {
    return <div className="text-center p-8">Loading dashboard...</div>
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user.email?.split('@')[0]}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Income" value={formatCurrency(totalIncome)} color="text-green-500" />
        <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} color="text-red-500" />
        <StatCard title="Current Balance" value={formatCurrency(balance)} color={balance >= 0 ? "text-blue-500" : "text-red-500"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Monthly Overview</h2>
            {transactions.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(tick) => `$${tick}`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="income" name="Income" fill="#10b981" />
                        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                    Add transactions to see your monthly overview.
                </div>
            )}
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            <ul className="space-y-4">
                {transactions.slice(0, 5).map(t => (
                    <li key={t.id} className="flex justify-between items-center">
                        <div>
                            <p className="font-medium">{t.description}</p>
                            <p className="text-sm text-gray-500">{t.categories?.name || 'Uncategorized'} - {new Date(t.date).toLocaleDateString()}</p>
                        </div>
                        <p className={`font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                            {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                        </p>
                    </li>
                ))}
                 {transactions.length === 0 && <p className="text-gray-500">No transactions yet.</p>}
            </ul>
        </div>
      </div>
    </div>
  );
};
