importScripts(
  "https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js"
);


importScripts(
  "https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js"
);

self.addEventListener("install", event => {

  self.skipWaiting();

});

self.addEventListener("activate", event => {

  event.waitUntil(

    clients.claim()

  );

});

self.addEventListener("message", event => {

  if (event.data?.type === "SKIP_WAITING") {

    self.skipWaiting();

  }

});

firebase.initializeApp({

  apiKey: "AIzaSyBVEqO-fKJvNoWvfsOi7rQzLOGbwB2HFLg",
  authDomain: "webapp-tpe-sbc.firebaseapp.com",
  projectId: "webapp-tpe-sbc",
  storageBucket: "webapp-tpe-sbc.firebasestorage.app",
  messagingSenderId: "1012545018348",
  appId: "1:1012545018348:web:80c2160979ffebd10948c9"

});



const messaging = firebase.messaging();



//console.log("🔥 SERVICE WORKER + FIREBASE ATIVO");



messaging.onBackgroundMessage((payload) => {


  //console.log("📩 BACKGROUND MESSAGE:",JSON.stringify(payload));


  const title =
    payload.data?.titulo ||
    payload.notification?.title ||
    "Nova notificação";



  const body =
    payload.data?.mensagem ||
    payload.notification?.body ||
    "";



  const iconPath =
  self.location.hostname === "127.0.0.1" ||
    self.location.hostname === "localhost"
      ? "/icon-192.png"
      : "/tpe-sbc/icon-192.png";

  self.registration.showNotification(title, {

    body,

    icon: iconPath,

    badge: iconPath,

    data: payload.data

  })
  .then(() => {

    //console.log("✅ NOTIFICAÇÃO EXIBIDA");

  });


});

// DAQUI PRA CIMA FUNCIONAVA ANTES DAS NOTIFICAÇÕES AOS AACS. DQQUI PRA BAIXO NOVO - DELETAR E DESCOEMNTAR ACIMA SE DER ERRO
self.addEventListener("notificationclick", event => {

  event.notification.close();

  const dados =
    event.notification.data || {};

    //console.log("DADOS PUSH RECEBIDOS:", dados);

  let url;

  // ===============================
  // NOVO: Notificação de Escala
  // ===============================

  if (dados.tipo === "escala") {

    const params =
      new URLSearchParams({

        tipo: "escala",

        ponto: dados.ponto || "",

        dia: dados.dia || "",

        turno: dados.turno || "",

        frequencia: dados.frequencia || "",

        idParticipante: dados.idParticipante || ""

      });

    url =
      self.location.hostname === "127.0.0.1" ||
      self.location.hostname === "localhost"

        ? `/?${params.toString()}`

        : `/tpe-sbc/?${params.toString()}`;

  }

  // ===============================
  // COMPORTAMENTO ATUAL (NÃO ALTERADO)
  // ===============================

  else {

    const idVaga =
      dados.idVaga || "";

    url =
      self.location.hostname === "127.0.0.1" ||
      self.location.hostname === "localhost"

        ? `/?idVaga=${encodeURIComponent(idVaga)}`

        : `/tpe-sbc/?idVaga=${encodeURIComponent(idVaga)}`;

  }

  event.waitUntil(

    clients.matchAll({

      type: "window",

      includeUncontrolled: true

    }).then(clientList => {

      for (const client of clientList) {

        client.focus();

        client.navigate(url);

        return;

      }

      return clients.openWindow(url);

    })

  );

});