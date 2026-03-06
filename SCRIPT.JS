document.addEventListener("DOMContentLoaded", function () {

  
    let agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]");


    const modal          = document.getElementById("modal");
    const btnAgendar     = document.getElementById("btnAgendar");
    const btnAgendarNav  = document.getElementById("btnAgendarNav");
    const fechar         = document.getElementById("fechar");
    const form           = document.getElementById("formAgendamento");
    const mensagemForm   = document.getElementById("mensagemForm");
    const lista          = document.getElementById("listaAgendamentos");
    const toast          = document.getElementById("toast");
    const hamburger      = document.getElementById("hamburger");
    const nav            = document.querySelector("nav");
    const inputData      = document.getElementById("data");
    const inputTelefone  = document.getElementById("telefone");

 
    const hoje = new Date().toISOString().split("T")[0];
    inputData.min = hoje;

  
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
    btnAgendarNav.addEventListener("click", (e) => { e.preventDefault(); abrirModal(); });
    fechar.addEventListener("click", fecharModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });

   
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") fecharModal();
    });

    
    hamburger.addEventListener("click", () => {
        nav.classList.toggle("open");
    });

    
    function mostrarToast(msg) {
        toast.textContent = msg;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000);
    }

   
    window.abrirModalComServico = function (servico) {
        abrirModal();
        setTimeout(() => {
            const sel = document.getElementById("servico");
            sel.value = servico;
        }, 50);
    };

 
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const nome    = document.getElementById("nome").value.trim();
        const tel     = document.getElementById("telefone").value.trim();
        const servico = document.getElementById("servico").value;
        const data    = document.getElementById("data").value;
        const horario = document.getElementById("horario").value;

        if (!nome || !tel || !servico || !data || !horario) {
            mensagemForm.style.color = "#ff6b6b";
            mensagemForm.textContent = "⚠ Preencha todos os campos!";
            return;
        }

        const novo = {
            id: Date.now(),
            nome,
            telefone: tel,
            servico,
            data,
            horario,
            criado: new Date().toLocaleString("pt-BR")
        };

        agendamentos.unshift(novo);
        salvarLocal();
        renderizarLista();

        mensagemForm.style.color = "#2ecc71";
        mensagemForm.textContent = "✓ Agendamento confirmado!";

        setTimeout(() => {
            fecharModal();
            mostrarToast("✦ Agendamento salvo com sucesso!");
        }, 1200);
    });

  
    function salvarLocal() {
        localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
    }

    
    function removerAgendamento(id) {
        agendamentos = agendamentos.filter(a => a.id !== id);
        salvarLocal();
        renderizarLista();
        mostrarToast("Agendamento removido.");
    }

   
    function formatarData(dataStr) {
        if (!dataStr) return "";
        const [y, m, d] = dataStr.split("-");
        return `${d}/${m}/${y}`;
    }

    function renderizarLista() {
        lista.innerHTML = "";

        if (agendamentos.length === 0) {
            lista.innerHTML = `
                <div class="empty-state">
                    <span>📋</span>
                    <p>Nenhum agendamento ainda.<br>Seja o primeiro!</p>
                </div>`;
            return;
        }

        agendamentos.forEach((a, i) => {
            const item = document.createElement("div");
            item.className = "agendamento-item";
            item.style.animationDelay = `${i * 0.05}s`;
            item.innerHTML = `
                <div class="agendamento-info">
                    <h4>${a.nome}</h4>
                    <p>📞 ${a.telefone}</p>
                </div>
                <div class="agendamento-meta">
                    <span class="agendamento-servico">${a.servico}</span>
                    <span class="agendamento-data">📅 ${formatarData(a.data)} às ${a.horario}</span>
                </div>
                <button class="btn-remover" title="Remover" onclick="removerItem(${a.id})">✕</button>
            `;
            lista.appendChild(item);
        });
    }

    window.removerItem = function (id) {
        if (confirm("Deseja remover este agendamento?")) {
            removerAgendamento(id);
        }
    };

   
    window.addEventListener("scroll", () => {
        const header = document.getElementById("header");
        if (window.scrollY > 40) {
            header.style.boxShadow = "0 4px 30px rgba(0,0,0,0.5)";
        } else {
            header.style.boxShadow = "none";
        }
    });

    
    renderizarLista();
});