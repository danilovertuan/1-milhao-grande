import React from "react";

/**
 * Props:
 *  - rows: array
 *  - setRows: function
 *
 * Editable table: mm/aa, dan, dri, total auto, meta (from meta page)
 * Save persists to localStorage via parent.
 */
export default function History({ rows, setRows }) {

  const updateCell = (index, field, value) => {
    const updated = rows.map((r, i) => i === index ? ({ ...r, [field]: field === "mm_aa" ? value : Number(value) }) : r);
    // recalc totals
    const withTotals = updated.map(r => ({ ...r, total: Math.round(Number(r.dan || 0) + Number(r.dri || 0)) }));
    setRows(withTotals);
  };

  const addRow = () => {
    const nextId = Date.now();
    const next = [{ id: nextId, mm_aa: "mm/aa", dan: 0, dri: 0, total: 0, meta: 0 }, ...rows];
    setRows(next.slice(0, 300));
  };

  const saveAll = () => {
    alert("Alterações salvas localmente (localStorage).");
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
        <h2>Histórico Mensal (30 linhas)</h2>
        <div>
          <button className="btn btn-primary" onClick={addRow}>+ Nova linha</button>
          <button className="btn btn-ghost" style={{ marginLeft:8 }} onClick={saveAll}>Salvar</button>
        </div>
      </div>

      <div style={{ overflowX:"auto" }}>
        <table className="table">
          <thead>
            <tr><th>Data (mm/aa)</th><th>Dan (R$)</th><th>Dri (R$)</th><th>Total (R$)</th><th>Meta (R$)</th></tr>
          </thead>
          <tbody>
            {rows.slice(0,30).map((r, i) => (
              <tr key={r.id}>
                <td>
                  <input className="input" value={r.mm_aa} onChange={(e)=>updateCell(i, "mm_aa", e.target.value)} />
                </td>
                <td>
                  <input className="input" type="number" value={r.dan} onChange={(e)=>updateCell(i, "dan", e.target.value)} />
                </td>
                <td>
                  <input className="input" type="number" value={r.dri} onChange={(e)=>updateCell(i, "dri", e.target.value)} />
                </td>
                <td>{Number(r.total).toLocaleString()}</td>
                <td>{Number(r.meta).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="small" style={{ marginTop:10 }}>
        As alterações são mantidas no localStorage automaticamente (ao navegar ou recarregar). Use "Salvar" para confirmar.
      </div>
    </div>
  );
}
