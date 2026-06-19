import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { GoogleSignInButton } from "./GoogleSignInButton";

export function AuthPage() {
    const { login, register, loginWithGoogle } = useAuth();
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

    const [mode, setMode] = useState<"login" | "register">("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            if (mode === "register") {
                await register(name.trim(), email.trim(), password);
            } else {
                await login(email.trim(), password);
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                (mode === "login" ? "Invalid email or password." : "Registration failed.");
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleCredential = async (credential: string) => {
        setError(null);
        setIsLoading(true);
        try {
            await loginWithGoogle(credential);
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Google sign-in failed.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = () => {
        setMode((m) => (m === "login" ? "register" : "login"));
        setError(null);
        setName("");
        setEmail("");
        setPassword("");
    };

    return (
        <div className="min-h-screen w-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-sm"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 mb-4">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="font-display text-3xl font-black tracking-tight text-slate-900 uppercase">
                        taskManage
                    </h1>
                    <p className="text-xs text-slate-400 font-mono mt-1 tracking-wider">
                        {mode === "login" ? "Sign in to your account" : "Create a new account"}
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <AnimatePresence mode="wait">
                        <motion.form
                            key={mode}
                            initial={{ opacity: 0, x: mode === "register" ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: mode === "register" ? -20 : 20 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            {mode === "register" && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            autoFocus
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        autoFocus={mode === "login"}
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2"
                                    >
                                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="cursor-pointer w-full h-10 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : mode === "login" ? (
                                    "Sign In"
                                ) : (
                                    "Create Account"
                                )}
                            </button>
                        </motion.form>
                    </AnimatePresence>

                    <div className="my-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-300">
                        <span className="h-px flex-1 bg-slate-200" />
                        <span>Or use Google</span>
                        <span className="h-px flex-1 bg-slate-200" />
                    </div>

                    <GoogleSignInButton
                        clientId={googleClientId}
                        onCredential={handleGoogleCredential}
                        disabled={isLoading}
                    />

                    <p className="text-center text-xs text-slate-400 mt-5">
                        {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                        <button
                            type="button"
                            onClick={switchMode}
                            className="cursor-pointer text-slate-900 font-semibold hover:text-indigo-600 transition-colors"
                        >
                            {mode === "login" ? "Register" : "Sign in"}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
