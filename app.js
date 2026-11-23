/* ==========================================================
   Kushal Das - Developer Portfolio
   app.js
   ----------------------------------------------------------
   1. Config
   2. Helpers
   3. Theme toggle (dark / light, saved in localStorage)
   4. Mobile menu
   5. Header shadow + Back-to-top button
   6. Active nav link on scroll
   7. Project filter
   8. Contact form
   9. Footer year
   ========================================================== */

(() => {
    "use strict";

    /* ------------------------------------------------------
       1. CONFIG
       ------------------------------------------------------
       formEndpoint: Formspree (ba onno form service) er URL.
       Eta khali thakle, "Send Message" chaple tomar email app
       khulbe (mailto) message ta bhore diye.
       Jemon: "https://formspree.io/f/xxxxxxx"
    ------------------------------------------------------ */
    const CONFIG = {
        email: "kushaldas4401@gmail.com",
        formEndpoint: "",
        themeKey: "portfolio-theme",
        menuBreakpoint: 860,
        backToTopOffset: 400
    };


    /* ------------------------------------------------------
       2. HELPERS
    ------------------------------------------------------ */
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

    const storage = {
        get(key) {
            try {
                return localStorage.getItem(key);
            } catch {
                return null;
            }
        },
        set(key, value) {
            try {
                localStorage.setItem(key, value);
            } catch {
                /* storage blocked: ignore */
            }
        }
    };


    /* ------------------------------------------------------
       3. THEME TOGGLE
    ------------------------------------------------------ */
    const root = document.documentElement;
    const themeToggle = $("#themeToggle");
    const themeIcon = $("#themeIcon");

    function applyTheme(theme) {
        root.setAttribute("data-theme", theme);

        if (themeIcon) {
            // Light mode-e 🌙 (dark-e jabar jonno), dark mode-e ☀ (light-e fire asar jonno)
            themeIcon.textContent = theme === "dark" ? "☀" : "🌙";
        }

        if (themeToggle) {
            themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
        }
    }

    function initTheme() {
        const saved = storage.get(CONFIG.themeKey);
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        applyTheme(saved || (systemDark ? "dark" : "light"));
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";

            applyTheme(next);
            storage.set(CONFIG.themeKey, next);
        });
    }

    initTheme();


    /* ------------------------------------------------------
       4. MOBILE MENU
    ------------------------------------------------------ */
    const menuToggle = $("#menuToggle");
    const navLinks = $("#navLinks");

    function setMenu(open) {
        if (!menuToggle || !navLinks) return;

        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
        menuToggle.classList.toggle("active", open);
        navLinks.classList.toggle("active", open);
    }

    function isMenuOpen() {
        return menuToggle?.getAttribute("aria-expanded") === "true";
    }

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => setMenu(!isMenuOpen()));

        // Link-e click korle menu bondho
        $$(".nav-link", navLinks).forEach((link) => {
            link.addEventListener("click", () => setMenu(false));
        });

        // Bairer jaygay click korle menu bondho
        document.addEventListener("click", (event) => {
            if (isMenuOpen() && !event.target.closest(".navbar")) {
                setMenu(false);
            }
        });

        // Escape chaple menu bondho
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && isMenuOpen()) {
                setMenu(false);
                menuToggle.focus();
            }
        });

        // Screen boro hole menu reset
        window.addEventListener("resize", () => {
            if (window.innerWidth > CONFIG.menuBreakpoint && isMenuOpen()) {
                setMenu(false);
            }
        });
    }


    /* ------------------------------------------------------
       5. HEADER SHADOW + BACK-TO-TOP
    ------------------------------------------------------ */
    const header = $(".header");
    const backToTop = $("#backToTop");
    let ticking = false;

    function onScroll() {
        const y = window.scrollY;

        header?.classList.toggle("scrolled", y > 10);
        backToTop?.classList.toggle("show", y > CONFIG.backToTopOffset);

        ticking = false;
    }

    window.addEventListener(
        "scroll",
        () => {
            if (!ticking) {
                window.requestAnimationFrame(onScroll);
                ticking = true;
            }
        },
        { passive: true }
    );

    backToTop?.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    onScroll();


    /* ------------------------------------------------------
       6. ACTIVE NAV LINK
    ------------------------------------------------------ */
    const navAnchors = $$(".nav-link");
    const sections = navAnchors
        .map((link) => $(link.getAttribute("href")))
        .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    navAnchors.forEach((link) => {
                        const isActive = link.getAttribute("href") === `#${entry.target.id}`;

                        link.classList.toggle("active", isActive);

                        if (isActive) {
                            link.setAttribute("aria-current", "page");
                        } else {
                            link.removeAttribute("aria-current");
                        }
                    });
                });
            },
            // Screen-er majhkhane je section ashe, seta active
            { rootMargin: "-45% 0px -50% 0px" }
        );

        sections.forEach((section) => observer.observe(section));
    }


    /* ------------------------------------------------------
       7. PROJECT FILTER
    ------------------------------------------------------ */
    const filterButtons = $$(".filter-btn");
    const projectCards = $$(".project-card");

    function filterProjects(filter) {
        projectCards.forEach((card) => {
            const categories = (card.dataset.category || "").split(/\s+/);
            const show = filter === "all" || categories.includes(filter);

            card.classList.toggle("hide", !show);
        });
    }

    filterButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.classList.contains("active")));

        button.addEventListener("click", () => {
            filterButtons.forEach((btn) => {
                const isActive = btn === button;

                btn.classList.toggle("active", isActive);
                btn.setAttribute("aria-pressed", String(isActive));
            });

            filterProjects(button.dataset.filter);
        });
    });


    /* ------------------------------------------------------
       8. CONTACT FORM
    ------------------------------------------------------ */
    const form = $("#contactForm");
    const formStatus = $("#formStatus");

    function showStatus(message, type) {
        if (!formStatus) return;

        formStatus.textContent = message;
        formStatus.classList.remove("success", "error");

        if (type) formStatus.classList.add(type);
    }

    function sendWithMailto(data) {
        const subject = encodeURIComponent(data.subject);
        const body = encodeURIComponent(
            `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`
        );

        window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
    }

    async function sendWithEndpoint(formElement) {
        const response = await fetch(CONFIG.formEndpoint, {
            method: "POST",
            body: new FormData(formElement),
            headers: { Accept: "application/json" }
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
    }

    if (form) {
        const submitButton = $("button[type='submit']", form);

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            // Browser-er built-in validation
            if (!form.checkValidity()) {
                form.reportValidity();
                showStatus("Please fill in all fields correctly.", "error");
                return;
            }

            const data = Object.fromEntries(
                [...new FormData(form)].map(([key, value]) => [key, String(value).trim()])
            );

            const originalLabel = submitButton ? submitButton.textContent : "";

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Sending...";
            }

            showStatus("", null);

            try {
                if (CONFIG.formEndpoint) {
                    await sendWithEndpoint(form);
                    showStatus("Thank you! Your message has been sent.", "success");
                } else {
                    sendWithMailto(data);
                    showStatus("Opening your email app to send the message...", "success");
                }

                form.reset();
            } catch (error) {
                console.error(error);
                showStatus(
                    `Sorry, something went wrong. Please email me at ${CONFIG.email}`,
                    "error"
                );
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalLabel;
                }
            }
        });

        // Lekhar somoy error message muche felo
        form.addEventListener("input", () => {
            if (formStatus?.classList.contains("error")) {
                showStatus("", null);
            }
        });
    }


    /* ------------------------------------------------------
       9. FOOTER YEAR
    ------------------------------------------------------ */
    const yearElement = $("#currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
})();