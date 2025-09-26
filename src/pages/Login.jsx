import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onUnlock }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const handle = (e) => {
    e.preventDefault();
    if (pwd === "atena") {
      setErr("");
      onUnlock();
      navigate("/", { replace: true });
    } else {
      setErr("Senha incorreta");
    }
  };
  return (
    <div style={{ maxWidth:420, margin:"0 auto" }}>
      <h2>Digite a senha</h2>
      <form onSubmit={handle} className="col">
        <input className="input" type="password" placeholder="Senha" value={pwd} onChange={(e)=>setPwd(e.target.value)} />
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-primary" type="submit">Entrar</button>
        </div>
        {err && <div style={{ color:"#dc2626", marginTop:8 }}>{err}</div>}
      </form>
    </div>
  );
}
