import { motion } from "motion/react";
import { useAuth } from "./context/AuthContext";
import { AuthPage } from "./components/AuthPage";
import { Dashboard } from "./components/dashboard/Dashboard.tsx";

export default function App() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-2 border-slate-800 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return <Dashboard onLogout={logout} />;
}
