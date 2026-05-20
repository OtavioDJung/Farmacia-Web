/* =========================
   SALVAR NO GITHUB
========================= */

async function salvarNoGitHub() {

    try {

        // TOKEN GITHUB

        const token =
            "";

        // REPOSITÓRIO

        const owner =
            "Herculesrossi";

        const repo =
            "Ctrl-Est-Farmacia";

        const path =
            "estoque_farmacia.json";

        // BUSCAR SHA

        const respostaArquivo =
            await fetch(
                `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
                {
                    headers: {
                        Authorization:
                            `token ${token}`
                    }
                }
            );

        const arquivoAtual =
            await respostaArquivo.json();

        // CONVERTER PARA JSON

        const conteudoJSON =
            JSON.stringify(
                medicamentos,
                null,
                4
            );

        // BASE64

        const conteudoBase64 =
            btoa(
                unescape(
                    encodeURIComponent(
                        conteudoJSON
                    )
                )
            );

        // ENVIAR PARA GITHUB

        const resposta =
            await fetch(
                `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
                {
                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `token ${token}`
                    },

                    body: JSON.stringify({

                        message:
                            "Atualizando estoque automaticamente",

                        content:
                            conteudoBase64,

                        sha:
                            arquivoAtual.sha
                    })
                }
            );

        // SUCESSO

        if (resposta.ok) {

            alert(
                "GitHub atualizado com sucesso!"
            );

        } else {

            const erro =
                await resposta.json();

            console.log(erro);

            alert(
                "Erro ao atualizar GitHub"
            );
        }

    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao conectar com GitHub"
        );
    }
}

/* =========================
   IMPORTAR JSON DO GITHUB
========================= */

async function importarJSON() {

    try {

        const resposta = await fetch(
            "https://raw.githubusercontent.com/Herculesrossi/Ctrl-Est-Farmacia/master/estoque_farmacia.json"
        );

        const dados = await resposta.json();

        console.log(dados);

        let lista = [];

        // CASO JÁ SEJA ARRAY

        if (Array.isArray(dados)) {

            lista = dados;
        }

        // CASO SEJA OBJETO

        else {

            for (const chave in dados) {

                if (Array.isArray(dados[chave])) {

                    lista = dados[chave];

                    break;
                }
            }
        }

        // SEM PRODUTOS

        if (lista.length === 0) {

            alert(
                "Nenhum produto encontrado no JSON."
            );

            return;
        }

        // IMPORTAR

        medicamentos = lista.map(m => ({

            id:
                Date.now() + Math.random(),

            nome:
                m.nome ||
                m.medicamento ||
                "",

            lote:
                m.lote ||
                "",

            quantidade:
                m.quantidade ||
                m.qtd ||
                "",

            validade:
                converterDataImportada(
                    m.validade || ""
                ),

            preco:
                m.preco ||
                m.valor ||
                "",

            fornecedor:
                m.fornecedor ||
                ""
        }));

        salvar();

        renderizarTabela();

        alert(
            "Produtos importados com sucesso!"
        );

    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao importar JSON."
        );
    }
}

/* =========================
   CONVERTER DATA IMPORTADA
========================= */

function converterDataImportada(data) {

    // JÁ ESTÁ YYYY-MM-DD

    if (data.includes("-")) {

        return data;
    }

    // DD/MM/YYYY

    if (data.includes("/")) {

        const partes = data.split("/");

        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }

    return data;
}

/* =========================
   CRIAR DATA LOCAL
========================= */

function criarDataLocal(dataString) {

    const partes =
        dataString.split("-");

    const ano =
        Number(partes[0]);

    const mes =
        Number(partes[1]) - 1;

    const dia =
        Number(partes[2]);

    return new Date(
        ano,
        mes,
        dia
    );
}

/* =========================
   CADASTRAR
========================= */

function cadastrar() {

    const nome =
        document.getElementById("nome").value.trim();

    const lote =
        document.getElementById("lote").value.trim();

    const quantidade =
        document.getElementById("quantidade").value.trim();

    const validade =
        document.getElementById("validade").value;

    const preco =
        document.getElementById("preco").value.trim();

    const fornecedor =
        document.getElementById("fornecedor").value.trim();

    // VALIDAÇÃO

    if (
        !nome ||
        !lote ||
        !quantidade ||
        !validade ||
        !preco ||
        !fornecedor
    ) {

        alert(
            "Preencha todos os campos."
        );

        return;
    }

    const medicamento = {

        id: Date.now(),

        nome,
        lote,
        quantidade,
        validade,
        preco,
        fornecedor
    };

    medicamentos.push(medicamento);

    salvar();

    renderizarTabela();

    limparFormulario();
}

/* =========================
   RENDERIZAR
========================= */

function renderizarTabela(
    lista = medicamentos
) {

    const tabela =
        document.getElementById(
            "tabelaMedicamentos"
        );

    tabela.innerHTML = "";

    // SEM PRODUTOS

    if (lista.length === 0) {

        tabela.innerHTML = `

            <tr>

                <td colspan="7">

                    Nenhum medicamento cadastrado.

                </td>

            </tr>
        `;

        atualizarInfo();

        return;
    }

    lista.forEach((m) => {

        const hoje = new Date();

        hoje.setHours(0,0,0,0);

        const validade =
            criarDataLocal(m.validade);

        validade.setHours(0,0,0,0);

        const diferenca =
            validade.getTime() -
            hoje.getTime();

        const dias =
            Math.ceil(
                diferenca /
                (1000 * 60 * 60 * 24)
            );

        let classe = "";

        // VENCIDO

        if (validade < hoje) {

            classe = "vencido";
        }

        // PRÓXIMO

        else if (dias <= 30) {

            classe = "proximo";
        }

        tabela.innerHTML += `

            <tr class="${classe}">

                <td>${m.nome}</td>

                <td>${m.lote}</td>

                <td>${m.quantidade}</td>

                <td>
                    ${formatarData(m.validade)}
                </td>

                <td>
                    R$ ${Number(m.preco).toFixed(2)}
                </td>

                <td>${m.fornecedor}</td>

                <td>

                    <button
                        class="btn-remover"
                        onclick="remover(${m.id})"
                    >

                        Remover

                    </button>

                </td>

            </tr>
        `;
    });

    atualizarInfo();
}

/* =========================
   REMOVER
========================= */

function remover(id) {

    const confirmar =
        confirm(
            "Deseja remover este medicamento?"
        );

    if (!confirmar) return;

    medicamentos =
        medicamentos.filter(
            m => m.id !== id
        );

    salvar();

    renderizarTabela();
}

/* =========================
   SALVAR LOCAL
========================= */

function salvar() {

    localStorage.setItem(
        "estoqueFarmacia",
        JSON.stringify(medicamentos)
    );
}

/* =========================
   CARREGAR
========================= */

function carregar() {

    const dados =
        localStorage.getItem(
            "estoqueFarmacia"
        );

    if (dados) {

        medicamentos =
            JSON.parse(dados);
    }

    renderizarTabela();
}

/* =========================
   LIMPAR
========================= */

function limparFormulario() {

    document.getElementById("nome").value = "";

    document.getElementById("lote").value = "";

    document.getElementById("quantidade").value = "";

    document.getElementById("validade").value = "";

    document.getElementById("preco").value = "";

    document.getElementById("fornecedor").value = "";
}

/* =========================
   FILTROS
========================= */

function mostrarTodos() {

    renderizarTabela(
        medicamentos
    );
}

function mostrarVencidos() {

    const hoje = new Date();

    hoje.setHours(0,0,0,0);

    const filtrados =
        medicamentos.filter(m => {

            const validade =
                criarDataLocal(m.validade);

            validade.setHours(0,0,0,0);

            return validade < hoje;
        });

    renderizarTabela(
        filtrados
    );
}

function mostrarProximos() {

    const hoje = new Date();

    hoje.setHours(0,0,0,0);

    const filtrados =
        medicamentos.filter(m => {

            const validade =
                criarDataLocal(m.validade);

            validade.setHours(0,0,0,0);

            const diferenca =
                validade.getTime() -
                hoje.getTime();

            const dias =
                Math.ceil(
                    diferenca /
                    (1000 * 60 * 60 * 24)
                );

            return dias >= 0 &&
                   dias <= 30;
        });

    renderizarTabela(
        filtrados
    );
}

/* =========================
   ATUALIZAR INFO
========================= */

function atualizarInfo() {

    const hoje = new Date();

    hoje.setHours(0,0,0,0);

    let vencidos = 0;

    let proximos = 0;

    medicamentos.forEach(m => {

        const validade =
            criarDataLocal(m.validade);

        validade.setHours(0,0,0,0);

        const diferenca =
            validade.getTime() -
            hoje.getTime();

        const dias =
            Math.ceil(
                diferenca /
                (1000 * 60 * 60 * 24)
            );

        if (validade < hoje) {

            vencidos++;

        } else if (dias <= 30) {

            proximos++;
        }
    });

    document.getElementById("info").innerHTML = `

        📦 Total:
        <strong>${medicamentos.length}</strong>

        | 🔴 Vencidos:
        <strong>${vencidos}</strong>

        | 🟠 Próximos:
        <strong>${proximos}</strong>
    `;

    document.getElementById(
        "totalCard"
    ).innerText =
        medicamentos.length;

    document.getElementById(
        "vencidosCard"
    ).innerText =
        vencidos;

    document.getElementById(
        "proximosCard"
    ).innerText =
        proximos;
}

/* =========================
   FORMATAR DATA
========================= */

function formatarData(data) {

    if (data.includes("/")) {

        return data;
    }

    const partes =
        data.split("-");

    if (partes.length !== 3) {

        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

/* =========================
   INICIAR
========================= */

carregar();