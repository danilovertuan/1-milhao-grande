import React, { useState, useEffect } from "react";

/**
 * Meta page: edit meta params and preview first 6 months of computed meta total.
 * Props: meta, setMeta (from App)
 */
export default function Meta({ meta, setMeta }) {
  const [local, setLocal] = useState({ ...meta });

  useEffect(() => setLocal({ ...meta }), [meta]);

  const save = () => {
    setMeta({ ...local });
    alert("Parâmetros salvos. A coluna 'Meta' na planilha será atualizada automaticamente.");
  };

  // preview compute 6 months
  const preview = () => {
    const r = Number(local.monthlyReturnPct || 0) / 100;
    let dan = Number(local.initialDan || 0);
    let dri = Number(local.initialDri || 0);
    const aDan = Number(local.aporteDan || 0);
    const aDri = Number(local.aporteDri || 0);
    const arr = [];
    for (let i = 0; i < 6; i++) {
      dan = (dan + aDan) * (1 + r);
      dri = (dri + aDri) * (1 + r);
      arr.push(Math.round(dan + dri));
    }
    return arr;
  };

  const p = preview();

  return (
    <div>
      <h2>Parâmetros da Meta</h2>
      <div className="row" style={{ gap:12 }}>
        <div className="col card" style={{ flex:1 }}>
          <label>Valor inicial Dan</label>
          <input className="input" type="number" value={local.initialDan} onChange={(e)=>setLocal({...local, initialDan: Number(e.target.value)})} />
        </div>
        <div className="col card" style={{ flex:1 }}>
          <label>Valor inicial Dri</label>
          <input className="input" type="number" value={local.initialDri} onChange={(e)=>setLocal({...local, initialDri: Number(e.target.value)})} />
        </div>
      </div>

      <div style={{ marginTop:8 }} className="row">
        <div style={{ flex:1 }}>
          <label>Rendimento % mês</label>
          <input className="input" type="number" value={local.monthlyReturnPct} onChange={(e)=>setLocal({...local, monthlyReturnPct: Number(e.target.value)})} />
        </div>
        <div style={{ flex:1 }}>
          <label>Aporte mensal Dan</label>
          <input className="input" type="number" value={local.aporteDan} onChange={(e)=>setLocal({...local, aporteDan: Number(e.target.value)})} />
        </div>
        <div style={{ flex:1 }}>
          <label>Aporte mensal Dri</label>
          <input className="input" type="number" value={local.aporteDri} onChange={(e)=>setLocal({...local, aporteDri: Number(e.target.value)})} />
        </div>
      </div>

      <div style={{ marginTop:10 }}>
        <button className="btn btn-primary" onClick={save}>Salvar parâmetros</button>
      </div>

      <div style={{ marginTop:12 }}>
        <strong>Pré-visualização (6 meses)</strong>
        <ul>
          {p.map((v,i)=> <li key={i}>Mês {i+1}: R$ {v.toLocaleString()}</li>)}
        </ul>
      </div>
    </div>
  );
}
