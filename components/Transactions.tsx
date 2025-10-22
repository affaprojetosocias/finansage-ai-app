
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { type AppUser, type Transaction, type Category } from '../types';
import { Modal } from './Modal';
import { PlusIcon } from './icons';

interface TransactionsProps {
  user: AppUser;
}

export const Transactions: React.FC<TransactionsProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
  });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select(`*, categories(id, name)`)
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
    } else if (data) {
      setTransactions(data as any);
    }
    setLoading(false);
  }, [user.id]);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) console.error('Error fetching categories:', error);
    else if (data) setCategories(data);
  }, [user.id]);

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [fetchTransactions, fetchCategories]);

  const openModal = (transaction: Transaction | null = null) => {
    setEditingTransaction(transaction);
    if (transaction) {
      setFormData({
        description: transaction.description,
        amount: String(transaction.amount),
        type: transaction.type,
        date: transaction.date,
        category_id: transaction.category_id,
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        category_id: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      user_id: user.id,
    };

    if (editingTransaction) {
      // Update
      const { error } = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', editingTransaction.id);
      if (error) console.error('Error updating transaction:', error);
    } else {
      // Create
      const { error } = await supabase
        .from('transactions')
        .insert([transactionData]);
      if (error) console.error('Error creating transaction:', error);
    }
    fetchTransactions();
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) console.error('Error deleting transaction:', error);
      else fetchTransactions();
    }
  };
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 font-semibold text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2"/>
          Add Transaction
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                    <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
                ) : transactions.map(t => (
                    <tr key={t.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{t.description}</td>
                        <td className={`px-6 py-4 whitespace-nowrap font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(t.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{t.categories?.name || 'Uncategorized'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => openModal(t)} className="text-primary-600 hover:text-primary-900 mr-4">Edit</button>
                            <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
            </div>
             <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" step="0.01"/>
            </div>
             <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
            </div>
             <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Category</label>
                <select name="category_id" id="category_id" value={formData.category_id} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                    <option value="">Select a category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
            </div>
            <div className="flex justify-end pt-4">
                <button type="button" onClick={closeModal} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Cancel</button>
                <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Save</button>
            </div>
        </form>
      </Modal>
    </div>
  );
};
