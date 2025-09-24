import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, provider } from "./firebase";
import Home from "./pages/Home";
import History from "./pages/History";
import { signInWithPopup } from "firebase/auth";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Monitorar login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Erro ao fazer login: " + error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  // Se ainda estiver carregando
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p>Carregando...</p>
      </div>
    );

  // Se usuário não estiver logado
  if (!user)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md"
        >
          Entrar com Google
        </button>
      </div>
    );

  // Usuário logado: mostrar app
  return (
    <Router>
      <nav className="p-4 bg-gray-200 flex space-x-4">
        <Link to="/">Valores Totais</Link>
        <Link to="/history">Histórico Mensal</Link>
        <button
          onClick={logout}
          className="ml-auto px-3 py-1 bg-red-500 text-white rounded"
        >
          Sair
        </button>
      </nav>

      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/history" element={<History user={user} />} />
      </Routes>
    </Router>
  );
}
