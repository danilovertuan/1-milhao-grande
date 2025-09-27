// 🔹 Firebase Config
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
  if(senha === "atena") {
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";
    carregarUltimosValores();
    carregarHistorico();
  } else alert("Senha incorreta!");
}

// 🔹 Navegação
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.style.display='none');
  if(page==='home') document.getElementById('homePage').style.display='block';
  if(page==='historico') document.getElementById('historicoPage').style.display='block';
  if(page==='aportes') document.getElementById('aportesPage').style.display='block';
}

// 🔹 Total e barra
function updateTotal() {
  const dan = parseFloat(document.getElementById("dan").value)||0;
  const dri = parseFloat(document.getElementById("dri").value)||0;
  const total = dan+dri;
  document.getElementById("total").value=total;

  const barra = document.getElementById("barraStatus");
  barra.style.width = Math.min((total/1000000)*100,100)+'%';
  barra.style.background = total>=1000000?'green': total>=800000?'orange':'red';

  // Meses estimados
  const aporteDan = dan; 
  const aporteDri = dri;
  const rendimento = 1;
  let saldo = total, meses=0;
  while(saldo<1000000 && meses<120){
    saldo = saldo*(1+rendimento/100) + aporteDan + aporteDri;
    meses++;
  }
  document.getElementById("mesesMeta").innerText = meses;
}

// 🔹 Salvar últimos valores
async function salvar(){
  const dan = parseFloat(document.getElementById("dan").value)||0;
  const dri = parseFloat(document.getElementById("dri").value)||0;
  await db.collection("valores").add({
    dan,dri,total:dan+dri,data:new Date().toISOString()
  });
  carregarHistorico();
}

// 🔹 Carregar último valor
async function carregarUltimosValores(){
  const snapshot = await db.collection("valores").orderBy("data","desc").limit(1).get();
  if(!snapshot.empty){
    const doc = snapshot.docs[0].data();
    document.getElementById("dan").value=doc.dan;
    document.getElementById("dri").value=doc.dri;
    updateTotal();
  }
}

// 🔹 Histórico 30 meses
function gerarHistoricoInicial(){
  const tbody=document.querySelector("#historico tbody");
  tbody.innerHTML="";
  let d = new Date(2025,8,1); // set/2025
  for(let i=0;i<30;i++){
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const aa = d.getFullYear();
    tbody.innerHTML += `<tr>
      <td>${mm}/${aa}</td>
      <td contenteditable="true">0</td>
      <td contenteditable="true">0</td>
      <td contenteditable="true">0</td>
      <td contenteditable="true">0</td>
    </tr>`;
    d.setMonth(d.getMonth()+1);
  }
}

async function carregarHistorico(){
  gerarHistoricoInicial();

  const doc = await db.collection("historico").doc("30meses").get();
  if(doc.exists){
    const dados = doc.data().dados;
    const rows = document.querySelectorAll("#historico tbody tr");
    dados.forEach((d,i)=>{
      if(rows[i]){
        rows[i].cells[1].innerText = d.dan;
        rows[i].cells[2].innerText = d.dri;
        rows[i].cells[3].innerText = d.total;
        rows[i].cells[4].innerText = d.meta;
      }
    });
  }
}

// 🔹 Salvar histórico
async function salvarHistorico(){
  const rows=document.querySelectorAll("#historico tbody tr");
  const dados=[];
  rows.forEach(r=>{
    const tds=r.querySelectorAll("td");
    dados.push({
      data: tds[0].innerText,
      dan: parseFloat(tds[1].innerText)||0,
      dri: parseFloat(tds[2].innerText)||0,
      total: parseFloat(tds[3].innerText)||0,
      meta: parseFloat(tds[4].innerText)||0
    });
  });
  await db.collection("historico").doc("30meses").set({dados});
  alert("Histórico salvo!");
}

// 🔹 Projeção 30 meses (apenas coluna Meta)
function calcularProjecao(){
  const aporteDan=parseFloat(document.getElementById("aporteDan").value)||0;
  const aporteDri=parseFloat(document.getElementById("aporteDri").value)||0;
  const mensalDan=parseFloat(document.getElementById("mensalDan").value)||0;
  const mensalDri=parseFloat(document.getElementById("mensalDri").value)||0;
  const rendimento=parseFloat(document.getElementById("rendimento").value)||1;

  const rows=document.querySelectorAll("#historico tbody tr");
  let dan=aporteDan, dri=aporteDri;

  rows.forEach(r=>{
    dan = dan*(1+rendimento/100)+mensalDan;
    dri = dri*(1+rendimento/100)+mensalDri;
    const total = dan + dri;

    const tds = r.querySelectorAll("td");
    // Preencher apenas a coluna de Meta
    tds[4].innerText = Math.round(total);
  });
}
