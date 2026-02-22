import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import PriceChart from '../components/PriceChart';
import RefreshButton from '../components/RefreshButton';
import Skeleton from '../components/Skeleton';
import AddTransactionModal from '../components/AddTransactionModal';

const AssetDetails = () => {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [price, setPrice] = useState(0);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Get Live Price
            const pricesRes = await api.get('/exchanges/prices');
            const currentPrice = pricesRes.data[symbol] || 0;
            setPrice(currentPrice);

            // 2. Get Exchange Data
            const keysRes = await api.get('/exchanges/keys');
            let exchangeBalance = 0;
            let mergedTrades = [];

            for (const key of keysRes.data) {
                try {
                    // Balances
                    const balanceRes = await api.get(`/exchanges/${key.exchange.name}/balances`);
                    exchangeBalance += balanceRes.data[symbol] || 0;

                    // Trades
                    const tradesRes = await api.get(`/exchanges/${key.exchange.name}/trades`);
                    const mappedTrades = tradesRes.data.map(t => ({
                        id: t.id,
                        type: t.isBuyer ? 'Buy' : 'Sell',
                        asset: t.symbol.replace('USDT', ''),
                        amount: t.qty,
                        price: t.price,
                        value: t.quoteQty,
                        date: new Date(t.time).toLocaleString(),
                        status: 'Completed',
                        rawTime: t.time,
                        source: 'exchange'
                    }));
                    mergedTrades = [...mergedTrades, ...mappedTrades];
                } catch (e) {
                    console.error(e);
                }
            }

            // 3. Get Manual Data
            let manualBalance = 0;
            try {
                const manualRes = await api.get('/manual');
                const manualTrades = manualRes.data
                    .filter(t => t.symbol === symbol)
                    .map(t => {
                        const amount = t.amount;
                        if (t.type === 'BUY' || t.type === 'DEPOSIT') {
                            manualBalance += amount;
                        } else {
                            manualBalance -= amount;
                        }
                        return {
                            id: `man-${t.id}`,
                            type: t.type.charAt(0) + t.type.slice(1).toLowerCase(),
                            asset: t.symbol,
                            amount: t.amount,
                            price: t.price || 0,
                            value: (t.amount * (t.price || 0)),
                            date: new Date(t.date).toLocaleString(),
                            status: 'Completed',
                            rawTime: new Date(t.date).getTime(),
                            source: 'manual'
                        };
                    });
                mergedTrades = [...mergedTrades, ...manualTrades];
            } catch (e) {
                console.error("Failed to fetch manual transactions", e);
            }

            setBalance(exchangeBalance + manualBalance);

            // Filter for this asset (already filtered for manual above) and sort
            const assetTrades = mergedTrades
                .filter(t => t.asset === symbol)
                .sort((a, b) => b.rawTime - a.rawTime);

            setTransactions(assetTrades);

        } catch (err) {
            console.error("Error fetching asset details", err);
        } finally {
            setLoading(false);
        }
    }, [symbol]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEdit = (tx) => {
        setSelectedTransaction(tx);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this manual transaction?")) return;
        try {
            const rawId = id.toString().replace('man-', '');
            await api.delete(`/manual/${rawId}`);
            fetchData();
        } catch (error) {
            console.error("Failed to delete transaction", error);
        }
    };

    const handleTransactionSaved = () => {
        fetchData();
        setSelectedTransaction(null);
    };

    const totalValue = balance * price;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors gap-2 mb-4 font-medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-baseline gap-3">
                            <h1 className="text-4xl font-bold text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:to-slate-400 dark:bg-clip-text transition-colors">{symbol}</h1>
                            {loading ? <Skeleton className="h-8 w-32" /> : (
                                <span className="text-2xl text-slate-500 dark:text-slate-400 font-medium transition-colors">₹{price.toLocaleString()}</span>
                            )}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Asset Details & History</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setSelectedTransaction(null);
                                setIsModalOpen(true);
                            }}
                            className="bg-primary hover:bg-primary-dark dark:hover:bg-emerald-400 text-white dark:text-black font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md dark:shadow-lg shadow-primary/20 dark:shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-0.5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Asset
                        </button>
                        <RefreshButton onClick={fetchData} isLoading={loading} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-50 dark:bg-card p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
                    <h3 className="text-slate-500 dark:text-slate-400 mb-2 font-medium transition-colors">My Holdings</h3>
                    {loading ? <Skeleton className="h-8 w-24" /> : (
                        <p className="text-3xl font-bold text-slate-800 dark:text-white transition-colors">{balance.toLocaleString()} {symbol}</p>
                    )}
                </div>
                <div className="bg-slate-50 dark:bg-card p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
                    <h3 className="text-slate-500 dark:text-slate-400 mb-2 font-medium transition-colors">Total Value</h3>
                    {loading ? <Skeleton className="h-8 w-32" /> : (
                        <p className="text-3xl font-bold text-primary transition-colors">
                            ₹{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    )}
                </div>
                <div className="bg-slate-50 dark:bg-card p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
                    <h3 className="text-slate-500 dark:text-slate-400 mb-2 font-medium transition-colors">Total Trades</h3>
                    {loading ? <Skeleton className="h-8 w-16" /> : (
                        <p className="text-3xl font-bold text-slate-800 dark:text-white transition-colors">{transactions.length}</p>
                    )}
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-card rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm dark:shadow-none mb-12 transition-colors duration-300">
                <div className="h-[450px]">
                    <PriceChart symbol={symbol} />
                </div>
            </div>

            <div className="glass-panel overflow-hidden border-slate-200 dark:border-white/10 transition-colors">
                <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-transparent transition-colors">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white transition-colors">Transaction History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-100 dark:bg-white/5 transition-colors">
                            <tr className="text-left text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider transition-colors">
                                <th className="p-5 pl-8 font-medium">Type</th>
                                <th className="p-5 font-medium">Amount</th>
                                <th className="p-5 font-medium">Price</th>
                                <th className="p-5 font-medium">Value</th>
                                <th className="p-5 font-medium">Date</th>
                                <th className="p-5 text-center font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="p-5 pl-8"><Skeleton className="h-5 w-12" /></td>
                                        <td className="p-5"><Skeleton className="h-5 w-20" /></td>
                                        <td className="p-5"><Skeleton className="h-5 w-20" /></td>
                                        <td className="p-5"><Skeleton className="h-5 w-24" /></td>
                                        <td className="p-5"><Skeleton className="h-5 w-32" /></td>
                                        <td className="p-5 text-center"><Skeleton className="h-5 w-16 mx-auto" /></td>
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-500 dark:text-slate-400 transition-colors py-20">
                                        No transactions found for {symbol}.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-200 group">
                                        <td className="p-5 pl-8">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${t.type === 'Buy' || t.type === 'Deposit' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                                                }`}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className="p-5 font-bold text-slate-800 dark:text-white transition-colors">{t.amount.toLocaleString()} {t.asset}</td>
                                        <td className="p-5 text-slate-500 dark:text-slate-400 transition-colors">₹{t.price.toLocaleString()}</td>
                                        <td className="p-5 font-bold text-slate-800 dark:text-white transition-colors">₹{t.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="p-5 text-sm text-slate-600 dark:text-slate-300 font-medium transition-colors">{t.date}</td>
                                        <td className="p-5 text-center">
                                            {t.source === 'manual' && (
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(t)} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-all" title="Edit">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-100 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-lg transition-all" title="Delete">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTransactionAdded={handleTransactionSaved}
                initialData={selectedTransaction}
            />
        </div>
    );
};

export default AssetDetails;
