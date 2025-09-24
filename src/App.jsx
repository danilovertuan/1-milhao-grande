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
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";

// 🔹 COLE AQUI SUA CONFIG DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyD92OfyBzYu-2KboRR9Jw4X8rFzniJEFzk",
  authDomain: "milho-grande-e189a.firebaseapp.com",
  projectId: "milho-grande-e189a",
  storageBucket: "milho-grande-e189a.firebasestorage.app",
  messagingSenderId: "825882602807",
  appId: "1:825882602807:web:c8f2578567e74a1881beb2",
  measurementId: "G-4JNE738GL7"
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

  const [myValue, setMyValue] = useState("");
  const [herValue, setHerValue] = useState("");
  const [myMonthlyInvest, setMyMonthlyInvest] = useState("");
  const [herMonthlyInvest, setHerMonthlyInvest] = useState("");
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
      myValue: Number(myValue),
      herValue: Number(herValue),
      myMonthlyInvest: Number(myMonthlyInvest),
      herMonthlyInvest: Number(herMonthlyInvest),
      date: new Date().toISOString(),
    };
    await addDoc(collection(db, "households", "default", "entries"), data);
    setHistory([data, ...history]);
    setMyValue("");
    setHerValue("");
  };

  // 🔹 Cálculos
  const total = history.length
    ? history[0].myValue + history[0].herValue
    : 0;
  const myRemaining = myTarget - (history[0]?.myValue || 0);
  const herRemaining = herTarget - (history[0]?.herValue || 0);
  const jointTarget = myTarget + herTarget;
  const jointRemaining = jointTarget - total;

  // 🔹 Estimativa de crescimento com aportes + rendimento
  const estimateProjection = () => {
    let months = monthsGoal;
    let proj = [];
    let m = history[0]?.myValue || 0;
    let h = history[0]?.herValue || 0;

    for (let i = 1; i <= months; i++) {
      m = m * (1 + monthlyReturn / 100) + Number(myMonthlyInvest || 0);
      h = h * (1 + monthlyReturn / 100) + Number(herMonthlyInvest || 0);
      proj.push({
        month: i,
        my: Math.round(m),
        her: Math.round(h),
        total: Math.round(m + h),
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
          <input
            type="number"
            value={myTarget}
            onChange={(e) => setMyTarget(e.target.value)}
            className="border p-2 rounded"
            placeholder="Minha meta"
          />
          <input
            type="number"
            value={herTarget}
            onChange={(e) => setHerTarget(e.target.value)}
            className="border p-2 rounded"
            placeholder="Meta dela"
          />
          <input
            type="number"
            value={monthlyReturn}
            onChange={(e) => setMonthlyReturn(e.target.value)}
            className="border p-2 rounded"
            placeholder="% rendimento mês"
          />
          <input
            type="number"
            value={monthsGoal}
            onChange={(e) => setMonthsGoal(e.target.value)}
            className="border p-2 rounded"
            placeholder="Meses até a meta"
          />
        </div>
      </div>

      {/* Registro mensal */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="font-semibold mb-2">Registrar mês</h2>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={myValue}
            onChange={(e) => setMyValue(e.target.value)}
            className="border p-2 rounded"
            placeholder="Meu patrimônio"
          />
          <input
            type="number"
            value={herValue}
            onChange={(e) => setHerValue(e.target.value)}
            className="border p-2 rounded"
            placeholder="Patrimônio dela"
          />
          <input
            type="number"
            value={myMonthlyInvest}
            onChange={(e) => setMyMonthlyInvest(e.target.value)}
            className="border p-2 rounded"
            placeholder="Meu aporte mensal"
          />
          <input
            type="number"
            value={herMonthlyInvest}
            onChange={(e) => setHerMonthlyInvest(e.target.value)}
            className="border p-2 rounded"
            placeholder="Aporte mensal dela"
          />
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
        <p>Meu restante: R$ {myRemaining.toLocaleString()}</p>
        <p>Restante dela: R$ {herRemaining.toLocaleString()}</p>
        <p>Total conjunto: R$ {total.toLocaleString()}</p>
        <p>Restante conjunto: R$ {jointRemaining.toLocaleString()}</p>
      </div>

      {/* Projeção */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="font-semibold mb-2">Projeção ({monthsGoal} meses)</h2>
        <ul className="space-y-1 max-h-64 overflow-y-auto">
          {projection.map((p) => (
            <li key={p.month} className="text-sm">
              Mês {p.month}: Eu R$ {p.my.toLocaleString()} | Ela R${" "}
              {p.her.toLocaleString()} | Total R${" "}
              {p.total.toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
