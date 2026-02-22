import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-darker flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-light/30 dark:bg-primary/20 rounded-full blur-[120px] transition-colors" />
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[120px] transition-colors" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="glass-panel p-8 md:p-10 border-slate-200 dark:border-white/10 bg-white/70 dark:bg-black/20 backdrop-blur-xl shadow-xl dark:shadow-none transition-all">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                            <Logo className="w-12 h-12 drop-shadow-xl filter drop-shadow-[0_0_15px_rgba(0,210,255,0.5)] group-hover:scale-105 transition-transform duration-300" />
                            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-[#00d2ff] to-[#4ade80]">
                                Cryptofolio
                            </span>
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">Create Account</h2>
                        <p className="text-slate-500 dark:text-slate-400 transition-colors">Start tracking your portfolio today</p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500 px-4 py-3 rounded-lg text-sm flex items-center gap-2 font-medium transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm dark:shadow-none"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm dark:shadow-none"
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm dark:shadow-none"
                                placeholder="Create a secure password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-primary to-emerald-500 hover:from-emerald-400 hover:to-primary text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5"
                        >
                            Create Account
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-dark dark:text-primary hover:text-primary dark:hover:text-primary-glow font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
