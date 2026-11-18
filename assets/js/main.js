/* NexLink — scripts do site */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svg = (inner, vb = "0 0 24 24") => `<svg viewBox="${vb}" aria-hidden="true">${inner}</svg>`;

  /* ---------- Ícones usados em vários lugares ---------- */
  const ICONES = {
    monitor: '<rect x="2" y="3" width="20" height="13" rx="2"/><path d="M8 21h8M12 16v5"/>',
    pc: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M9 6h6M9 10h6"/><circle cx="12" cy="16" r="1.5"/>',
    roteador: '<rect x="2" y="13" width="20" height="7" rx="2"/><path d="M6 13 4 6M18 13l2-7"/><circle cx="7" cy="16.5" r="1"/><circle cx="11" cy="16.5" r="1"/><path d="M9 7.5a4.5 4.5 0 0 1 6 0M10.5 9.5a2 2 0 0 1 3 0"/>',
    cabo: '<path d="M4 20c0-6 4-6 8-8s8-2 8-8"/><rect x="2" y="18" width="5" height="4" rx="1"/><rect x="17" y="2" width="5" height="4" rx="1"/>',
    lampada: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    teclado: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
    mouse: '<rect x="6" y="2" width="12" height="20" rx="6"/><path d="M12 6v4"/>',
    camera: '<path d="M3 7h12l3 3v4l-3 3H3z"/><circle cx="9" cy="12" r="2.5"/><path d="M18 10l3-2v8l-3-2"/>',
    switch: '<rect x="2" y="8" width="20" height="8" rx="2"/><path d="M6 12h.01M9 12h.01M12 12h.01M15 12h.01M18 12h.01"/>',
    internet: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'
  };

  /* ---------- Menu, topo e ano ---------- */
  const menuBtn = $(".menu-btn");
  const menu = $("#menu");
  menuBtn.addEventListener("click", () => {
    const aberto = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", String(!aberto));
    menuBtn.setAttribute("aria-label", aberto ? "Abrir menu" : "Fechar menu");
    menu.classList.toggle("aberto", !aberto);
  });
  $$("#menu a").forEach(a => a.addEventListener("click", () => {
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Abrir menu");
    menu.classList.remove("aberto");
  }));
  const topo = $(".topo");
  addEventListener("scroll", () => topo.classList.toggle("rolou", scrollY > 10), { passive: true });
  $("#ano").textContent = new Date().getFullYear();

  // link ativo conforme a seção visível
  const links = $$('.menu ul a[href^="#"]');
  const secoes = links.map(a => $(a.getAttribute("href"))).filter(Boolean);
  const obsMenu = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle("ativo", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  secoes.forEach(s => obsMenu.observe(s));

  // revelar ao rolar
  const obsRevelar = new IntersectionObserver(entradas => {
    entradas.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visivel"); obsRevelar.unobserve(e.target); } });
  }, { threshold: .12 });
  $$(".secao__cab, .card, .dif, .pilar, .play, .lab, .principios, .membro").forEach(el => { el.classList.add("revelar"); obsRevelar.observe(el); });

  /* ---------- Hero: rede de pontos ---------- */
  (function heroRede() {
    const cv = $(".hero__rede");
    const ctx = cv.getContext("2d");
    let w, h, pts = [], mouse = { x: -999, y: -999 };
    const dpr = Math.min(devicePixelRatio || 1, 2);
    function ajustar() {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(70, (w * h) / 16000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3 }));
    }
    function quadro() {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        if (!reduzMovimento) { p.x += p.vx; p.y += p.vy; }
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      const lim = 130;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < lim) { ctx.strokeStyle = `rgba(29,91,214,${(1 - d / lim) * .22})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < 180) { ctx.strokeStyle = `rgba(59,155,240,${(1 - dm / 180) * .6})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
        ctx.fillStyle = "rgba(29,91,214,.55)"; ctx.beginPath(); ctx.arc(a.x, a.y, 2.2, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduzMovimento) requestAnimationFrame(quadro);
    }
    const hero = $(".hero");
    hero.addEventListener("pointermove", e => { const r = cv.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    hero.addEventListener("pointerleave", () => { mouse = { x: -999, y: -999 }; });
    addEventListener("resize", ajustar);
    ajustar(); quadro();
  })();

  /* ---------- Playspace ---------- */
  (function playspace() {
    const OBJETOS = [
      { id: "monitor", nome: "Monitor", fato: "O monitor mostra milhões de pixels. Cada pixel mistura vermelho, verde e azul (RGB) para formar qualquer cor.", pergunta: "Quais cores formam um pixel?", opcoes: ["Vermelho, verde e azul", "Preto, branco e cinza", "Amarelo, ciano e magenta"], certa: 0 },
      { id: "pc", nome: "Gabinete", fato: "Dentro do gabinete ficam processador, memória e armazenamento. Poeira acumulada esquenta as peças e deixa tudo mais lento.", pergunta: "Por que limpar o PC por dentro?", opcoes: ["Para mudar a cor das peças", "Para evitar superaquecimento", "Para aumentar a internet"], certa: 1 },
      { id: "roteador", nome: "Roteador", fato: "O roteador escolhe o caminho dos dados entre a sua rede e a internet, e ainda distribui endereços IP para os aparelhos.", pergunta: "O que o roteador faz?", opcoes: ["Imprime documentos", "Guarda arquivos", "Encaminha dados entre redes"], certa: 2 },
      { id: "cabo", nome: "Cabo de rede", fato: "O cabo de par trançado tem 8 fios torcidos em pares. A torção reduz interferências, e o conector usado é o RJ-45.", pergunta: "Qual conector o cabo de rede usa?", opcoes: ["RJ-45", "USB-C", "HDMI"], certa: 0 },
      { id: "lampada", nome: "Luminária", fato: "Uma lâmpada LED gasta muito menos energia que uma incandescente para iluminar o mesmo ambiente.", pergunta: "Qual lâmpada é mais econômica?", opcoes: ["Incandescente", "LED", "Halógena"], certa: 1 },
      { id: "teclado", nome: "Teclado", fato: "O teclado é um periférico de entrada: ele envia informações para o computador. O monitor é de saída.", pergunta: "O teclado é um periférico de…", opcoes: ["Saída", "Armazenamento", "Entrada"], certa: 2 },
      { id: "mouse", nome: "Mouse", fato: "O mouse óptico usa um pequeno sensor de luz que fotografa a superfície milhares de vezes por segundo para medir o movimento.", pergunta: "Como o mouse óptico detecta o movimento?", opcoes: ["Com um sensor de luz", "Com uma bolinha de borracha", "Pelo Wi-Fi"], certa: 0 },
      { id: "camera", nome: "Câmera", fato: "No CFTV, as câmeras enviam as imagens para um gravador (DVR ou NVR), que guarda tudo e permite ver de longe.", pergunta: "Onde as imagens do CFTV ficam gravadas?", opcoes: ["No próprio cabo", "No DVR ou NVR", "No monitor"], certa: 1 }
    ];
    const cena = $(".play__cena");
    const conteudo = $("#play-conteudo");
    const cont = $("#play-cont");
    const barra = $("#play-barra");
    const feitos = new Set();

    cena.innerHTML = OBJETOS.map(o => `<button class="objeto" data-id="${o.id}" aria-pressed="false">${svg(ICONES[o.id])}<span>${o.nome}</span></button>`).join("");

    function abrir(o) {
      $$(".objeto", cena).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.id === o.id)));
      const jaFeito = feitos.has(o.id);
      conteudo.innerHTML = `
        <h3>${o.nome}</h3>
        <p>${o.fato}</p>
        <div class="quiz">
          <p>${o.pergunta}</p>
          ${o.opcoes.map((op, i) => `<button data-i="${i}" ${jaFeito ? "disabled" : ""} class="${jaFeito && i === o.certa ? "certo" : ""}">${op}</button>`).join("")}
          <p class="quiz__msg" aria-live="polite">${jaFeito ? "Você já descobriu este objeto." : ""}</p>
        </div>`;
      $$(".quiz button", conteudo).forEach(b => b.addEventListener("click", () => {
        const i = +b.dataset.i, msg = $(".quiz__msg", conteudo);
        if (i === o.certa) {
          b.classList.add("certo");
          $$(".quiz button", conteudo).forEach(x => x.disabled = true);
          msg.textContent = "Isso mesmo! Descoberta desbloqueada.";
          feitos.add(o.id);
          $(`.objeto[data-id="${o.id}"]`, cena).classList.add("feito");
          atualizar();
        } else {
          b.classList.add("errado"); b.disabled = true;
          msg.textContent = "Quase! Tente outra opção.";
        }
      }));
    }
    function atualizar() {
      cont.textContent = feitos.size;
      barra.style.width = (feitos.size / OBJETOS.length) * 100 + "%";
      if (feitos.size === OBJETOS.length && !$(".play__fim")) {
        conteudo.insertAdjacentHTML("beforeend", '<p class="play__fim">Escritório completo! Você conectou todas as ideias.</p>');
      }
    }
    cena.addEventListener("click", e => {
      const b = e.target.closest(".objeto");
      if (!b) return;
      abrir(OBJETOS.find(o => o.id === b.dataset.id));
      if (innerWidth <= 900) $(".play__painel").scrollIntoView({ behavior: reduzMovimento ? "auto" : "smooth", block: "nearest" });
    });
  })();

  /* ---------- Laboratório: abas ---------- */
  (function abas() {
    const tabs = $$('.abas [role="tab"]');
    function ativar(t, foco) {
      tabs.forEach(x => {
        const sel = x === t;
        x.setAttribute("aria-selected", String(sel));
        x.tabIndex = sel ? 0 : -1;
        $("#" + x.getAttribute("aria-controls")).hidden = !sel;
      });
      if (foco) t.focus();
    }
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => ativar(t));
      t.addEventListener("keydown", e => {
        if (e.key === "ArrowRight") ativar(tabs[(i + 1) % tabs.length], true);
        if (e.key === "ArrowLeft") ativar(tabs[(i - 1 + tabs.length) % tabs.length], true);
      });
    });
  })();

  /* ---------- Experimento 1: rede ---------- */
  (function expRede() {
    const NOS = [
      { id: "pc", nome: "Seu PC", fixo: true },
      { id: "cabo", nome: "Cabo" },
      { id: "switch", nome: "Switch" },
      { id: "roteador", nome: "Roteador" },
      { id: "internet", nome: "Internet", fixo: true }
    ];
    const trilha = $("#rede-trilha"), toggles = $("#rede-toggles"), pacote = $("#rede-pacote"), status = $("#rede-status"), btn = $("#rede-enviar");
    const ligado = { cabo: true, switch: true, roteador: true };
    trilha.innerHTML = NOS.map(n => `<div class="no" data-id="${n.id}"><div class="no__bola">${svg(ICONES[n.id])}</div>${n.nome}</div>`).join("");
    toggles.innerHTML = NOS.filter(n => !n.fixo).map(n => `<label><input type="checkbox" data-id="${n.id}" checked> ${n.nome} ligado</label>`).join("");
    toggles.addEventListener("change", e => {
      const id = e.target.dataset.id;
      ligado[id] = e.target.checked;
      $(`.no[data-id="${id}"]`, trilha).classList.toggle("off", !e.target.checked);
      status.textContent = ""; status.className = "exp__status";
    });
    const mensagens = {
      cabo: "Falhou: sem o cabo, o sinal nem sai do computador. Verifique se o cabo está conectado e o LED da placa de rede acende.",
      switch: "Falhou: o switch está desligado, então o pacote não chega ao roteador. Confira a energia do switch.",
      roteador: "Falhou: sem o roteador, a rede local não tem caminho até a internet."
    };
    let animando = false;
    btn.addEventListener("click", async () => {
      if (animando) return;
      animando = true; btn.disabled = true;
      status.textContent = "Enviando…"; status.className = "exp__status";
      const nos = $$(".no", trilha);
      const base = pacote.parentElement.getBoundingClientRect();
      const posX = el => { const r = el.querySelector(".no__bola").getBoundingClientRect(); return r.left - base.left + r.width / 2 - pacote.offsetWidth / 2; };
      pacote.style.opacity = "1";
      pacote.style.transition = "none";
      pacote.style.transform = `translateX(${posX(nos[0])}px)`;
      await new Promise(r => setTimeout(r, 30));
      let falha = null;
      for (let i = 0; i < nos.length; i++) {
        const id = nos[i].dataset.id;
        if (ligado[id] === false) { falha = id; break; }
        pacote.style.transition = reduzMovimento ? "none" : "transform .45s ease";
        pacote.style.transform = `translateX(${posX(nos[i])}px)`;
        nos.forEach(n => n.classList.remove("ativo")); nos[i].classList.add("ativo");
        await new Promise(r => setTimeout(r, reduzMovimento ? 120 : 500));
      }
      nos.forEach(n => n.classList.remove("ativo"));
      if (falha) { status.textContent = mensagens[falha]; status.className = "exp__status erro"; }
      else { status.textContent = "Sucesso! O pacote chegou à internet e a resposta já está voltando."; status.className = "exp__status ok"; }
      setTimeout(() => { pacote.style.opacity = "0"; }, 600);
      animando = false; btn.disabled = false;
    });
  })();

  /* ---------- Experimento 2: dentro do computador ---------- */
  (function expPC() {
    const PECAS = [
      { nome: "Processador (CPU)", cor: "#1D5BD6", x: 38, y: 14, w: 22, h: 26, txt: "É o cérebro do computador: executa as instruções dos programas, bilhões de vezes por segundo. Precisa de um cooler para não esquentar demais." },
      { nome: "Memória RAM", cor: "#7C3AED", x: 66, y: 10, w: 8, h: 40, txt: "Guarda os dados que estão em uso agora. É muito rápida, mas apaga tudo quando o computador desliga." },
      { nome: "SSD", cor: "#0E7490", x: 12, y: 52, w: 22, h: 10, txt: "Armazena arquivos e o sistema operacional de forma permanente. Um SSD é bem mais rápido que um HD comum." },
      { nome: "Placa de vídeo (GPU)", cor: "#B45309", x: 30, y: 70, w: 50, h: 14, txt: "Cria as imagens que aparecem na tela. Muito usada em jogos, edição de vídeo e inteligência artificial." },
      { nome: "Fonte", cor: "#475569", x: 80, y: 62, w: 14, h: 26, txt: "Converte a energia da tomada (corrente alternada) em corrente contínua nas tensões que cada peça precisa." },
      { nome: "Chipset", cor: "#0F766E", x: 64, y: 54, w: 10, h: 10, txt: "Controla a comunicação entre o processador e as outras partes da placa-mãe, como USB e armazenamento." },
      { nome: "Placa de rede", cor: "#BE185D", x: 6, y: 12, w: 14, h: 18, txt: "Liga o computador à rede, por cabo (porta RJ-45) ou Wi-Fi. Cada uma tem um endereço físico único, o MAC." }
    ];
    const placa = $("#placa"), info = $("#peca-info");
    placa.innerHTML = PECAS.map((p, i) => `<button class="peca" data-i="${i}" aria-pressed="false" style="left:${p.x}%;top:${p.y}%;width:${p.w}%;height:${p.h}%;background:${p.cor}">${p.nome.replace(/ \(.*\)/, "")}</button>`).join("");
    placa.addEventListener("click", e => {
      const b = e.target.closest(".peca"); if (!b) return;
      const p = PECAS[+b.dataset.i];
      $$(".peca", placa).forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      info.innerHTML = `<strong>${p.nome}</strong><p>${p.txt}</p>`;
    });
  })();

  /* ---------- Experimento 3: Lei de Ohm ---------- */
  (function expOhm() {
    const v = $("#ohm-v"), r = $("#ohm-r"), vo = $("#ohm-v-out"), ro = $("#ohm-r-out"), io = $("#ohm-i"), dica = $("#ohm-dica");
    const lamp = $("#ohm-lamp"), brilho = $("#ohm-brilho"), fluxo = $("#ohm-fluxo");
    function calc() {
      const V = +v.value, R = +r.value, I = V / R;
      vo.textContent = V; ro.textContent = R;
      io.textContent = I >= 1 ? I.toFixed(2).replace(".", ",") + " A" : Math.round(I * 1000) + " mA";
      const t = Math.min(1, I / 0.5);
      brilho.style.opacity = (0.05 + t * 0.75).toFixed(2);
      lamp.style.fill = `hsl(48, ${40 + t * 55}%, ${70 + t * 18}%)`;
      fluxo.style.animationDuration = (1.6 - t * 1.3).toFixed(2) + "s";
      dica.textContent = t > .9 ? "Muita corrente! Na vida real, isso pode queimar a lâmpada." : t < .08 ? "Pouca corrente: a lâmpada quase não acende." : "";
      dica.className = "exp__status" + (t > .9 ? " erro" : "");
    }
    v.addEventListener("input", calc); r.addEventListener("input", calc); calc();
  })();

  /* ---------- Equipe ----------
     Edite esta lista com os dados reais da equipe.
     foto: caminho da imagem (ex.: "assets/img/equipe/alvaro.jpg") ou deixe vazio. */
  const EQUIPE = [
    { nome: "Integrante 1", funcao: "[Função]", resp: "[Responsabilidades deste integrante]", foto: "" },
    { nome: "Integrante 2", funcao: "[Função]", resp: "[Responsabilidades deste integrante]", foto: "" },
    { nome: "Integrante 3", funcao: "[Função]", resp: "[Responsabilidades deste integrante]", foto: "" },
    { nome: "Integrante 4", funcao: "[Função]", resp: "[Responsabilidades deste integrante]", foto: "" },
    { nome: "Integrante 5", funcao: "[Função]", resp: "[Responsabilidades deste integrante]", foto: "" },
    { nome: "Integrante 6", funcao: "[Função]", resp: "[Responsabilidades deste integrante]", foto: "" }
  ];
  (function equipe() {
    const lista = $("#equipe-lista"), dlg = $("#perfil");
    const cores = ["#1D5BD6", "#0B1F4D", "#2F7FD9", "#13306E", "#3B6FD6", "#1E4BA8"];
    const iniciais = n => n.split(/\s+/).map(p => p[0]).slice(0, 2).join("").toUpperCase();
    const avatar = (m, i) => `<span class="avatar" style="background:${cores[i % cores.length]}">${m.foto ? `<img src="${m.foto}" alt="">` : iniciais(m.nome)}</span>`;
    lista.innerHTML = EQUIPE.map((m, i) => `<button class="membro" data-i="${i}">${avatar(m, i)}<div><strong>${m.nome}</strong><span>${m.funcao}</span></div></button>`).join("");
    lista.addEventListener("click", e => {
      const b = e.target.closest(".membro"); if (!b) return;
      const i = +b.dataset.i, m = EQUIPE[i];
      $("#perfil-foto").innerHTML = avatar(m, i);
      $("#perfil-nome").textContent = m.nome;
      $("#perfil-funcao").textContent = m.funcao;
      $("#perfil-resp").textContent = m.resp;
      dlg.showModal();
    });
    $(".perfil__fechar").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  })();

  /* ---------- NexLink Matter: partículas ---------- */
  (function matter() {
    const cv = $("#matter-canvas");
    if (!cv.getContext) return;
    const ctx = cv.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w = 0, h = 0, parts = [], alvos = [], tema = "rede";
    const ponteiro = { x: -9999, y: -9999, ativo: false, segurando: false };
    const N = () => (w < 600 ? 650 : 1300);

    const FORMAS = {
      rede(c, s) {
        const nos = [[0, -0.8], [-0.75, -0.2], [0.75, -0.2], [-0.45, 0.65], [0.45, 0.65], [0, 0]];
        c.lineWidth = s * 0.06;
        [[0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [0, 1], [0, 2], [1, 3], [2, 4], [3, 4]].forEach(([a, b]) => { c.beginPath(); c.moveTo(nos[a][0] * s, nos[a][1] * s); c.lineTo(nos[b][0] * s, nos[b][1] * s); c.stroke(); });
        nos.forEach(([x, y], i) => { c.beginPath(); c.arc(x * s, y * s, s * (i === 5 ? 0.2 : 0.14), 0, Math.PI * 2); c.fill(); });
      },
      pc(c, s) {
        c.lineWidth = s * 0.1;
        c.strokeRect(-s * 0.95, -s * 0.75, s * 1.9, s * 1.15);
        c.fillRect(-s * 0.1, s * 0.4, s * 0.2, s * 0.35);
        c.fillRect(-s * 0.5, s * 0.72, s, s * 0.1);
      },
      chip(c, s) {
        c.lineWidth = s * 0.09;
        c.strokeRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2);
        c.fillRect(-s * 0.28, -s * 0.28, s * 0.56, s * 0.56);
        for (let i = -2; i <= 2; i++) {
          const p = i * s * 0.22;
          c.fillRect(p - s * 0.04, -s * 0.95, s * 0.08, s * 0.3); c.fillRect(p - s * 0.04, s * 0.65, s * 0.08, s * 0.3);
          c.fillRect(-s * 0.95, p - s * 0.04, s * 0.3, s * 0.08); c.fillRect(s * 0.65, p - s * 0.04, s * 0.3, s * 0.08);
        }
      },
      camera(c, s) {
        c.lineWidth = s * 0.1;
        c.beginPath(); c.moveTo(-s * 0.95, -s * 0.4); c.lineTo(s * 0.35, -s * 0.4); c.lineTo(s * 0.55, -s * 0.15); c.lineTo(s * 0.55, s * 0.15); c.lineTo(s * 0.35, s * 0.4); c.lineTo(-s * 0.95, s * 0.4); c.closePath(); c.stroke();
        c.beginPath(); c.arc(-s * 0.25, 0, s * 0.2, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.moveTo(s * 0.6, -s * 0.1); c.lineTo(s * 0.95, -s * 0.35); c.lineTo(s * 0.95, s * 0.35); c.lineTo(s * 0.6, s * 0.1); c.closePath(); c.fill();
      },
      energia(c, s) {
        c.beginPath(); c.moveTo(s * 0.15, -s); c.lineTo(-s * 0.55, s * 0.12); c.lineTo(-s * 0.02, s * 0.12); c.lineTo(-s * 0.15, s); c.lineTo(s * 0.55, -s * 0.15); c.lineTo(s * 0.02, -s * 0.15); c.closePath(); c.fill();
      }
    };

    function gerarAlvos(nomeTema) {
      const off = document.createElement("canvas");
      const ow = 300, oh = Math.round(300 * h / w) || 200;
      off.width = ow; off.height = oh;
      const c = off.getContext("2d");
      c.fillStyle = c.strokeStyle = "#fff"; c.lineCap = "round"; c.lineJoin = "round";
      c.translate(ow / 2, oh / 2 - oh * 0.06);
      FORMAS[nomeTema](c, Math.min(ow, oh) * 0.36);
      const dados = c.getImageData(0, 0, ow, oh).data, pontos = [];
      for (let y = 0; y < oh; y += 2) for (let x = 0; x < ow; x += 2) if (dados[(y * ow + x) * 4 + 3] > 128) pontos.push([x * w / ow, y * h / oh]);
      const n = N(), res = [];
      for (let i = 0; i < n; i++) { const p = pontos[Math.floor(Math.random() * pontos.length)]; res.push({ x: p[0] + (Math.random() - .5) * 3, y: p[1] + (Math.random() - .5) * 3 }); }
      return res;
    }

    function ajustar() {
      const r = cv.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      alvos = gerarAlvos(tema);
      const n = N();
      while (parts.length < n) parts.push({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, t: Math.random() });
      parts.length = n;
    }

    function mudarTema(t) {
      tema = t; alvos = gerarAlvos(t);
      $$(".matter__botoes [data-tema]").forEach(b => { if (b.dataset.tema !== "bang") b.setAttribute("aria-pressed", String(b.dataset.tema === t)); });
    }
    function bigBang() {
      const cx = w / 2, cy = h / 2;
      parts.forEach(p => { p.x = cx + (Math.random() - .5) * 10; p.y = cy + (Math.random() - .5) * 10; const a = Math.random() * Math.PI * 2, v = 6 + Math.random() * 14; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v; });
    }

    function quadro() {
      ctx.fillStyle = "rgba(7,21,54,.32)"; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i], a = alvos[i];
        p.vx += (a.x - p.x) * 0.012; p.vy += (a.y - p.y) * 0.012;
        if (ponteiro.ativo) {
          const dx = p.x - ponteiro.x, dy = p.y - ponteiro.y, d2 = dx * dx + dy * dy, raio = ponteiro.segurando ? 200 : 110;
          if (d2 < raio * raio) {
            const d = Math.sqrt(d2) || 1, f = (1 - d / raio);
            if (ponteiro.segurando) { p.vx += (-dy / d) * f * 3.2 - (dx / d) * f * .6; p.vy += (dx / d) * f * 3.2 - (dy / d) * f * .6; }
            else { p.vx += (dx / d) * f * 4; p.vy += (dy / d) * f * 4; }
          }
        }
        p.vx *= 0.88; p.vy *= 0.88;
        p.x += p.vx; p.y += p.vy;
        const vel = Math.min(1, Math.hypot(p.vx, p.vy) / 6);
        ctx.fillStyle = `hsl(${212 - vel * 20}, 90%, ${62 + vel * 25}%)`;
        ctx.fillRect(p.x, p.y, 2, 2);
      }
      requestAnimationFrame(quadro);
    }

    const pos = e => { const r = cv.getBoundingClientRect(); ponteiro.x = e.clientX - r.left; ponteiro.y = e.clientY - r.top; };
    let timerSegurar;
    cv.addEventListener("pointermove", e => { pos(e); ponteiro.ativo = true; });
    cv.addEventListener("pointerdown", e => {
      pos(e); ponteiro.ativo = true; cv.setPointerCapture(e.pointerId);
      clearTimeout(timerSegurar);
      if (e.pointerType === "mouse") timerSegurar = setTimeout(() => ponteiro.segurando = true, 180);
    });
    const soltar = e => { clearTimeout(timerSegurar); ponteiro.segurando = false; if (e.pointerType !== "mouse") ponteiro.ativo = false; };
    cv.addEventListener("pointerup", soltar);
    cv.addEventListener("pointercancel", soltar);
    cv.addEventListener("pointerleave", () => { ponteiro.ativo = false; ponteiro.segurando = false; });

    $$(".matter__botoes button").forEach(b => b.addEventListener("click", () => b.dataset.tema === "bang" ? bigBang() : mudarTema(b.dataset.tema)));

    let rTimer; addEventListener("resize", () => { clearTimeout(rTimer); rTimer = setTimeout(ajustar, 150); });
    ajustar();
    ctx.fillStyle = "#071536"; ctx.fillRect(0, 0, w, h);
    if (reduzMovimento) {
      parts.forEach((p, i) => { p.x = alvos[i].x; p.y = alvos[i].y; });
    }
    // só anima quando estiver visível
    let rodando = false;
    new IntersectionObserver(([e]) => { if (e.isIntersecting && !rodando) { rodando = true; quadro(); } }, { threshold: .05 }).observe(cv);
  })();
})();
