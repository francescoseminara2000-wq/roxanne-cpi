/**
 * Roxanne CPI Light - Utilities Module
 */

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatFullName(p) {
  if (!p) return "";
  const nome = (p.nome || "").trim();
  const cognome = (p.cognome || "").trim();
  
  if (!cognome) return nome;
  if (!nome) return cognome;
  
  // Se il nome contiene già il cognome, evita duplicazioni
  if (nome.toLowerCase().includes(cognome.toLowerCase())) {
    return nome;
  }
  return `${nome} ${cognome}`.trim();
}

function getPersonaInitials(p) {
  if (!p) return "NN";
  const first = (p.nome || "").trim().split(/\s+/)[0] || "";
  const last = (p.cognome || "").trim().split(/\s+/)[0] || "";
  if (first && last && !first.toLowerCase().includes(last.toLowerCase())) {
    return (first.charAt(0) + last.charAt(0)).toUpperCase();
  }
  const fullName = formatFullName(p);
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return fullName.substring(0, 2).toUpperCase() || "NN";
}

window.formatDate = formatDate;
window.escapeHtml = escapeHtml;
window.formatFullName = formatFullName;
window.getPersonaInitials = getPersonaInitials;
