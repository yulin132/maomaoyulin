(() => {
    const panel = document.querySelector(".scene-panel");
    const areaName = document.getElementById("areaName");
    const temperature = document.getElementById("temperature");
    const emptyMessage = document.getElementById("emptyMessage");
    const backButton = document.querySelector(".back-button");
    const soundButton = document.querySelector(".sound-button");
    const inventoryToggle = document.getElementById("inventoryToggle");
    const inventoryPanel = document.getElementById("inventoryPanel");
    const inventoryClose = document.getElementById("inventoryClose");
    const inventoryBackdrop = document.getElementById("inventoryBackdrop");
    const viewButtons = [...document.querySelectorAll("[data-view]")];
    const doorButtons = [...document.querySelectorAll("[data-open]")];

    const views = {
        closed: {
            code: "FRIDGE 01",
            title: "整台冰箱",
            area: "全部",
            temperature: "—",
            message: "选择一个区域，之后这里会显示存放的食材。"
        },
        upper: {
            code: "FRESH AREA",
            title: "上层 · 冷藏室",
            area: "冷藏室",
            temperature: "2～8°C",
            message: "冷藏室暂时没有记录，已为蔬菜、饮料和日常食材预留栏位。"
        },
        lower: {
            code: "FROZEN AREA",
            title: "下层 · 冷冻室",
            area: "冷冻室",
            temperature: "-18°C",
            message: "三个冷冻抽屉都是空的，之后可以按抽屉记录冷冻食材。"
        }
    };

    let soundEnabled = true;
    let audioContext;
    let isTransitioning = false;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function playChime(type) {
        if (!soundEnabled) return;
        try {
            audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            oscillator.type = "sine";
            oscillator.frequency.value = type === "closed" ? 360 : type === "upper" ? 620 : 470;
            gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.055, audioContext.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.24);
            oscillator.connect(gain).connect(audioContext.destination);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.25);
        } catch (_) {
            // Audio is decorative; the fridge remains fully usable without it.
        }
    }

    function setView(view, announce = true) {
        if (!views[view]) return;
        panel.dataset.view = view;
        const data = views[view];
        areaName.textContent = data.area;
        temperature.textContent = data.temperature;
        emptyMessage.textContent = data.message;

        document.getElementById("upperInterior").setAttribute("aria-hidden", String(view !== "upper"));
        document.getElementById("lowerInterior").setAttribute("aria-hidden", String(view !== "lower"));

        viewButtons.forEach((button) => {
            const active = button.dataset.view === view;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });

        if (announce) playChime(view);
    }

    async function openCompartment(view) {
        if (isTransitioning || !views[view]) return;
        isTransitioning = true;
        setInventoryOpen(false);
        panel.classList.add("is-opening", `opening-${view}`);
        panel.setAttribute("aria-busy", "true");
        doorButtons.forEach((button) => { button.disabled = true; });
        playChime(view);

        const front = document.getElementById("fridgeFront");
        const door = panel.querySelector(`.${view}-door`);
        const cavity = panel.querySelector(`.${view}-cavity`);
        const interior = document.getElementById(`${view}Interior`);

        const finish = () => {
            panel.classList.remove("is-opening", `opening-${view}`);
            panel.removeAttribute("aria-busy");
            doorButtons.forEach((button) => { button.disabled = false; });
            isTransitioning = false;
        };

        if (prefersReducedMotion.matches || !door?.animate || !front?.animate || !interior?.animate) {
            setView(view, false);
            finish();
            return;
        }

        await new Promise((resolve) => requestAnimationFrame(resolve));

        const doorAnimation = door.animate([
            { transform: "translate3d(0, 0, 0) rotateY(0deg)" },
            { transform: "translate3d(0, 0, 0) rotateY(108deg)" }
        ], {
            duration: 820,
            easing: "cubic-bezier(.3,.05,.2,1)",
            fill: "forwards"
        });

        const cavityAnimation = cavity?.animate([
            { opacity: .86 },
            { opacity: 1 }
        ], {
            duration: 820,
            easing: "ease-out",
            fill: "forwards"
        });

        await doorAnimation.finished;

        const frontAnimation = front.animate([
            { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 },
            { transform: "translate3d(0, 30px, 0) scale(1.28)", opacity: 0 }
        ], {
            duration: 580,
            easing: "cubic-bezier(.2,.72,.18,1)",
            fill: "forwards"
        });

        const interiorAnimation = interior.animate([
            { transform: "translate3d(0, 78px, 0) scale(.58)", opacity: 0 },
            { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 }
        ], {
            duration: 580,
            easing: "cubic-bezier(.18,.78,.2,1)",
            fill: "forwards"
        });

        await Promise.all([frontAnimation.finished, interiorAnimation.finished]);

        setView(view, false);
        [doorAnimation, cavityAnimation, frontAnimation, interiorAnimation].forEach((animation) => animation?.cancel());
        finish();
    }

    doorButtons.forEach((button) => button.addEventListener("click", () => openCompartment(button.dataset.open)));
    viewButtons.forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
    backButton.addEventListener("click", () => setView("closed"));
    soundButton.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        soundButton.setAttribute("aria-pressed", String(soundEnabled));
        soundButton.textContent = soundEnabled ? "♪" : "×";
        soundButton.title = `提示音：${soundEnabled ? "开" : "关"}`;
        if (soundEnabled) playChime("upper");
    });

    function setInventoryOpen(open) {
        document.body.classList.toggle("inventory-open", open);
        inventoryToggle.setAttribute("aria-expanded", String(open));
        inventoryPanel.setAttribute("aria-hidden", String(!open));
    }

    inventoryToggle.addEventListener("click", () => setInventoryOpen(!document.body.classList.contains("inventory-open")));
    inventoryClose.addEventListener("click", () => setInventoryOpen(false));
    inventoryBackdrop.addEventListener("click", () => setInventoryOpen(false));

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (document.body.classList.contains("inventory-open")) setInventoryOpen(false);
        else if (panel.dataset.view !== "closed") setView("closed");
    });

    setView("closed", false);
})();
