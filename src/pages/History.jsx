import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query, doc, updateDoc } from "firebase/firestore";

export default function History({ user }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const q = query(
        collection(db, "households", "default", "entries"),
        orderBy("date", "desc")
      );
      const snapshot = await getDocs(q);
      // Filtra apenas meses >= Set/2025
      const entries = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(e => new Date(e.date) >= new Date("2025-09-01"));
      setHistory(entries);
    };
    load();
  }, [user]);

  const updateEntry = (index, field, value) => {
    const updated = [...history];
    updated[index][field] = value;
    setHistory(updated);
  };

  const saveEntry = async (index) => {
    const entry = history[index];
    const ref = doc(db, "households", "default", "entries", entry.id);
    await updateDoc(ref, {
      danValue: Number(entry.danValue),
      driValue: Number(entry.driValue),
      danMonthlyInvest: Number(entry.danMonthlyInvest),
      driMonthlyInvest: Number(entry.driMonthlyInvest),
      date: entry.date
    });
    alert("Registro salvo!");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">📅 Histórico Mensal</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Mês/Ano</th>
            <th>Dan</th>
            <th>Dri</th>
            <th>Aporte Dan</th>
            <th>Aporte Dri</th>
            <th>Salvar</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry, index) => (
            <tr key={entry.id} className="border-t">
              <td>
                <input
                  type="month"
                  value={new Date(entry.date).toISOString().slice(0, 7)}
                  onChange={(e) => updateEntry(index, "date", e.target.value + "-01")}
                  className="border p-1 rounded w-full"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={entry.danValue}
                  onChange={(e) => updateEntry(index, "danValue", Number(e.target.value))}
                  className="border p-1 rounded w-full"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={entry.driValue}
                  onChange={(e) => updateEntry(index, "driValue", Number(e.target.value))}
                  className="border p-1 rounded w-full"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={entry.danMonthlyInvest}
                  onChange={(e) => updateEntry(index, "danMonthlyInvest", Number(e.target.value))}
                  className="border p-1 rounded w-full"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={entry.driMonthlyInvest}
                  onChange={(e) => updateEntry(index, "driMonthlyInvest", Number(e.target.value))}
                  className="border p-1 rounded w-full"
                />
              </td>
              <td>
                <button
                  onClick={() => saveEntry(index)}
                  className="px-2 py-1 bg-green-600 text-white rounded"
                >
                  Salvar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

