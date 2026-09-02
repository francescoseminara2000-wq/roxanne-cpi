/**
 * Roxanne CPI Light - Toast Notification Module
 * Motore di notifiche glassmorphism con barre di progresso e animazioni
 */

window.RoxToast = {
  container: null,
  init() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "roxanne-toast-container";
      document.body.appendChild(this.container);
    }
  },
  show({ title = "Notifica", message = "", type = "success", duration = 3200 }) {
    this.init();

    const toast = document.createElement("div");
    toast.className = `rox-toast rox-toast-${type}`;

    const iconMap = {
      success: '<i class="fa-solid fa-circle-check"></i>',
      error: '<i class="fa-solid fa-circle-xmark"></i>',
      warning: '<i class="fa-solid fa-triangle-exclamation"></i>',
      info: '<i class="fa-solid fa-circle-info"></i>'
    };

    toast.innerHTML = `
      <div class="rox-toast-icon">
        ${iconMap[type] || iconMap.info}
      </div>
      <div class="rox-toast-content">
        <div class="rox-toast-title">${title}</div>
        ${message ? `<div class="rox-toast-message">${message}</div>` : ''}
      </div>
      <button class="rox-toast-close" aria-label="Chiudi notifica">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="rox-toast-progress">
        <div class="rox-toast-progress-bar" style="animation: roxToastProgress ${duration}ms linear forwards;"></div>
      </div>
    `;

    this.container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.add("rox-toast-visible");
    });

    const closeBtn = toast.querySelector(".rox-toast-close");
    let timer = null;

    const removeToast = () => {
      if (timer) clearTimeout(timer);
      toast.classList.remove("rox-toast-visible");
      toast.classList.add("rox-toast-leaving");
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    };

    if (closeBtn) closeBtn.addEventListener("click", removeToast);
    if (duration > 0) timer = setTimeout(removeToast, duration);

    return toast;
  },
  success(title, message, duration) { return this.show({ title, message, type: 'success', duration }); },
  error(title, message, duration) { return this.show({ title, message, type: 'error', duration }); },
  info(title, message, duration) { return this.show({ title, message, type: 'info', duration }); },
  warning(title, message, duration) { return this.show({ title, message, type: 'warning', duration }); }
};
