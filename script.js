// ======================================================
// 📌 BLOCO GLOBAL — UTILITÁRIOS (Funciona em todo o site)
// ======================================================

/**
 * FUNÇÃO: contarPalavras
 * Resolve o bug de contar espaços vazios e tags HTML.
 * O regex /\s+/ identifica qualquer grupo de espaços como um único separador.
 */
function contarPalavras(texto) {
    if (!texto) return 0;
    
    // Convertemos para texto puro e removemos espaços do início e fim
    const textoLimpo = texto.trim();
    
    if (textoLimpo === "") return 0;

    // O split(/\s+/) evita que espaços duplos ou quebras de linha contem como palavras
    const lista = textoLimpo.split(/\s+/);
    return lista.length;
}

/**
 * FUNÇÃO: atualizarProgresso
 * Calcula a diferença entre o texto salvo e a meta estabelecida.
 */
function atualizarProgresso() {
    const textoSalvo = localStorage.getItem("textoSalvo") || "";
    const palavras = contarPalavras(textoSalvo);
    const meta = localStorage.getItem("metaPalavras");
    const campoProgresso = document.getElementById("progresso");

    if (!campoProgresso || !meta) return;

    const restante = meta - palavras;

    if (restante <= 0) {
        campoProgresso.textContent = "Meta atingida 🎉";
    } else {
        // Verifica se estamos na página de metas para exibir o texto completo
        if (document.getElementById("meta")) {
            campoProgresso.textContent = "Faltam " + restante + " palavras para alcançar sua meta";
        } else {
            // Na index, geralmente deixamos vazio ou apenas um aviso discreto
            campoProgresso.textContent = "Faltam " + restante + " palavras";
        }
    }
}

// ======================================================
// 📌 BLOCO 1 — EDITOR DE TEXTO (index.html)
// ======================================================

const textarea = document.getElementById("texto");
const contador = document.getElementById("contador");
const apagar = document.getElementById("apagar");
const baixar = document.getElementById("baixar");

// O zoom altera apenas a folha; o contêiner reserva seu tamanho ampliado.
const zoomSelect = document.getElementById("zoom-select");
const editorViewport = document.getElementById("editor-viewport");
const editorEspaco = document.getElementById("editor-espaco");

if (zoomSelect && textarea && editorViewport && editorEspaco) {
    function atualizarZoom() {
        const valorZoom = parseFloat(zoomSelect.value);
        const estiloViewport = getComputedStyle(editorViewport);
        const larguraFolha = editorViewport.clientWidth
            - parseFloat(estiloViewport.paddingLeft)
            - parseFloat(estiloViewport.paddingRight);

        textarea.style.setProperty("--largura-folha", `${larguraFolha}px`);
        textarea.style.transform = `scale(${valorZoom})`;
        editorEspaco.style.width = `${textarea.offsetWidth * valorZoom}px`;
        editorEspaco.style.height = `${textarea.offsetHeight * valorZoom}px`;
    }

    zoomSelect.addEventListener("change", atualizarZoom);
    window.addEventListener("resize", atualizarZoom);

    // Recalcula também quando o texto cresce, é apagado ou a janela muda.
    const observadorZoom = new ResizeObserver(atualizarZoom);
    observadorZoom.observe(textarea);
    observadorZoom.observe(editorViewport);
    atualizarZoom();
}

// Verifica se estamos na página do editor
if (textarea && contador) {

    // 💾 RECUPERAR TEXTO: Usa innerText para evitar sujeira de HTML antigo
    const salvo = localStorage.getItem("textoSalvo");
    if (salvo) {
        textarea.innerText = salvo;
        contador.textContent = "Palavras Escritas: " + contarPalavras(salvo);
    }

    // ⌨️ EVENTO DE DIGITAÇÃO
    textarea.addEventListener("input", () => {
        const textoAtual = textarea.innerText; // Pega apenas o texto puro
        
        // Atualiza o contador na tela
        contador.textContent = "Palavras Escritas: " + contarPalavras(textoAtual);

        // Salva no navegador
        localStorage.setItem("textoSalvo", textoAtual);

        // Atualiza a meta em tempo real
        atualizarProgresso();
    });

    // 🧹 BOTÃO APAGAR
    if (apagar) {
        apagar.addEventListener("click", () => {
            if (confirm("Tem certeza que deseja apagar todo o seu progresso?")) {
                localStorage.removeItem("textoSalvo");
                textarea.innerText = "";
                contador.textContent = "Palavras Escritas: 0";
                atualizarProgresso();
            }
        });
    }

    // 📥 BOTÃO BAIXAR: Baixa o texto limpo, sem tags HTML
    if (baixar) {
        baixar.addEventListener("click", () => {
            const blob = new Blob([textarea.innerText], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "meu-manuscrito.txt";
            link.click();
        });
    }
}

// ======================================================
// 📌 BLOCO 2 — METAS (meta.html)
// ======================================================

const inputMeta = document.getElementById("meta");
const botaoSalvarMeta = document.getElementById("salvarMeta");
const botaoResetMeta = document.getElementById("reset");

if (inputMeta && botaoSalvarMeta) {
    
    // Carrega a meta atual no campo de input ao abrir a página
    const metaSalva = localStorage.getItem("metaPalavras");
    if (metaSalva) inputMeta.value = metaSalva;

    botaoSalvarMeta.addEventListener("click", () => {
        localStorage.setItem("metaPalavras", inputMeta.value);
        alert("Meta salva com sucesso!");
        atualizarProgresso(); // Atualiza o texto de progresso na hora
    });

    if (botaoResetMeta) {
        botaoResetMeta.addEventListener("click", () => {
            if (confirm("Deseja excluir apenas a meta? Seu texto continuará salvo.")) {
                localStorage.removeItem("metaPalavras");
                inputMeta.value = "";
                location.reload();
            }
        });
    }
}

// ======================================================
// 🚀 INICIALIZAÇÃO
// ======================================================
// Garante que o progresso seja calculado assim que qualquer página carregar
window.onload = atualizarProgresso;
