import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

export default function App() {
  const [page, setPage] = useState("home"); // home | historico | meta
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Carregar histórico do Firestore
  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(collection(db, "data"), "historico");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setHistory(docSnap.data().rows);
      } else {
        // se não existe, cria 30 linhas iniciais a partir de set/25
        const rows = [];
        const start = new Date(2025, 8); // setembro 2025
        for (let i = 0; i < 30; i++) {
          const date = new Date(start);
          date.setMonth(start.getMonth() + i);
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const yy = String(date.getFullYear()).slice(-2);
          rows.push({ mes: `${mm}/${yy}`, dan: 0, dri: 0 });
        }
        setHistory(rows);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // 🔹 Salvar no Firestore
  const saveHistory = async () => {
    await setDoc(doc(collection(db, "data"), "historico"), { rows: history });
    alert("Histórico salvo!");
  };

  // 🔹 Cálculo Total
  const totalDan = history.reduce((acc, r) => acc + Number(r.dan || 0), 0);
  const totalDri = history.reduce((acc, r) => acc + Number(r.dri || 0), 0);
  const total = totalDan + totalDri;

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Menu */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setPage("home")} className="px-3 py-2 bg-blue-500 text-white rounded">Home</button>
        <button onClick={() => setPage("historico")} className="px-3 py-2 bg-green-500 text-white rounded">Histórico</button>
      </div>

      {/* Página Home */}
      {page === "home" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white shadow rounded text-center">
            <h2 className="text-blue-800 font-bold">Dan</h2>
            <p className="text-xl">R$ {totalDan.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-white shadow rounded text-center">
            <h2 className="text-purple-600 font-bold">Dri</h2>
            <p className="text-xl">R$ {totalDri.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-white shadow rounded text-center">
            <h2 className="font-bold">Total</h2>
            <p className="text-xl">R$ {total.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Página Histórico */}
      {page === "historico" && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Histórico (30 meses)</h2>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-1">Mês</th>
                <th className="border p-1 text-blue-800">Dan (R$)</th>
                <th className="border p-1 text-purple-600">Dri (R$)</th>
                <th className="border p-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, idx) => (
                <tr key={idx}>
                  <td className="border p-1">{row.mes}</td>
                  <td className="border p-1">
                    <input
                      type="number"
                      value={row.dan}
                      onChange={(e) => {
                        const newHist = [...history];
                        newHist[idx].dan = Number(e.target.value);
                        setHistory(newHist);
                      }}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="number"
                      value={row.dri}
                      onChange={(e) => {
                        const newHist = [...history];
                        newHist[idx].dri = Number(e.target.value);
                        setHistory(newHist);
                      }}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="border p-1 text-center">
                    R$ {(Number(row.dan) + Number(row.dri)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={saveHistory}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded"
          >
            Salvar histórico
          </button>
        </div>
      )}
    </div>
  );
}
