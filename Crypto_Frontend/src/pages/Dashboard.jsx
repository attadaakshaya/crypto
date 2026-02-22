import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import DominanceChart from '../components/DominanceChart';
import RecentTransactions from '../components/RecentTransactions';
import RefreshButton from '../components/RefreshButton';
import Skeleton from '../components/Skeleton';

const Dashboard = () => {
    const { user } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const [totalBalance, setTotalBalance] = useState(0);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [performance, setPerformance] = useState(null);
    const [fng, setFng] = useState(null);
    const [dominanceData, setDominanceData] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Backend Data (Portfolio)
            const [summaryRes, perfRes] = await Promise.all([
                api.get('/portfolio/summary'),
                api.get('/portfolio/performance')
            ]);

            const summaryData = summaryRes.data || [];
            const perfData = perfRes.data || { changeValue: 0, changePercent: 0 };

            // Calculate Total Balance
            const total = summaryData.reduce((acc, curr) => acc + curr.value, 0);

            setTotalBalance(total);
            setAssets(summaryData);
            setPerformance(perfData);

            // 2. External Data (Parallel)

            // Fear & Greed
            fetch('https://api.alternative.me/fng/?limit=1')
                .then(res => res.json())
                .then(data => setFng(data.data[0]))
                .catch(e => console.error("FNG Error", e));

            // Market Dominance
            fetch('https://api.coingecko.com/api/v3/global')
                .then(res => res.json())
                .then(data => {
                    const caps = data.data.market_cap_percentage;
                    // Transform: Top 4 + Others
                    const chartData = [
                        { name: 'BTC', value: caps.btc, color: '#F7931A' },
                        { name: 'ETH', value: caps.eth, color: '#627EEA' },
                        { name: 'USDT', value: caps.usdt, color: '#26A17B' },
                        { name: 'BNB', value: caps.bnb, color: '#F0B90B' },
                    ];

                    const top4Sum = caps.btc + caps.eth + caps.usdt + caps.bnb;
                    chartData.push({ name: 'Others', value: 100 - top4Sum, color: '#64748B' });

                    setDominanceData(chartData);
                })
                .catch(e => console.error("Global Data Error", e));

        } catch (err) {
            console.error("Error loading dashboard data", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:to-slate-400 dark:bg-clip-text">
                        Welcome back, {user?.name || 'Trader'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Overview of your crypto wealth</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-all shadow-sm"
                        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDarkMode ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 4.22a1 1 0 011.415 0l.708.707a1 1 0 01-1.414 1.414l-.708-.707a1 1 0 010-1.414zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-4.22 4.22a1 1 0 010 1.414l-.708.708a1 1 0 11-1.414-1.414l.707-.708a1 1 0 011.415 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-4.22a1 1 0 01-1.414 0l-.708-.708a1 1 0 011.414-1.414l.708.708a1 1 0 010 1.414zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zM7.18 7.18a1 1 0 010 1.414l-.707.708a1 1 0 11-1.415-1.414l.708-.707a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        )}
                    </button>
                    <RefreshButton onClick={fetchData} isLoading={loading} />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Balance */}
                <div className="glass-panel p-6 relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className="w-24 h-24 text-slate-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.15-1.46-3.27-3.23h1.96c.1 1.24 1.17 1.7 2.7 1.7 1.47 0 2.59-.83 2.59-2.14 0-1.47-1-1.92-3.1-2.43-2.69-.65-3.87-1.77-3.87-3.69 0-1.74 1.36-2.91 3.25-3.25V3h2.69v1.94c1.47.34 2.72 1.34 3.06 2.97h-2c-.17-1.1-1.11-1.63-2.58-1.63-1.41 0-2.31.76-2.31 1.76 0 .8.62 1.51 2.58 1.99 2.72.68 4.39 1.78 4.39 3.99 0 2.01-1.57 3.09-3.42 3.47z" /></svg>
                    </div>
                    <h3 className="text-slate-500 dark:text-slate-400 mb-2 font-medium text-sm uppercase tracking-wider">Total Balance</h3>
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-48 bg-slate-300 dark:bg-slate-800" />
                            <Skeleton className="h-4 w-24 bg-slate-300 dark:bg-slate-800" />
                        </div>
                    ) : (
                        <div>
                            <p className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight">
                                ₹{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            {performance && (
                                <div className={`flex items-center gap-2 mt-2 text-sm font-medium ${performance.changeValue >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${performance.changeValue >= 0 ? 'bg-emerald-100 dark:bg-emerald-500/10' : 'bg-rose-100 dark:bg-rose-500/10'}`}>
                                        {performance.changeValue >= 0 ?
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg> :
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                        }
                                        {Math.abs(performance.changePercent).toFixed(2)}%
                                    </span>
                                    <span className="opacity-75">
                                        ({performance.changeValue >= 0 ? '+' : '-'}₹{Math.abs(performance.changeValue).toLocaleString()})
                                    </span>
                                    <span className="text-slate-400 dark:text-slate-500 ml-auto">24h</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Top Asset */}
                <div
                    className="glass-panel p-6 relative overflow-hidden group hover:border-primary/50 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                        const top = assets.sort((a, b) => b.value - a.value)[0];
                        if (top) window.location.href = `/asset/${top.symbol}`;
                    }}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className="w-24 h-24 text-slate-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" /></svg>
                    </div>
                    <h3 className="text-slate-500 dark:text-slate-400 mb-2 font-medium text-sm uppercase tracking-wider group-hover:text-primary transition-colors">Top Asset</h3>
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-32 bg-slate-300 dark:bg-slate-800" />
                            <Skeleton className="h-4 w-20 bg-slate-300 dark:bg-slate-800" />
                        </div>
                    ) : (
                        <div>
                            <p className="text-4xl font-bold text-slate-800 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors tracking-tight">
                                {assets.length > 0 ? assets.sort((a, b) => b.value - a.value)[0].symbol : 'N/A'}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                                {assets.length > 0 ? `${((assets.sort((a, b) => b.value - a.value)[0].value / totalBalance) * 100).toFixed(1)}% of portfolio` : 'No assets'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Profit/Loss */}
                <div className="glass-panel p-6 relative overflow-hidden group hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
                    <h3 className="text-slate-500 dark:text-slate-400 mb-2 font-medium text-sm uppercase tracking-wider">Total Profit/Loss</h3>
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-40 bg-slate-300 dark:bg-slate-800" />
                            <Skeleton className="h-4 w-24 bg-slate-300 dark:bg-slate-800" />
                        </div>
                    ) : (
                        <div>
                            <p className={`text-4xl font-bold tracking-tight ${assets.reduce((acc, curr) => acc + (curr.pnl || 0), 0) >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                                {assets.reduce((acc, curr) => acc + (curr.pnl || 0), 0) >= 0 ? '+' : ''}
                                ₹{assets.reduce((acc, curr) => acc + (curr.pnl || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                                All time performance
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Market Intelligence Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Fear & Greed Card */}
                <div className="glass-panel p-6 relative overflow-hidden flex flex-col justify-between">
                    <h3 className="text-slate-500 dark:text-slate-400 mb-4 font-medium text-sm uppercase tracking-wider">Market Sentiment</h3>
                    {fng ? (
                        <div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-4xl font-bold tracking-tight ${parseInt(fng.value) > 50 ? 'text-emerald-500 dark:text-emerald-400' :
                                        parseInt(fng.value) < 30 ? 'text-rose-500 dark:text-rose-400' : 'text-amber-500 dark:text-amber-400'
                                        }`}>
                                        {fng.value_classification}
                                    </p>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1">Fear & Greed Index</p>
                                    <p className="text-xs text-slate-400 mt-4">Updated: Next Update {fng.time_until_update ? Math.round(parseInt(fng.time_until_update) / 3600) + 'h' : ''}</p>
                                </div>
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-8 ${parseInt(fng.value) > 50 ? 'border-emerald-500/30 text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5' :
                                    parseInt(fng.value) < 30 ? 'border-rose-500/30 text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/5' : 'border-amber-500/30 text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/5'
                                    }`}>
                                    {fng.value}
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 text-xs text-slate-400 flex justify-between">
                                <span>0 (Fear)</span>
                                <span>50 (Neutral)</span>
                                <span>100 (Greed)</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-32 bg-slate-300 dark:bg-slate-800" />
                            <Skeleton className="h-24 w-24 rounded-full bg-slate-300 dark:bg-slate-800 ml-auto" />
                        </div>
                    )}
                </div>

                {/* Market Dominance Card */}
                <div className="glass-panel p-6 flex flex-col min-h-[300px]">
                    <h3 className="text-slate-500 dark:text-slate-400 mb-4 font-medium text-sm w-full text-left uppercase tracking-wider">Market Dominance</h3>

                    {dominanceData.length > 0 ? (
                        <div className="flex-1 w-full min-h-0">
                            <DominanceChart data={dominanceData} />
                        </div>
                    ) : (
                        <Skeleton className="h-full w-full rounded-full bg-slate-300 dark:bg-slate-800/20" />
                    )}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                    Recent Activity
                </h3>
                <RecentTransactions />
            </div>
        </div>
    );
};

export default Dashboard;
