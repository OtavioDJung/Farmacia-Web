// ===================================================
// CONFIGURAÇÃO DA API (banco de dados)
// ===================================================
// Quando você criar o backend, é só alterar esta URL.
// Exemplo: "http://localhost:3000/medicamentos"
// ou a URL do seu servidor em produção.
const API = "http://localhost:3000/medicamentos";

// Lista de medicamentos (vem do banco de dados)
let medicamentos = [];

// ===================================================
// CARREGAR MEDICAMENTOS DO BANCO
// ===================================================
async function carregar() {
    try {
        const resposta = await fetch(API);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os medicamentos");
        }

        medicamentos = await resposta.json();
        renderizarTabela();

    } catch (erro) {
        console.error(erro);
        alert("Não consegui conectar com o servidor.\nVerifique se o backend está rodando.");
    }
}

// ===================================================
// CADASTRAR NOVO MEDICAMENTO
// ===================================================
async function cadastrar() {
    const nome = document.getElementById("nome").value.trim();
    const lote = document.getElementById("lote").value.trim();
    const quantidade = document.getElementById("quantidade").value.trim();
    const validade = document.getElementById("validade").value;
    const preco = document.getElementById("preco").value.trim();
    const fornecedor = document.getElementById("fornecedor").value.trim();

    // Validação simples
    if (!nome || !lote || !quantidade || !validade || !preco || !fornecedor) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        const resposta = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome,
                lote,
                quantidade: Number(quantidade),
                validade,
                preco: Number(preco),
                fornecedor
            })
        });

        if (!resposta.ok) {
            throw new Error("Erro ao cadastrar o medicamento");
        }

        limparFormulario();
        await carregar(); // Atualiza a lista depois de salvar

    } catch (erro) {
        console.error(erro);
        alert("Ocorreu um erro ao cadastrar o medicamento.");
    }
}

// ===================================================
// REMOVER MEDICAMENTO
// ===================================================
async function remover(id) {
    const confirmar = confirm("Tem certeza que deseja remover este medicamento?");

    if (!confirmar) return;

    try {
        // A URL já inclui o ID → /medicamentos/123
        const resposta = await fetch(`${API}/${id}`, {
            method: "DELETE"
        });

        if (!resposta.ok) {
            throw new Error("Erro ao remover o medicamento");
        }

        await carregar(); // Atualiza a lista

    } catch (erro) {
        console.error(erro);
        alert("Não foi possível remover o medicamento.");
    }
}

// ===================================================
// RENDERIZAR A TABELA
// ===================================================
function renderizarTabela(lista = medicamentos) {
    const tabela = document.getElementById("tabelaMedicamentos");
    tabela.innerHTML = "";

    if (lista.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="7">Nenhum medicamento cadastrado ainda.</td>
            </tr>
        `;
        atualizarInfo();
        return;
    }

    lista.forEach(medicamento => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const validade = criarDataLocal(medicamento.validade);
        validade.setHours(0, 0, 0, 0);

        const diasRestantes = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
        let classe = "";

        if (validade < hoje) {
            classe = "vencido";
        } else if (diasRestantes <= 30) {
            classe = "proximo";
        }

        tabela.innerHTML += `
            <tr class="${classe}">
                <td>${medicamento.nome}</td>
                <td>${medicamento.lote}</td>
                <td>${medicamento.quantidade}</td>
                <td>${formatarData(medicamento.validade)}</td>
                <td>R$ ${Number(medicamento.preco).toFixed(2)}</td>
                <td>${medicamento.fornecedor}</td>
                <td>
                    <button class="btn-remover" onclick="remover(${medicamento.id})">
                        Remover
                    </button>
                </td>
            </tr>
        `;
    });

    atualizarInfo();
}

// ===================================================
// FUNÇÕES AUXILIARES DE DATA
// ===================================================
function criarDataLocal(dataString) {
    const dataLimpa = String(dataString).split("T")[0];
    const [ano, mes, dia] = dataLimpa.split("-");
    return new Date(Number(ano), Number(mes) - 1, Number(dia));
}

function formatarData(data) {
    const dataLimpa = String(data).split("T")[0];
    const partes = dataLimpa.split("-");

    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ===================================================
// LIMPAR O FORMULÁRIO
// ===================================================
function limparFormulario() {
    document.getElementById("nome").value = "";
    document.getElementById("lote").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("validade").value = "";
    document.getElementById("preco").value = "";
    document.getElementById("fornecedor").value = "";
}

// ===================================================
// FILTROS
// ===================================================
function mostrarTodos() {
    renderizarTabela(medicamentos);
}

function mostrarVencidos() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const filtrados = medicamentos.filter(medicamento => {
        const validade = criarDataLocal(medicamento.validade);
        validade.setHours(0, 0, 0, 0);
        return validade < hoje;
    });

    renderizarTabela(filtrados);
}

function mostrarProximos() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const filtrados = medicamentos.filter(medicamento => {
        const validade = criarDataLocal(medicamento.validade);
        validade.setHours(0, 0, 0, 0);

        const diasRestantes = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
        return diasRestantes >= 0 && diasRestantes <= 30;
    });

    renderizarTabela(filtrados);
}

// ===================================================
// ATUALIZAR OS CARDS DE RESUMO
// ===================================================
function atualizarInfo() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let vencidos = 0;
    let proximos = 0;

    medicamentos.forEach(medicamento => {
        const validade = criarDataLocal(medicamento.validade);
        validade.setHours(0, 0, 0, 0);

        const diasRestantes = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));

        if (validade < hoje) {
            vencidos++;
        } else if (diasRestantes <= 30) {
            proximos++;
        }
    });

    // Mensagem de rodapé
    document.getElementById("info").innerHTML = `
        📦 Total: <strong>${medicamentos.length}</strong>
        | 🔴 Vencidos: <strong>${vencidos}</strong>
        | 🟠 Próximos: <strong>${proximos}</strong>
    `;

    // Cards do topo
    document.getElementById("totalCard").innerText = medicamentos.length;
    document.getElementById("vencidosCard").innerText = vencidos;
    document.getElementById("proximosCard").innerText = proximos;
}

// ===================================================
// INICIA O SISTEMA
// ===================================================
carregar();