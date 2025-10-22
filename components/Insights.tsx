
import React, { useState, useMemo } from 'react';
import { generateFinancialInsights } from '../services/geminiService';
import { supabase } from '../services/supabase';
import { type AppUser, type Transaction } from '../types';
import { LightBulbIcon } from './icons';
import ReactMarkdown from 'react-markdown';

interface InsightsProps {
  user: AppUser;
}

export const Insights: React.FC<InsightsProps> = ({ user }) => {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactionsAndGenerateInsights = async () => {
    setLoading(true);
    setError(null);
    setInsights('');

    try {
        const { data, error: fetchError } = await supabase
        .from('transactions')
        .select(`*`)
        .eq('user_id', user.id);

        if (fetchError) throw fetchError;
        
        if (data) {
            setTransactions(data);
            const { totalIncome, totalExpenses } = data.reduce((acc, t) => {
                if (t.type === 'income') acc.totalIncome += t.amount;
                else acc.totalExpenses += t.amount;
                return acc;
            }, { totalIncome: 0, totalExpenses: 0 });

            const result = await generateFinancialInsights(data, totalIncome, totalExpenses);
            setInsights(result);
        } else {
             setInsights("No transaction data found to analyze.");
        }
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">AI Financial Insights</h1>
        <button
          onClick={fetchTransactionsAndGenerateInsights}
          disabled={loading}
          className="flex items-center px-4 py-2 font-semibold text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 disabled:bg-primary-300 transition-colors"
        >
          <LightBulbIcon className="w-5 h-5 mr-2"/>
          {loading ? 'Analyzing...' : 'Generate Insights'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md min-h-[500px]">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">FinanSage AI is analyzing your finances...</p>
          </div>
        )}

        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !insights && (
            <div className="flex flex-col items-center justify-center text-center h-full text-gray-500">
                <LightBulbIcon className="w-24 h-24 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold">Ready for your personalized financial advice?</h2>
                <p className="mt-2 max-w-md">Click the "Generate Insights" button to get custom tips and analysis based on your spending habits. It's like having a personal financial advisor at your fingertips!</p>
            </div>
        )}

        {insights && (
          <div className="prose max-w-none">
            <ReactMarkdown>{insights}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};
