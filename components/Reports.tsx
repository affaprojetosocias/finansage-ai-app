
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { type AppUser, type Transaction } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface ReportsProps {
  user: AppUser;
}

const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = <T extends { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number; index: number; }>({ cx, cy, midAngle, innerRadius, outerRadius, percent }: T) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};


export const Reports: React.FC<ReportsProps> = ({ user }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('transactions')
                .select(`*, categories(name)`)
                .eq('user_id', user.id);
            
            if (error) {
                console.error('Error fetching data for reports:', error);
            } else if (data) {
                setTransactions(data as any);
            }
            setLoading(false);
        };
        fetchTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.id]);

    const { expenseByCategoryData, monthlyComparisonData } = useMemo(() => {
        const expenseData = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                const categoryName = t.categories?.name || 'Uncategorized';
                if (!acc[categoryName]) {
                    acc[categoryName] = 0;
                }
                acc[categoryName] += t.amount;
                return acc;
            }, {} as Record<string, number>);

        const pieChartData = Object.entries(expenseData).map(([name, value]) => ({ name, value }));
        
        const monthlyData = transactions.reduce((acc, t) => {
            const month = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
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
            expenseByCategoryData: pieChartData,
            monthlyComparisonData: Object.values(monthlyData).reverse()
        };

    }, [transactions]);

    if (loading) {
        return <div className="p-8 text-center">Loading reports...</div>;
    }

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Financial Reports</h1>
            
            {transactions.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-md text-center text-gray-500">
                    <h2 className="text-xl font-semibold">No Data to Display</h2>
                    <p className="mt-2">Add some transactions to see your financial reports.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-center">Expenses by Category</h2>
                        <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                                <Pie
                                    data={expenseByCategoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={150}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {expenseByCategoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-center">Income vs. Expenses</h2>
                         <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={monthlyComparisonData}>
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(tick) => `$${tick}`} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="income" name="Income" fill="#10b981" />
                                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};
