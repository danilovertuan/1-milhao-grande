import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, orderBy, query } from "firebase/firestore";

export default function Home({ user }) {
  const [totalDan, setTotalDan] = useState(0);
  const [totalDri, setTotalDri] = useState(0);
  const [myTarget, setMyTarget] = useState(780000);
  const [herTarget, setHerTarget] = useState(220000);
  const [monthlyReturn, setMonthlyReturn] = useState(1);
  const [monthsGoal, setMonthsGoal] = useState(34);
  const [danMonthlyInvest, setDanMonthlyInvest] = useState(0);
  const [driMonthlyInvest, setDriMonthlyInvest] = useState(0);

  const [history, setHistory] = useState([]);
  const [projection, setProjection] = useState([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const q = query(
        collection(db, "households", "default", "entries"),
        orderBy("date", "desc")
      );
      const snapshot = await getDocs(q);
      const entries = snapshot.docs.map(doc => doc.data());
      setHistory(entries);
      // Somar totais
      const sumDan = entries.reduce((acc, e) => acc + Number(e.danValue || 0), 0);
      const sumDri = entries.reduce((acc, e) => acc + Number(e.driValue || 0), 0);
      setTotalDan(sumDan);
      setTotalDri(sumDri);
    };
    load();
  }, [user]);

  // Atualiza projeção sempre que valores mudam
  useEffect(() => {
    let dan = totalDan;
    let dri = totalDri;
    const proj = [];
    for (let i = 1; i <= monthsGoal; i++) {
      dan = dan * (1 + monthlyReturn / 100) + Number(danMonthlyInvest);
      dri = dri * (1 + monthlyReturn / 100) + Number(driMonthlyInvest);
      proj.push({
        month: i,
        dan: Math.round(dan),
        dri: Math.round(dri),
        total: Math.round(dan + dri),
      });
    }
    setProjection(proj);
  }, [totalDan, totalDri, monthlyReturn, monthsGoal, danMonthlyInvest, driMonthlyInvest]);

  const saveTotal = async () => {
    if (!user) return;
    const data = {
      danValue: Number(totalDan),
      driValue: Number(totalDri),
      danMonthlyInvest: Number(danMonthlyInvest),
      driMonthlyInvest: Number(driMonthlyInvest),
      date: new Date().toISOString(),
    };
    await addDoc(collection(db, "households", "default", "entries"), data);
    setHistory([data, ...history]);
  };

  const danRemaining = myTarget - totalDan;
  const driRemaining = herTarget - totalDri;
  const jointRemaining = (myTarget + herTarget) - (totalDan + totalDri);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">💰 1 Milhão Grande</h1>

      {/* Valores Totais */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="font-semibold mb-2">Valores Totais</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-blue-800 font-semibold">Dan</label>
            <input
              type="number"
              value={totalDan}
              onChange={(e) => setTotalDan(Number(e.target.value))}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block text-purple-600 font-semibold">Dri</label>
            <input
              type="number"
              value={totalDri}
              onChange={(e) => setTotalDri(Number(e.target.value))}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        <div className="mt-2">
          <label>Aporte Mensal Dan</label>
          <input
            type="number"
            value={danMonthlyInvest}
            onChange={(e) => setDanMonthlyInvest(Number(e.target.value))}
            className="border p-2 rounded w-full"
          />
          <label>Aporte Mensal Dri</label>
          <input
            type="number"
            value={driMonthlyInvest}
            onChange={(e) => setDriMonthlyInvest(Number(e.target.value))}
            className="border p-2 rounded w-full"
          />
        </div>

        <button
          onClick={saveTotal}
          className="mt-3 px-4 py-2 bg-green-600 text-white rounded"
        >
          Salvar Valores
        </button>
      </div>

      {/* Status */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="font-semibold mb-2">Situação Atual</h2>
        <p className="text-blue-800">Dan restante: R$ {danRemaining.toLocaleString()}</p>
        <p className="text-purple-600">Dri restante: R$ {driRemaining.toLocaleString()}</p>
        <p>Total conjunto: R$ {(totalDan + totalDri).toLocaleString()}</p>
        <p>Restante conjunto: R$ {jointRemaining.toLocaleString()}</p>
      </div>

      {/* Projeção */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="font-semibold mb-2">Projeção ({monthsGoal} meses)</h2>
        <ul className="space-y-1 max-h-64 overflow-y-auto">
          {projection.map((p) => (
            <li key={p.month} className="text-sm">
              Mês {p.month}: <span className="text-blue-800">Dan R$ {p.dan.toLocaleString()}</span> | <span className="text-purple-600">Dri R$ {p.dri.toLocaleString()}</span> | Total R$ {p.total.toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

