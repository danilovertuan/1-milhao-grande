import React, { useState } from "react";

export default function App() {
  const [senha, setSenha] = useState("");
  const [liberado, setLiberado] = useState(false);

  const checkSenha = () => {
    if (senha === "atena") {
      setLiberado(true);
    } else {
      alert("Senha incorreta");
    }
  };

  if (!liberado) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <h2>Digite a senha</h2>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button onClick={checkSenha}>Entrar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>💰 1 Milhão Grande</h1>
      <p>Bem-vindo! O app está funcionando 🚀</p>
    </div>
  );
}
