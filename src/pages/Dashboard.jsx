import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Dashboard shows:
 * - Dan (editable) -> takes last non-zero dan from history on mount
 * - Dri (editable) -> same
 * - Total (computed)
 * - Status bar: color + months to reach 1M using meta params from App (passed via props)
 *
 * Props:
 *  - history: rows array
 *  - setHistory: setter to persist changes to history when saving from dashboard
 *  - meta: passed from App
 */
export default function Dashboard({ history, setHistory, meta }) {
  const [dan, setDan] = useState(0);
  const [dri, setDri] = useState(0);
  const [monthsNeeded, setMonthsNeeded] = useState(null);

  useEffect(() => {
    // find most recent non-zero by parsing rows from last to first
    for (let i = history.length - 1; i >= 0; i--) {
      const r = history[i];
      if (Number(r.dan) > 0) { setDan(Number(r.dan)); break; }
    }
    for (let i = history.length - 1; i >= 0; i--) {
      const r = history[i];
      if (Number(r.dri) > 0) { setDri(Number(r.dri)); break; }
    }
  }, [history]);

  const total = Math.round(Number(dan || 0) + Number(dri || 0));

  // compute months needed to reach >=1_000_000 using meta params (starting from current total)
  useEffect(() => {
    const target = 1000000;
    const r = Number(meta.monthlyReturnPct || 1) / 100;
    const aDan = Number(meta.aporteDan || 0);
    const aDri = Number(meta.aporteDri || 0);
    let vDan = Number(dan || 0);
    let vDri = Number(dri || 0);
    let months = 0;
    while (months < 240 && (vDan + vDri) < target) {
      vDan = (vDan + aDan) * (1 + r);
      vDri = (vDri + aDri) * (1 + r);
      months++;
    }
    setMonthsNeeded(months >= 240 ? null : months);
  }, [dan, dri, meta]);

  // status color logic:
  // if total >= 1_000_000 -> green
  // else if total >= 0.9 * 1_000_000 -> orange
  // else red
  const statusColor = total >= 1000000 ? "#16a34a" : (total >= 900000 ? "#f97316" : "#dc2626");
  const fillPct = Math.min(100, Math.round((total / 1000000) * 100));

  const saveTotalsToHistory = () => {
    // push a new entry at top with current month (use first empty row if exists)
    const newRow = {
      id: Date.now(),
      mm_aa: new Date().toISOString().slice(5,7) + "/" + new Date().getFullYear().toString().slice(2),
      dan: Number(dan),
      dri: Number(dri),
      total: Number(dan)+Number(dri),
      meta: history[0]?.meta ?? 0
    };
    const next = [newRow, ...history];
    // keep only latest 30 if you want; here we'll keep all but Dashboard uses most recent
    setHistory(next.slice(0, 300));
    alert("Valores gravados no histórico (temporário). Para persistir permanentemente, use a página Histórico e 'Salvar' lá.");
  };

  return (
    <div>
      <div className="row" style={{ justifyContent:"space-between", alignItems:"flex-start" }}>
        <div className="col card" style={{ flex:1 }}>
          <label className="small badge-dan">Dan</label>
          <div className="kv">{Number(dan).toLocaleString()}</div>
          <input className="input" type="number" value={dan} onChange={(e)=>setDan(Number(e.target.value))} />
        </div>

        <div className="col card" style={{ flex:1 }}>
          <label className="small badge-dri">Dri</label>
          <div className="kv">{Number(dri).toLocaleString()}</div>
          <input className="input" type="number" value={dri} onChange={(e)=>setDri(Number(e.target.value))} />
        </div>

        <div className="col card" style={{ flex:1 }}>
          <label className="small">Total</label>
          <div className="kv">{total.toLocaleString()}</div>
          <div className="small">Soma automática</div>
        </div>
      </div>

      <div style={{ marginTop:14 }} className="card">
        <div style={{ marginBottom:8 }}><strong>Progresso até R$ 1.000.000</strong></div>
        <div className="status-bar" style={{ background:"#e5e7eb" }}>
          <div className="status-fill" style={{ width: `${fillPct}%`, background: statusColor }}>
            {fillPct}% • {monthsNeeded === null ? "muitos meses" : `${monthsNeeded} meses`} 
          </div>
        </div>
        <div className="small" style={{ marginTop:8 }}>
          <span style={{ marginRight:12 }}>Meta: R$ 1.000.000</span>
          <Link to="/meta" className="small">Editar parâmetros (Meta)</Link>
        </div>

        <div style={{ marginTop:12 }}>
          <button className="btn btn-primary" onClick={saveTotalsToHistory}>Salvar rápido no histórico</button>
          <Link to="/history"><button className="btn btn-ghost" style={{ marginLeft:8 }}>Ir para Histórico</button></Link>
        </div>
      </div>
    </div>
  );
}
