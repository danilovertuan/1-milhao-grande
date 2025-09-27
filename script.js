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

function updateTotal() {
  const dan = parseFloat(document.getElementById("dan").value) || 0;
  const dri = parseFloat(document.getElementById("dri").value) || 0;
  document.getElementById("total").value = dan + dri;
}

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

async function carregarHistorico() {
  const snapshot = await db.collection("valores").orderBy("data", "desc").limit(10).get();
  const historico = document.getElementById("historico");
  historico.innerHTML = "";
  snapshot.forEach(doc => {
    const data = new Date(doc.data().data).toLocaleDateString();
    historico.innerHTML += `<li>${data}: Dan R$${doc.data().dan} | Dri R$${doc.data().dri} | Total R$${doc.data().total}</li>`;
  });
}
