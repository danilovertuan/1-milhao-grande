// 🔹 Config Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_ID",
  appId: "SEU_APP_ID"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

// 🔹 Login
function checkSenha() {
  const senha = document.getElementById("senha").value;
  if (senha === "atena") {
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";
    carregarUltimosValores();
  } else {
    alert("Senha incorreta!");
  }
}

// 🔹 Atualiza total e barra de status
function updateTotal() {
  const dan = parseFloat(document.getElementById("dan").value) || 0;
  const dri = parseFloat(document.getElementById("dri").value) || 0;
  const total = dan + dri;
  document.getElementById("total").value = total;

  // Barra de status
  const barra = document.getElementById("barraStatus");
  if(total >= 1000000) barra.style.background = "green";
  else if(total >= 800000) barra.style.background = "orange";
  else barra.style.background = "red";
  barra.style.width = Math.min((total/1000000)*100, 100) + "%";

  // Estimativa de meses
  const aporteDan = dan; // aqui você pode usar aporte mensal real
  const aporteDri = dri;
  const rendimento = 1; // % ao mês
  let meses = 0;
  let saldo = total;

  while (saldo < 1000000 && meses < 120) {
    saldo = saldo * (1 + rendimento/100) + aporteDan + aporteDri;
    meses++;
  }
  document.getElementById("mesesMeta").innerText = meses;
}

// 🔹 Salvar valores no Firestore
async function salvar() {
  const dan = parseFloat(document.getElementById("dan").value) || 0;
  const dri = parseFloat(document.getElementById("dri").value) || 0;
  await db.collection("valores").add({
    dan,
    dri,
    total: dan + dri,
    data: new Date().toISOString()
  });
  carregarHistorico();
}

// 🔹 Carregar últimos valores
async function carregarUltimosValores() {
  const snapshot = await db.collection("valores").orderBy("data", "desc").limit(1).get();
  if (!snapshot.empty) {
    const doc = snapshot.docs[0].data();
    document.getElementById("dan").value = doc.dan;
    document.getElementById("dri").value = doc.dri;
    updateTotal();
  }
  carregarHistorico();
}

// 🔹 Carregar histórico (últimos 30 registros)
async function carregarHistorico() {
  const snapshot = await db.collection("valores").orderBy("data", "desc").limit(30).get();
  const tbody = document.querySelector("#historico tbody");
  tbody.innerHTML = "";
  snapshot.forEach(doc => {
    const d = new Date(doc.data().data).toLocaleDateString();
    tbody.innerHTML += `<tr>
      <td>${d}</td>
      <td>${doc.data().dan}</td>
      <td>${doc.data().dri}</td>
      <td>${doc.data().total}</td>
    </tr>`;
  });
}
