// src/App.jsx
import { useState } from "react";

function App() {
  const [senha, setSenha] = useState("");
  const [acesso, setAcesso] = useState(false);

  function validarSenha() {
    if (senha === "atena") {
      setAcesso(true);
    } else {
      alert("Senha incorreta!");
    }
  }

  if (!acesso) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Digite a senha</h1>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button onClick={validarSenha}>Entrar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Bem-vindo ao 1 Milhão Grande 🚀</h1>
      <p>Aqui vai o resto do app...</p>
    </div>
  );
}

export default App;
