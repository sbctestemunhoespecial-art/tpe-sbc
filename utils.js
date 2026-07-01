function mostrarSpinner() {
  let el = document.getElementById("spinnerGlobal");

  if (!el) {
    el = document.createElement("div");
    el.id = "spinnerGlobal";
    el.innerHTML = "⏳ Carregando...";
    el.style.position = "fixed";
    el.style.top = "10px";
    el.style.right = "10px";
    el.style.padding = "10px";
    el.style.background = "#000";
    el.style.color = "#fff";
    el.style.zIndex = "99999";
    document.body.appendChild(el);
  }

  el.style.display = "block";
}

function esconderSpinner() {
  const el = document.getElementById("spinnerGlobal");
  if (el) el.style.display = "none";
}

function mostrarAlertaGlobal(msg) {
  alert(msg);
}