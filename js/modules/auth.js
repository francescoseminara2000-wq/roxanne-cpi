/**
 * Roxanne CPI Light - Auth Module
 * Gestione sessione, login form, logout, switch operatore e preloader
 */

export function initAuthSession() {
  const modalLogin = document.getElementById("modal-login");
  const formLogin = document.getElementById("form-login");
  const currentUserDisplay = document.getElementById("current-user-display");
  const btnLogout = document.getElementById("btn-logout");

  // Toggle Show/Hide Password
  const btnTogglePass = document.getElementById("btn-toggle-password");
  const loginPassInput = document.getElementById("login-password");
  if (btnTogglePass && loginPassInput) {
    btnTogglePass.addEventListener("click", () => {
      const isPass = loginPassInput.type === "password";
      loginPassInput.type = isPass ? "text" : "password";
      btnTogglePass.textContent = isPass ? "Nascondi" : "Mostra";
    });
  }

  // Check saved session & manage preloader
  const preloader = document.getElementById("app-preloader");
  const dismissPreloader = () => {
    if (preloader) {
      preloader.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => preloader.remove(), 350);
    }
  };

  const savedUserJson = localStorage.getItem("ROXANNE_CURRENT_USER");
  if (savedUserJson) {
    try {
      const savedUser = JSON.parse(savedUserJson);
      if (currentUserDisplay) {
        currentUserDisplay.textContent = `${savedUser.nomeCompleto} (${savedUser.ruolo})`;
      }
      if (modalLogin) modalLogin.classList.add("hidden");
    } catch (e) {
      if (modalLogin) modalLogin.classList.remove("hidden");
    }
  } else {
    // Nessuna sessione attiva: mostra la schermata di login
    if (modalLogin) modalLogin.classList.remove("hidden");
  }

  // Rimuovi il preloader non appena la sessione è verificata e l'interfaccia è pronta
  setTimeout(dismissPreloader, 200);

  // Submit Login
  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value.trim();

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          localStorage.setItem("ROXANNE_CURRENT_USER", JSON.stringify(data.user));
          if (currentUserDisplay) {
            currentUserDisplay.textContent = `${data.user.nomeCompleto} (${data.user.ruolo})`;
          }
          if (modalLogin) modalLogin.classList.add("hidden");
          if (window.RoxToast) {
            window.RoxToast.success("Autenticato", `Benvenuto ${data.user.nomeCompleto} (${data.user.ruolo})`);
          }
        } else {
          if (window.RoxToast) {
            window.RoxToast.error("Accesso Negato", data.error || "Credenziali non valide o utente inesistente.", 4000);
          }
        }
      } catch (err) {
        console.error("Errore connessione server:", err);
        if (window.RoxToast) {
          window.RoxToast.error("Errore di Rete", "Impossibile raggiungere il database di autenticazione.");
        }
      }
    });
  }

  // Logout
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      if (confirm("Effettuare il logout dalla sessione di lavoro?")) {
        localStorage.removeItem("ROXANNE_CURRENT_USER");
        if (modalLogin) modalLogin.classList.remove("hidden");
      }
    });
  }

  // Active User Switcher Listener
  const selectActiveUser = document.getElementById("select-active-user");
  if (selectActiveUser) {
    selectActiveUser.addEventListener("change", (e) => {
      const userName = e.target.options[e.target.selectedIndex].text;
      if (window.store && typeof window.store.setActiveUser === "function") {
        window.store.setActiveUser(userName);
      }
    });
  }
}

window.initAuthSession = initAuthSession;
