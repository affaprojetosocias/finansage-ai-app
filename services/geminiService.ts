
import { GoogleGenAI } from "@google/genai";
import { type Transaction } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateFinancialInsights = async (transactions: Transaction[], income: number, expenses: number): Promise<string> => {
  if (transactions.length === 0) {
    return "Not enough data to generate insights. Please add more transactions.";
  }

  const transactionsSummary = transactions
    .map(t => `${t.date}: ${t.description} (${t.type}) - $${t.amount.toFixed(2)}`)
    .join('\n');

  const prompt = `
    You are a friendly and expert financial advisor named FinanSage.
    Based on the user's financial data for the past month, provide personalized and actionable insights.
    The tone should be encouraging, clear, and helpful. Avoid financial jargon.
    Structure your response in Markdown with the following sections:
    
    ### 📊 Financial Snapshot
    - A brief summary of their total income vs. expenses.
    
    ### 💡 Personalized Saving Tips
    - Provide 3-5 specific saving tips based on their spending patterns. For example, if they spend a lot on 'Dining Out', suggest cooking at home more often.
    
    ### 💰 Budgeting Advice
    - Analyze their spending categories and suggest a simple budget allocation (e.g., 50% needs, 30% wants, 20% savings).
    
    ### ⭐ A Positive Insight
    - Find something positive in their spending (e.g., "Great job on keeping your 'Shopping' expenses low this month!") and offer encouragement.

    Here is the user's financial data:
    - Total Income: $${income.toFixed(2)}
    - Total Expenses: $${expenses.toFixed(2)}
    - Transaction List:
    ${transactionsSummary}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating financial insights:", error);
    return "Sorry, I couldn't generate insights at the moment. Please try again later.";
  }
};
