import { useState, useEffect } from "react";
import api from "../utils/api";

const Settings = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        binanceApiKey: "",
        binanceApiSecret: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        // Fetch profile data
        api
            .get("/user/profile")
            .then((res) => {
                setFormData({
                    name: res.data.name || "",
                    email: res.data.email || "",
                    binanceApiKey: res.data.binanceApiKey || "",
                    binanceApiSecret: res.data.binanceApiSecret || "",
                });
            })
            .catch((err) => console.error("Error fetching profile", err));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            await api.put("/user/profile", formData);
            setMessage({ type: "success", text: "Profile updated successfully!" });
        } catch (err) {
            setMessage({
                type: "error",
                text: "Failed to update profile. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:to-slate-400 dark:bg-clip-text transition-colors">
                    Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account and preferences</p>
            </div>

            <div className="bg-slate-50 dark:bg-card p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors duration-300">
                {message && (
                    <div
                        className={`p-4 mb-6 rounded-lg flex items-center gap-3 font-medium ${message.type === "success"
                            ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                            : "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                            }`}
                    >
                        {message.type === "success" ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Profile Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-white/10 pb-2 transition-colors">
                            Profile Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-300 shadow-inner dark:shadow-none"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-lg px-4 py-3 text-slate-500 dark:text-slate-400 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none transition-all duration-300 cursor-not-allowed"
                                    disabled
                                    title="Email cannot be changed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* API Keys Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-white/10 pb-2 flex items-center justify-between transition-colors">
                            Exchange Connections
                            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-white/5 px-2 py-1 rounded">
                                Binance Only
                            </span>
                        </h2>
                        <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg text-blue-700 dark:text-blue-300 text-sm mb-4 transition-colors">
                            <p className="flex items-center gap-2 font-medium">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Enter your Binance API keys to automatically sync your holdings.
                                Keys are stored securely.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                    Binance API Key
                                </label>
                                <input
                                    type="text"
                                    name="binanceApiKey"
                                    value={formData.binanceApiKey}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-300 font-mono shadow-inner dark:shadow-none"
                                    placeholder="Enter your public API key"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                    Binance Secret Key
                                </label>
                                <input
                                    type="password"
                                    name="binanceApiSecret"
                                    value={formData.binanceApiSecret}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-300 font-mono shadow-inner dark:shadow-none"
                                    placeholder="Enter your secret API key"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end transition-colors">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`btn-primary px-8 flex items-center gap-2 ${loading ? "opacity-70 cursor-wait" : ""
                                }`}
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 text-current"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
