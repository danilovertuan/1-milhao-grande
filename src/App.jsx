import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";

// 🔹 COLE AQUI SUA CONFIG DO FIREBASE
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJECT.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [myTarget, setMyTarget] = useState(780000);
  const [herTarget, setHerTarget] = useState(220000);
  const [monthlyReturn, setMonthlyReturn] = useState(1); // em %
  const [monthsGoal, setMonthsGoal] = useState(34); // 2 anos e 10 meses

  const [danValue, setDanValue] = useState("");
  const [driValue, setDriValue] = useState("");
  const [danMonthlyInvest, setDanMonthlyInvest] = useState("");
  const [driMonthlyInvest, setDriMonthlyInvest] = useState("");
  const [history, setHistory] = useState([]);

  // 🔹 Login/Logout
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  // 🔹 Carregar histórico
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const q = query(
        collection(db, "households", "default", "entries"),
        orderBy("date", "desc")
      );
      const snapshot = await getDocs(q);
      setHistory(snapshot.docs.map((doc) => doc.data()));
    };
    load();
  }, [user]);

  // 🔹 Salvar valores mensais
  const saveValues = async () => {
    if (!user) return;
    const data = {
      danValue: Number(danValue),
      driValue: Number(driValue),
      danMonthlyInvest: Number(danMonthlyInvest),
      driMonthlyInvest: Number(driMonthlyInvest),
      date: new Date().toISOString(),
    };
    await addDoc(collection(db, "households", "default", "entries"), data);
    setHistory([data, ...history]);
    setDanValue("");
    setDriValue("");
  };

  // 🔹 Cálculos
  const total =
    Number(history[0]?.danValue || 0) + Number(history[0]?.driValue || 0);
  const danRemaining = myTarget - (history[0]?.danValue || 0);
  const driRemaining = herTarget - (history[0]?.driValue || 0);
  const jointTarget = myTarget + herTarget;
  const jointRemaining = jointTarget - total;

  // 🔹 Estimativa de crescimento com aportes + rendimento
  const estimateProjection = () => {
    let months = monthsGoal;
    let proj = [];
    let dan = history[0]?.danValue || 0;
    let dri = history[0]?.driValue || 0;

    for (let i = 1; i <= months; i++) {
      dan = dan * (1 + monthlyReturn / 100) + Number(danMonthlyInvest || 0);
      dri = dri * (1 + monthlyReturn / 100) + Number(driMonthlyInvest || 0);
      proj.push({
        month: i,
        dan: Math.round(dan),
        dri: Math.round(dri),
        total: Math.round(dan + dri),
      });
    }
    return proj;
  };

  const projection = estimateProjection();

  // 🔹 UI
  if (!user)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <button
          onClick={login}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md"
        >
          Entrar com Google
        </button>
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">💰 1 Milhão Grande</h1>
        <button
          onClick={logout}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Sair
        </button>
      </div>

      {/* Configurações */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="font-semibold mb-2">Configurações</h2>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm">Meta Dan</label>
            <input
              type="number"
              value={myTarget}
              onChange={(e) => setMyTarget(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm">Meta DRI</label>
            <input
              type="number"
              value={herTarget}
              onChange={(e) => setHerTarget(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm">% Rendimento/mês</label>
            <input
              type="number"
              value={monthlyReturn}
              onChange={(e) => setMonthlyReturn(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm">Meses até a meta</label>
            <input
              type="number"
              value={monthsGoal}
              onChange={(e) => setMonthsGoal(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>
      </div>

      {/* Registro mensal */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="font-semibold mb-2">Registrar mês</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-blue-800 font-semibold">Dan</label>
            <input
              type="number"
              value={danValue}
              onChange={(e) => setDanValue(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1 text-purple-600 font-semibold">DRI</label>
            <input
              type="number"
              value={driValue}
              onChange={(e) => setDriValue(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1 text-blue-800 font-semibold">Aporte Dan</label>
            <input
              type="number"
              value={danMonthlyInvest}
              onChange={(e) => setDanMonthlyInvest(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1 text-purple-600 font-semibold">Aporte DRI</label>
            <input
              type="number"
              value={driMonthlyInvest}
              onChange={(e) => setDriMonthlyInvest(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>
        <button
          onClick={saveValues}
          className="mt-3 px-4 py-2 bg-green-600 text-white rounded"
        >
          Salvar
        </button>
      </div>

      {/* Status atual */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="font-semibold mb-2">Situação atual</h2>
        <p className="text-blue-800">Dan restante: R$ {danRemaining.toLocaleString()}</p>
        <p className="text-purple-600">DRI restante: R$ {driRemaining.toLocaleString()}</p>
        <p>Total conjunto: R$ {total.toLocaleString()}</p>
        <p>Restante conjunto: R$ {jointRemaining.toLocaleString()}</p>
      </div>

      {/* Projeção */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="font-semibold mb-2">Projeção ({monthsGoal} meses)</h2>
        <ul className="space-y-1 max-h-64 overflow-y-auto">
          {projection.map((p) => (
            <li key={p.month} className="text-sm">
              Mês {p.month}: <span className="text-blue-800">Dan R$ {p.dan.toLocaleString()}</span> | <span className="text-purple-600">DRI R$ {p.dri.toLocaleString()}</span> | Total R$ {p.total.toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
