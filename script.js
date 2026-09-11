const API = "http://localhost:3000/medicamentos";
let medicamentos = [];

async function carregar() {
    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error("Erro ao carregar");
        medicamentos = await res.json();
        renderizarTabela();
    } catch (erro) {
        console.error(erro);
        alert("Erro ao conectar com o servidor.\nVerifique se o backend está rodando.");
    }
}

async function cadastrar() {
    const nome = document.getElementById("nome").value.trim();
    const lote = document.getElementById("lote").value.trim();
    const quantidade = document.getElementById("quantidade").value.trim();
    const validade = document.getElementById("validade").value;
    const preco = document.getElementById("preco").value.trim();
    const fornecedor = document.getElementById("fornecedor").value.trim();

    if (!nome || !lote || !quantidade || !validade || !preco || !fornecedor) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        const res = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome,
                lote,
                quantidade: Number(quantidade),
                validade,
                preco: Number(preco),
                fornecedor
            })
        });

        if (!res.ok) throw new Error("Erro ao cadastrar");

        limparFormulario();
        await carregar();
    } catch (erro) {
        console.error(erro);
        alert("Erro ao cadastrar medicamento.");
    }
}

async function remover(id) {
    if (!confirm("Deseja remover este medicamento?")) return;

    try {
        const res = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Erro ao remover");
        await carregar();
    } catch (erro) {
        console.error(erro);
        alert("Erro ao remover medicamento.");
    }
}

function renderizarTabela(lista = medicamentos) {
    const tabela = document.getElementById("tabelaMedicamentos");
    tabela.innerHTML = "";

    if (lista.length === 0) {
        tabela.innerHTML = `<tr><td colspan="7">Nenhum medicamento cadastrado.</td></tr>`;
        atualizarInfo();
        return;
    }

    lista.forEach(m => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const validade = criarDataLocal(m.validade);
        validade.setHours(0, 0, 0, 0);

        const dias = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
        let classe = "";

        if (validade < hoje) classe = "vencido";
        else if (dias <= 30) classe = "proximo";

        tabela.innerHTML += `
            <tr class="${classe}">
                <td>${m.nome}</td>
                <td>${m.lote}</td>
                <td>${m.quantidade}</td>
                <td>${formatarData(m.validade)}</td>
                <td>R$ ${Number(m.preco).toFixed(2)}</td>
                <td>${m.fornecedor}</td>
                <td>
                    <button class="btn-remover" onclick="remover(${m.id})">Remover</button>
                </td>
            </tr>
        `;
    });

    atualizarInfo();
}

function criarDataLocal(dataString) {
    const dataLimpa = String(dataString).split("T")[0];
    const partes = dataLimpa.split("-");
    return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

function formatarData(data) {
    const dataLimpa = String(data).split("T")[0];
    const partes = dataLimpa.split("-");
    if (partes.length !== 3) return data;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function limparFormulario() {
    document.getElementById("nome").value = "";
    document.getElementById("lote").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("validade").value = "";
    document.getElementById("preco").value = "";
    document.getElementById("fornecedor").value = "";
}

function mostrarTodos() {
    renderizarTabela(medicamentos);
}

function mostrarVencidos() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const filtrados = medicamentos.filter(m => {
        const validade = criarDataLocal(m.validade);
        validade.setHours(0, 0, 0, 0);
        return validade < hoje;
    });

    renderizarTabela(filtrados);
}

function mostrarProximos() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const filtrados = medicamentos.filter(m => {
        const validade = criarDataLocal(m.validade);
        validade.setHours(0, 0, 0, 0);
        const dias = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
        return dias >= 0 && dias <= 30;
    });

    renderizarTabela(filtrados);
}

function atualizarInfo() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let vencidos = 0;
    let proximos = 0;

    medicamentos.forEach(m => {
        const validade = criarDataLocal(m.validade);
        validade.setHours(0, 0, 0, 0);
        const dias = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));

        if (validade < hoje) vencidos++;
        else if (dias <= 30) proximos++;
    });

    document.getElementById("info").innerHTML = `
        📦 Total: <strong>${medicamentos.length}</strong>
        | 🔴 Vencidos: <strong>${vencidos}</strong>
        | 🟠 Próximos: <strong>${proximos}</strong>
    `;

    document.getElementById("totalCard").innerText = medicamentos.length;
    document.getElementById("vencidosCard").innerText = vencidos;
    document.getElementById("proximosCard").innerText = proximos;
}

// Inicia o sistema
carregar();