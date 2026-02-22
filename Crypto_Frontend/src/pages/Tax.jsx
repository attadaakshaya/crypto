import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Tax = () => {
    const { user } = useAuth();
    const [year, setYear] = useState(new Date().getFullYear());
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTaxReport();
    }, [year]);

    const fetchTaxReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/tax/report?year=${year}`);
            setReport(response.data);
        } catch (err) {
            console.error('Error fetching tax report:', err);
            setError('Failed to load tax report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex justify-between items-center bg-slate-50 dark:bg-card p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:to-slate-400 dark:bg-clip-text transition-colors">
                        Tax Hints
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Estimate your realized gains and losses</p>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-slate-600 dark:text-slate-400 font-medium transition-colors">Tax Year:</span>
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-medium shadow-sm dark:shadow-none"
                    >
                        {[...Array(5)].map((_, i) => {
                            const y = new Date().getFullYear() - i;
                            return <option key={y} value={y}>{y}</option>
                        })}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 rounded-xl border border-red-200 dark:border-red-500/20 font-medium transition-colors">
                    {error}
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-slate-50 dark:bg-card rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2 transition-colors">Total Realized PnL</h3>
                            <p className={`text-4xl font-bold ${report?.totalRealizedPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} transition-colors`}>
                                {formatCurrency(report?.totalRealizedPnl || 0)}
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-card rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2 transition-colors">Taxable Events</h3>
                            <p className="text-4xl font-bold text-slate-800 dark:text-white transition-colors">
                                {report?.events?.length || 0}
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-card rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2 transition-colors">Details</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
                                This report uses FIFO (First-In, First-Out) method to calculate realized gains/losses from your manual transaction history.
                            </p>
                        </div>
                    </div>

                    {/* Events Table */}
                    <div className="glass-panel overflow-hidden border-slate-200 dark:border-white/10 transition-colors">
                        <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-transparent transition-colors">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white transition-colors">Taxable Events</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-100 dark:bg-white/5 transition-colors">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Asset</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Type</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Amount Sold</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Realized PnL</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                                    {report?.events?.length > 0 ? (
                                        report.events.map((event, index) => (
                                            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium transition-colors">
                                                    {formatDate(event.date)}
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-white transition-colors">
                                                    {event.symbol}
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-current transition-colors">
                                                        {event.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-sm text-right text-slate-600 dark:text-slate-300 font-medium transition-colors">
                                                    {event.amount}
                                                </td>
                                                <td className={`px-6 py-5 whitespace-nowrap text-sm text-right font-bold ${event.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} transition-colors`}>
                                                    {formatCurrency(event.pnl)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-slate-500 dark:text-slate-400 transition-colors">
                                                No taxable events found for this year.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Tax;
