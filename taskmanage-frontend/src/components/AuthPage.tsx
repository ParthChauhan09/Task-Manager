import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Mail, Lock, User, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { GoogleSignInButton } from "./GoogleSignInButton";

export function AuthPage() {
    const { login, register, loginWithGoogle } = useAuth();
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

    const [mode, setMode] = useState<"login" | "register">("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
        setShowPassword(false);
    };

    return (
        <div className="min-h-screen w-screen bg-[#F5F5F7] flex items-center justify-center p-4 font-sans select-none">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 26, stiffness: 210 }}
                className="w-full max-w-sm"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-apple-purple mb-3.5 shadow-md shadow-apple-purple/25">
                        <Check className="h-6 w-6 text-white stroke-[3px]" />
                    </div>
                    <h1 className="font-display text-2xl font-semibold tracking-tight text-[#1C1C1E]">
                        taskManage
                    </h1>
                    <p className="text-[13px] text-[#8E8E93] mt-1 font-normal">
                        {mode === "login" ? "Sign in to organize your work." : "Create an account to get started."}
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-[28px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-8">
                    <AnimatePresence mode="wait">
                        <motion.form
                            key={mode}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18, ease: "easeInOut" }}
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            {mode === "register" && (
                                <div>
                                    <label className="block text-[11px] font-medium text-[#8E8E93] mb-1.5 ml-3">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8E8E93]" />
                                        <input
                                            type="text"
                                            required
                                            autoFocus
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full border border-transparent bg-[#F5F5F7] text-[#1C1C1E] placeholder-[#8E8E93]/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-apple-purple/20 transition-all font-sans"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] font-medium text-[#8E8E93] mb-1.5 ml-3">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8E8E93]" />
                                    <input
                                        type="email"
                                        required
                                        autoFocus={mode === "login"}
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full border border-transparent bg-[#F5F5F7] text-[#1C1C1E] placeholder-[#8E8E93]/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-apple-purple/20 transition-all font-sans"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-medium text-[#8E8E93] mb-1.5 ml-3">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8E8E93]" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        minLength={6}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-2.5 text-sm rounded-full border border-transparent bg-[#F5F5F7] text-[#1C1C1E] placeholder-[#8E8E93]/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-apple-purple/20 transition-all font-sans"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#E5E5EA]/40 rounded-full transition-colors focus:outline-none cursor-pointer"
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-2 text-xs text-[#FF3B30] bg-[#FF3B30]/10 rounded-2xl px-4 py-2.5"
                                    >
                                        <AlertCircle className="h-4 w-4 shrink-0 text-[#FF3B30]" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="cursor-pointer w-full h-11 bg-apple-purple hover:bg-apple-purple-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-full transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm shadow-apple-purple/15"
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

                    <div className="my-6 flex items-center gap-3 text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider">
                        <span className="h-[1px] flex-1 bg-[#E5E5EA]" />
                        <span>Or continue with</span>
                        <span className="h-[1px] flex-1 bg-[#E5E5EA]" />
                    </div>

                    <div className="flex justify-center">
                        <GoogleSignInButton
                            clientId={googleClientId}
                            onCredential={handleGoogleCredential}
                            disabled={isLoading}
                        />
                    </div>

                    <p className="text-center text-[13px] text-[#8E8E93] mt-6">
                        {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                        <button
                            type="button"
                            onClick={switchMode}
                            className="cursor-pointer text-apple-purple font-medium hover:underline transition-colors"
                        >
                            {mode === "login" ? "Register" : "Sign in"}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
