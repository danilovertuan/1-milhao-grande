import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Meta from "./pages/Meta";

const STORAGE_KEY = "milhao_grande_app_state_v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function App() {
  // global app state
  const saved = loadState() || {};
  const [locked, setLocked] = useState(saved.locked ?? true); // locked = require password
  const [meta, setMeta] = useState(saved.meta ?? {
    initialDan: 0,
    initialDri: 0,
    monthlyReturnPct: 1,
    aporteDan: 0,
    aporteDri: 0
  });
  const [history, setHistory] = useState(saved.history ?? generateInitialHistory()); // array of 30 rows
  // history rows: { id, mm_aa: "09/25", dan: number, dri: number, total: number, meta: number }

  // persist on change
  useEffect(() => {
    saveState({ locked, meta, history });
  }, [locked, meta, history]);

  // helper: generate 30 months starting 09/2025 (mm/aa)
  function generateInitialHistory() {
    const start = new Date(2025, 8, 1); // September 2025 (month index 8)
    const arr = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yy = String(d.getFullYear()).slice(2);
      arr.push({
        id: i + 1,
        mm_aa: `${mm}/${yy}`,
        dan: 0,
        dri: 0,
        total: 0,
        meta: 0
      });
    }
    return arr;
  }

  // recalc totals for each history row (total = dan + dri) and compute meta column from meta params
  useEffect(() => {
    // compute meta series from meta params
    const series = [];
    let dan = Number(meta.initialDan || 0);
    let dri = Number(meta.initialDri || 0);
    const r = Number(meta.monthlyReturnPct || 0) / 100;
    const aDan = Number(meta.aporteDan || 0);
    const aDri = Number(meta.aporteDri || 0);
    for (let i = 0; i < history.length; i++) {
      // first row meta uses formula from previous (so we assume initial is starting point before first month)
      dan = (dan + aDan) * (1 + r);
      dri = (dri + aDri) * (1 + r);
      series.push(Math.round(dan + dri));
    }

    setHistory(prev => prev.map((row, idx) => {
      const danNum = Number(row.dan || 0);
      const driNum = Number(row.dri || 0);
      return {
        ...row,
        total: Math.round(danNum + driNum),
        meta: series[idx] ?? 0
      };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.initialDan, meta.initialDri, meta.monthlyReturnPct, meta.aporteDan, meta.aporteDri]); // recalc only when meta params change

  return (
    <Router>
      <div className="container">
        <div className="topbar">
          <div>
            <strong>💰 1 Milhão Grande</strong>
            <div className="small">Painel privado (senha)</div>
          </div>
          <div className="navlinks">
            {!locked && (
              <>
                <Link to="/">Dashboard</Link>
                <Link to="/history">Histórico</Link>
                <Link to="/meta">Meta</Link>
              </>
            )}
          </div>
          <div>
            {!locked ? (
              <button className="btn btn-ghost" onClick={() => setLocked(true)}>Bloquear</button>
            ) : (
              <></>
            )}
          </div>
        </div>

        <div className="card">
          <Routes>
            <Route path="/login" element={<Login onUnlock={() => setLocked(false)} />} />
            <Route path="/"
              element={locked ? <Navigate to="/login" replace /> :
                <Dashboard history={history} setHistory={setHistory} meta={meta} /> } />
            <Route path="/history"
              element={locked ? <Navigate to="/login" replace /> :
                <History rows={history} setRows={setHistory} />} />
            <Route path="/meta"
              element={locked ? <Navigate to="/login" replace /> :
                <Meta meta={meta} setMeta={setMeta} />} />
            <Route path="*" element={<Navigate to={locked ? "/login" : "/"} replace />} />
          </Routes>
        </div>

        <div className="footer-note small">Dados salvos no navegador. Faça backup copiando o JSON do localStorage se quiser.</div>
      </div>
    </Router>
  );
}
