// src/App.jsx
import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, setDoc, onSnapshot, collection, query, orderBy } from "firebase/firestore";

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const [danValue, setDanValue] = useState(0);
  const [driValue, setDriValue] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  const [history, setHistory] = useState([]);
  const [metaValue, setMetaValue] = useState(1000000); // meta Total

  // 🔹 Autenticação por senha
  const handlePasswordSubmit = () => {
    if (password === "atena") setAuthenticated(true);
    else alert("Senha incorreta!");
  };

  // 🔹 Carregar valores em tempo real
  useEffect(() => {
    const docRef = doc(db, "households", "default");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDanValue(data.danValue || 0);
        setDriValue(data.driValue || 0);
        setTotalValue((data.danValue || 0) + (data.driValue || 0));
      }
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Carregar histórico em tempo real
  useEffect(() => {
    const colRef = collection(db, "households", "history");
    const q = query(colRef, orderBy("date"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(data);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Atualizar valores Dan/Dri
  const updateValues = async (dan, dri) => {
    await setDoc(doc(db, "households", "default"), {
      danValue: Number(dan),
      driValue: Number(dri),
      totalValue: Number(dan) + Number(dri),
      date: new Date().toISOString()
    });
  };

  // 🔹 Calcula cor da barra de status
  const getStatusColor = () => {
    if (totalValue >= metaValue) return "bg-green-500";
    if (totalValue >= metaValue * 0.8) return "bg-orange-500";
    return "bg-red-500";
  };

  if (!authenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white shadow-md rounded p-6 w-80">
          <h2 className="text-lg font-bold mb-4 text-center">Digite a senha</h2>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full mb-3"
          />
          <button
            onClick={handlePasswordSubmit}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">💰 1 Milhão Grande</h1>

      {/* Valores editáveis */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block font-semibold text-blue-800">Dan</label>
          <input
            type="number"
            value={danValue}
            onChange={(e) => { setDanValue(e.target.value); updateValues(e.target.value, driValue); }}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block font-semibold text-purple-600">Dri</label>
          <input
            type="number"
            value={driValue}
            onChange={(e) => { setDriValue(e.target.value); updateValues(danValue, e.target.value); }}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block font-semibold">Total</label>
          <input
            type="number"
            value={totalValue}
            readOnly
            className="border p-2 rounded w-full bg-gray-100"
          />
        </div>
      </div>

      {/* Barra de status */}
      <div className="h-6 w-full bg-gray-300 rounded mb-6">
        <div
          className={`${getStatusColor()} h-6 rounded`}
          style={{ width: `${Math.min((totalValue / metaValue) * 100, 100)}%` }}
        ></div>
      </div>

      {/* Histórico editável */}
      <h2 className="font-semibold mb-2">Histórico (editável)</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Mês/Ano</th>
              <th className="border px-2 py-1">Dan R$</th>
              <th className="border px-2 py-1">Dri R$</th>
              <th className="border px-2 py-1">Total R$</th>
              <th className="border px-2 py-1">Meta R$</th>
            </tr>
          </thead>
          <tbody>
            {history.map((line, idx) => (
              <tr key={line.id}>
                <td className="border px-2 py-1">{line.date}</td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    value={line.dan}
                    onChange={(e) => {
                      const newLine = { ...line, dan: Number(e.target.value), total: Number(e.target.value) + Number(line.dri) };
                      setDoc(doc(db, "households", "history", line.id), newLine);
                    }}
                    className="border p-1 w-full"
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    value={line.dri}
                    onChange={(e) => {
                      const newLine = { ...line, dri: Number(e.target.value), total: Number(line.dan) + Number(e.target.value) };
                      setDoc(doc(db, "households", "history", line.id), newLine);
                    }}
                    className="border p-1 w-full"
                  />
                </td>
                <td className="border px-2 py-1">{line.total}</td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    value={line.meta}
                    onChange={(e) => {
                      const newLine = { ...line, meta: Number(e.target.value) };
                      setDoc(doc(db, "households", "history", line.id), newLine);
                    }}
                    className="border p-1 w-full"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
