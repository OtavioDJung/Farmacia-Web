// ===================================================
// CONFIGURAÇÃO DA API E VARIÁVEIS GLOBAIS
// ===================================================
const API = "http://localhost:8080/medicamentos";
let medicamentos = [];

let meuGraficoLucro = null;
let meuGraficoDistribuicao = null;

// ===================================================
// AUTENTICAÇÃO E SESSÃO (LOGIN / LOGOUT)
// ===================================================
function verificarSessao() {
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    const telaLogin = document.getElementById("telaLogin");
    const sistemaApp = document.getElementById("sistemaApp");
    const elemNomeUsuario = document.getElementById("nomeUsuarioLogado");

    if (usuarioLogado) {
        if (telaLogin) telaLogin.classList.add("sistema-escondido");
        if (sistemaApp) sistemaApp.classList.remove("sistema-escondido");
        if (elemNomeUsuario) elemNomeUsuario.innerText = usuarioLogado;
        carregar();
    } else {
        if (telaLogin) telaLogin.classList.remove("sistema-escondido");
        if (sistemaApp) sistemaApp.classList.add("sistema-escondido");
        limparCamposLogin();
    }
}

function fazerLogin(event) {
    if (event) event.preventDefault();

    const usuarioInput = document.getElementById("usuario");
    const senhaInput = document.getElementById("senha");

    const usuario = usuarioInput ? usuarioInput.value.trim() : "";
    const senha = senhaInput ? senhaInput.value.trim() : "";

    if (usuario !== "" && (senha === "admin" || senha === "1234")) {
        localStorage.setItem("usuarioLogado", usuario);
        verificarSessao();
        navegarPara("dashboard");
    } else {
        alert("Usuário ou senha incorretos!\nInforme um usuário válido e a senha correta (admin ou 1234).");
    }
}

function fazerLogout() {
    localStorage.removeItem("usuarioLogado");
    localStorage.clear();
    verificarSessao();
}

function limparCamposLogin() {
    const usuarioInput = document.getElementById("usuario");
    const senhaInput = document.getElementById("senha");

    if (usuarioInput) usuarioInput.value = "";
    if (senhaInput) senhaInput.value = "";
}

// ===================================================
// NAVEGAÇÃO ENTRE TELAS / ABAS
// ===================================================
function navegarPara(nomeAba) {
    document.querySelectorAll(".secao-aba").forEach(aba => {
        aba.classList.remove("aba-ativa");
    });

    document.querySelectorAll(".menu-item").forEach(btn => {
        btn.classList.remove("ativo");
    });

    if (nomeAba === "dashboard") {
        document.getElementById("abaDashboard")?.classList.add("aba-ativa");
        document.getElementById("btnNavDashboard")?.classList.add("ativo");
        renderizarGraficos();
    } else if (nomeAba === "cadastrar") {
        document.getElementById("abaCadastrar")?.classList.add("aba-ativa");
        document.getElementById("btnNavCadastrar")?.classList.add("ativo");
        renderizarUltimosCadastrados();
    } else if (nomeAba === "estoque") {
        document.getElementById("abaEstoque")?.classList.add("aba-ativa");
        document.getElementById("btnNavEstoque")?.classList.add("ativo");
    }
}

// ===================================================
// CARREGAR MEDICAMENTOS DA API
// ===================================================
async function carregar() {
    try {
        const resposta = await fetch(API);

        if (!resposta.ok) {
            console.warn("Erro ao obter dados da API.");
            medicamentos = [];
            renderizarTabela();
            return;
        }

        medicamentos = await resposta.json();
        renderizarTabela();

    } catch (erro) {
        console.error("Erro de conexão:", erro);
        medicamentos = [];
        renderizarTabela();
    }
}

// ===================================================
// CADASTRAR MEDICAMENTO (SALVA O USUÁRIO LOGADO)
// ===================================================
async function cadastrar() {
    const nome = document.getElementById("nome")?.value.trim();
    const lote = document.getElementById("lote")?.value.trim();
    const quantidade = document.getElementById("quantidade")?.value.trim();
    const validade = document.getElementById("validade")?.value;
    const preco = document.getElementById("preco")?.value.trim();
    const fornecedor = document.getElementById("fornecedor")?.value.trim();

    const usuarioCadastrou = localStorage.getItem("usuarioLogado") || "Sistema";

    if (!nome || !lote || !quantidade || !validade || !preco || !fornecedor) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const quantidadeNumero = Number(quantidade);
    if (!Number.isInteger(quantidadeNumero) || quantidadeNumero < 0) {
        alert("A quantidade deve ser um número inteiro maior ou igual a zero.");
        return;
    }

    const precoNumero = Number(preco);
    if (isNaN(precoNumero) || precoNumero < 0) {
        alert("O preço deve ser um valor maior ou igual a zero.");
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
                quantidade: quantidadeNumero,
                validade,
                preco: precoNumero,
                fornecedor,
                usuario: usuarioCadastrou
            })
        });

        if (!resposta.ok) {
            alert("Erro ao cadastrar o medicamento.");
            return;
        }

        limparFormulario();
        await carregar();
        renderizarUltimosCadastrados();

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
        const resposta = await fetch(`${API}/${id}`, {
            method: "DELETE"
        });

        if (!resposta.ok) {
            alert("Erro ao remover o medicamento.");
            return;
        }

        await carregar();

    } catch (erro) {
        console.error(erro);
        alert("Não foi possível remover o medicamento.");
    }
}

// ===================================================
// RENDERIZAR TABELA DE ESTOQUE
// ===================================================
function renderizarTabela(lista = medicamentos) {
    const tabela = document.getElementById("tabelaMedicamentos");
    if (!tabela) return;

    tabela.innerHTML = "";

    if (!lista || lista.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px;">
                    Nenhum medicamento cadastrado ainda.
                </td>
            </tr>
        `;
        atualizarInfo();
        renderizarUltimosCadastrados();
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
                <td><strong class="tag-usuario"><i class="fa-solid fa-user-check"></i> ${medicamento.usuario || 'Sistema'}</strong></td>
                <td>${medicamento.nome}</td>
                <td>${medicamento.lote}</td>
                <td>${medicamento.quantidade}</td>
                <td>${formatarData(medicamento.validade)}</td>
                <td>R$ ${Number(medicamento.preco).toFixed(2)}</td>
                <td>${medicamento.fornecedor}</td>
                <td>
                    <button class="btn-remover" onclick="remover(${medicamento.id})">
                        <i class="fa-solid fa-trash"></i> Remover
                    </button>
                </td>
            </tr>
        `;
    });

    atualizarInfo();
    renderizarUltimosCadastrados();
}

// ===================================================
// RENDERIZAR ÚLTIMOS CADASTRADOS (TELA DE CADASTRO)
// ===================================================
function renderizarUltimosCadastrados() {
    const tabela = document.getElementById("tabelaUltimosCadastrados");
    if (!tabela) return;

    tabela.innerHTML = "";

    if (!medicamentos || medicamentos.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 15px;">
                    Nenhum medicamento cadastrado recentemente.
                </td>
            </tr>
        `;
        return;
    }

    const ultimos = [...medicamentos].reverse().slice(0, 5);

    ultimos.forEach(item => {
        tabela.innerHTML += `
            <tr>
                <td><strong class="tag-usuario"><i class="fa-solid fa-user-check"></i> ${item.usuario || 'Sistema'}</strong></td>
                <td>${item.nome}</td>
                <td>${item.lote}</td>
                <td>${item.quantidade}</td>
                <td>${formatarData(item.validade)}</td>
                <td>R$ ${Number(item.preco).toFixed(2)}</td>
                <td>${item.fornecedor}</td>
            </tr>
        `;
    });
}

// ===================================================
// DATAS & AUXILIARES
// ===================================================
function criarDataLocal(dataString) {
    if (!dataString) return new Date();
    const dataLimpa = String(dataString).split("T")[0];
    const [ano, mes, dia] = dataLimpa.split("-");
    return new Date(Number(ano), Number(mes) - 1, Number(dia));
}

function formatarData(data) {
    if (!data) return "";
    const dataLimpa = String(data).split("T")[0];
    const partes = dataLimpa.split("-");
    if (partes.length !== 3) return data;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function limparFormulario() {
    if (document.getElementById("nome")) document.getElementById("nome").value = "";
    if (document.getElementById("lote")) document.getElementById("lote").value = "";
    if (document.getElementById("quantidade")) document.getElementById("quantidade").value = "";
    if (document.getElementById("validade")) document.getElementById("validade").value = "";
    if (document.getElementById("preco")) document.getElementById("preco").value = "";
    if (document.getElementById("fornecedor")) document.getElementById("fornecedor").value = "";
}

// ===================================================
// FILTROS DE ESTOQUE
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
// CÁLCULOS E DASHBOARD
// ===================================================
function atualizarInfo() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let vencidos = 0;
    let proximos = 0;
    let valorPerdido = 0;
    let valorRisco = 0;

    medicamentos.forEach(medicamento => {
        const validade = criarDataLocal(medicamento.validade);
        validade.setHours(0, 0, 0, 0);
        const diasRestantes = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));

        const quantidade = Number(medicamento.quantidade) || 0;
        const preco = Number(medicamento.preco) || 0;
        const valorTotal = quantidade * preco;

        if (validade < hoje) {
            vencidos++;
            valorPerdido += valorTotal;
        } else if (diasRestantes >= 0 && diasRestantes <= 30) {
            proximos++;
            valorRisco += valorTotal;
        }
    });

    const dinheiro = valor => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    // Atualiza a nova barra de resumo em linha na aba Estoque
    if (document.getElementById("totalEstoqueResumo")) document.getElementById("totalEstoqueResumo").innerText = medicamentos.length;
    if (document.getElementById("vencidosEstoqueResumo")) document.getElementById("vencidosEstoqueResumo").innerText = vencidos;
    if (document.getElementById("proximosEstoqueResumo")) document.getElementById("proximosEstoqueResumo").innerText = proximos;
    if (document.getElementById("valorPerdidoEstoqueResumo")) document.getElementById("valorPerdidoEstoqueResumo").innerText = dinheiro(valorPerdido);
    if (document.getElementById("valorRiscoEstoqueResumo")) document.getElementById("valorRiscoEstoqueResumo").innerText = dinheiro(valorRisco);

    // Atualiza os cards do Dashboard
    if (document.getElementById("totalCard")) document.getElementById("totalCard").innerText = medicamentos.length;
    if (document.getElementById("vencidosCard")) document.getElementById("vencidosCard").innerText = vencidos;
    if (document.getElementById("proximosCard")) document.getElementById("proximosCard").innerText = proximos;
    if (document.getElementById("valorPerdidoCard")) document.getElementById("valorPerdidoCard").innerText = dinheiro(valorPerdido);
    if (document.getElementById("valorRiscoCard")) document.getElementById("valorRiscoCard").innerText = dinheiro(valorRisco);

    renderizarGraficos();
}

// ===================================================
// RENDERIZAÇÃO DE GRÁFICOS (CHART.JS)
// ===================================================
function renderizarGraficos() {
    const ctxLucro = document.getElementById("graficoLucro")?.getContext("2d");
    const ctxDist = document.getElementById("graficoDistribuicao")?.getContext("2d");

    if (!ctxLucro || !ctxDist) return;

    if (meuGraficoLucro) meuGraficoLucro.destroy();
    if (meuGraficoDistribuicao) meuGraficoDistribuicao.destroy();

    let valorEstoqueValido = 0;
    let valorEmRisco = 0;
    let valorPerdido = 0;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    medicamentos.forEach(med => {
        const val = criarDataLocal(med.validade);
        val.setHours(0, 0, 0, 0);
        const dias = Math.ceil((val - hoje) / (1000 * 60 * 60 * 24));
        const subtotal = (Number(med.quantidade) || 0) * (Number(med.preco) || 0);

        if (val < hoje) {
            valorPerdido += subtotal;
        } else if (dias <= 30) {
            valorEmRisco += subtotal;
        } else {
            valorEstoqueValido += subtotal;
        }
    });

    const estimativaLucro = valorEstoqueValido * 0.35;

    meuGraficoLucro = new Chart(ctxLucro, {
        type: 'bar',
        data: {
            labels: ['Estoque Ativo', 'Lucro Estimado (35%)', 'Valor em Risco', 'Prejuízo Realizado'],
            datasets: [{
                label: 'Valor (R$)',
                data: [valorEstoqueValido, estimativaLucro, valorEmRisco, valorPerdido],
                backgroundColor: [
                    'rgba(37, 99, 235, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });

    meuGraficoDistribuicao = new Chart(ctxDist, {
        type: 'doughnut',
        data: {
            labels: ['Em Dia', 'A Vencer (30d)', 'Vencidos'],
            datasets: [{
                data: [valorEstoqueValido, valorEmRisco, valorPerdido],
                backgroundColor: ['#2563eb', '#f97316', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// ===================================================
// EXPORTAÇÕES GLOBAIS E ARRANQUE
// ===================================================
window.fazerLogin = fazerLogin;
window.fazerLogout = fazerLogout;
window.navegarPara = navegarPara;
window.cadastrar = cadastrar;
window.remover = remover;
window.mostrarTodos = mostrarTodos;
window.mostrarVencidos = mostrarVencidos;
window.mostrarProximos = mostrarProximos;

document.addEventListener("DOMContentLoaded", () => {
    verificarSessao();
    navegarPara("dashboard");
});