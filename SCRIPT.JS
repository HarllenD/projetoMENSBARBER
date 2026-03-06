document.addEventListener("DOMContentLoaded", function () {

    // ================================================
    // ESTADO — agendamentos salvos no localStorage
    // ================================================
    let agendamentos = [];
    try {
        agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    } catch (e) {
        agendamentos = [];
    }

    // ================================================
    // ELEMENTOS DO DOM
    // ================================================
    const modal         = document.getElementById("modal");
    const btnAgendar    = document.getElementById("btnAgendar");
    const btnAgendarNav = document.getElementById("btnAgendarNav");
    const fechar        = document.getElementById("fechar");
    const form          = document.getElementById("formAgendamento");
    const mensagemForm  = document.getElementById("mensagemForm");
    const lista         = document.getElementById("listaAgendamentos");
    const toast         = document.getElementById("toast");
    const hamburger     = document.getElementById("hamburger");
    const nav           = document.querySelector("nav");
    const inputData     = document.getElementById("data");
    const inputTelefone = document.getElementById("telefone");

    // ================================================
    // DATA MÍNIMA = HOJE
    // ================================================
    const hoje = new Date().toISOString().split("T")[0];
    inputData.min = hoje;

    // ================================================
    // MÁSCARA DE TELEFONE
    // ================================================
    inputTelefone.addEventListener("input", function () {
        let v = this.value.replace(/\D/g, "").slice(0, 11);
        if (v.length <= 2) {
            v = v.replace(/^(\d{0,2})/, "($1");
        } else if (v.length <= 7) {
            v = v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
        } else {
            v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
        }
        this.value = v;
    });

    // ================================================
    // ABRIR / FECHAR MODAL
    // ================================================
    function abrirModal() {
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
        mensagemForm.textContent = "";
    }

    function fecharModal() {
        modal.classList.remove("show");
        document.body.style.overflow = "";
        form.reset();
        mensagemForm.textContent = "";
    }

    btnAgendar.addEventListener("click", abrirModal);
    btnAgendarNav.addEventListener("click", function (e) {
        e.preventDefault();
        abrirModal();
    });
    fechar.addEventListener("click", fecharModal);
    modal.addEventListener("click", function (e) {
        if (e.target === modal) fecharModal();
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") fecharModal();
    });

    // ================================================
    // MENU HAMBURGER (mobile)
    // ================================================
    hamburger.addEventListener("click", function () {
        nav.classList.toggle("open");
    });

    // ================================================
    // TOAST
    // ================================================
    function mostrarToast(msg) {
        toast.textContent = msg;
        toast.classList.add("show");
        setTimeout(function () {
            toast.classList.remove("show");
        }, 3000);
    }

    // ================================================
    // ABRIR MODAL COM SERVIÇO PRÉ-SELECIONADO
    // (chamado pelos botões dos cards e planos)
    // ================================================
    window.abrirModalComServico = function (servico) {
        abrirModal();
        setTimeout(function () {
            document.getElementById("servico").value = servico;
        }, 50);
    };

    // ================================================
    // ENVIO DO FORMULÁRIO
    // ================================================
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const nome    = document.getElementById("nome").value.trim();
        const tel     = document.getElementById("telefone").value.trim();
        const servico = document.getElementById("servico").value;
        const data    = document.getElementById("data").value;
        const horario = document.getElementById("horario").value;

        if (!nome || !tel || !servico || !data || !horario) {
            mensagemForm.style.color = "#e05555";
            mensagemForm.textContent = "Preencha todos os campos.";
            return;
        }

        const novo = {
            id:       Date.now(),
            nome:     nome,
            telefone: tel,
            servico:  servico,
            data:     data,
            horario:  horario
        };

        agendamentos.unshift(novo);
        salvarLocal();
        renderizarLista();

        mensagemForm.style.color = "#5eb87a";
        mensagemForm.textContent = "Agendamento confirmado com sucesso.";

        setTimeout(function () {
            fecharModal();
            mostrarToast("Agendamento registrado.");
        }, 1300);
    });

    // ================================================
    // SALVAR NO LOCALSTORAGE
    // ================================================
    function salvarLocal() {
        try {
            localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
        } catch (e) {
            console.warn("Não foi possível salvar no localStorage.");
        }
    }

    // ================================================
    // REMOVER AGENDAMENTO
    // ================================================
    window.removerItem = function (id) {
        if (confirm("Deseja remover este agendamento?")) {
            agendamentos = agendamentos.filter(function (a) {
                return a.id !== id;
            });
            salvarLocal();
            renderizarLista();
            mostrarToast("Agendamento removido.");
        }
    };

    // ================================================
    // FORMATAR DATA  (yyyy-mm-dd → dd/mm/yyyy)
    // ================================================
    function formatarData(d) {
        if (!d) return "";
        var partes = d.split("-");
        return partes[2] + "/" + partes[1] + "/" + partes[0];
    }

    // ================================================
    // RENDERIZAR LISTA DE AGENDAMENTOS
    // ================================================
    function renderizarLista() {
        lista.innerHTML = "";

        if (agendamentos.length === 0) {
            lista.innerHTML =
                '<div class="empty-state">' +
                '  <p>Nenhum agendamento registrado.<br>Seja o primeiro.</p>' +
                '</div>';
            return;
        }

        agendamentos.forEach(function (a, i) {
            var item = document.createElement("div");
            item.className = "agendamento-item";
            item.style.animationDelay = (i * 0.05) + "s";
            item.innerHTML =
                '<div class="agendamento-info">' +
                '  <h4>' + a.nome + '</h4>' +
                '  <p>' + a.telefone + '</p>' +
                '</div>' +
                '<div class="agendamento-meta">' +
                '  <span class="agendamento-servico">' + a.servico + '</span>' +
                '  <span class="agendamento-data">' + formatarData(a.data) + ' &mdash; ' + a.horario + '</span>' +
                '</div>' +
                '<button class="btn-remover" title="Remover" onclick="removerItem(' + a.id + ')">&#x2715;</button>';
            lista.appendChild(item);
        });
    }

    // ================================================
    // SOMBRA NO HEADER AO ROLAR
    // ================================================
    window.addEventListener("scroll", function () {
        var header = document.getElementById("header");
        header.style.boxShadow = window.scrollY > 40
            ? "0 4px 40px rgba(0,0,0,0.6)"
            : "none";
    });

    // ================================================
    // INICIALIZAR
    // ================================================
    renderizarLista();
});