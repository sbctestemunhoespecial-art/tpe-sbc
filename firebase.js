import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getMessaging,
  getToken,
  deleteToken,
  onMessage
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging.js";


const firebaseConfig = {

  apiKey: "AIzaSyBVEqO-fKJvNoWvfsOi7rQzLOGbwB2HFLg",
  authDomain: "webapp-tpe-sbc.firebaseapp.com",
  projectId: "webapp-tpe-sbc",
  storageBucket: "webapp-tpe-sbc.firebasestorage.app",
  messagingSenderId: "1012545018348",
  appId: "1:1012545018348:web:80c2160979ffebd10948c9"

};


const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);


//console.log("Firebase inicializado.");


// ===============================
// MENSAGEM COM APP ABERTO
// ===============================

onMessage(messaging, async (payload) => {

  /*console.log(
    "DADOS PUSH RECEBIDOS:",
    payload.data
  );


  console.log(
    "📩 FOREGROUND MESSAGE:",
    JSON.stringify(payload)
  );*/


  const title =
    payload.data?.titulo ||
    payload.notification?.title ||
    "Nova notificação";


  const body =
    payload.data?.mensagem ||
    payload.notification?.body ||
    "";

  const iconPath =
  location.hostname === "127.0.0.1" ||
  location.hostname === "localhost"
    ? "./icon-192.png"
    : "/tpe-sbc/icon-192.png";

  const registration =
    await navigator.serviceWorker.ready;


  registration.showNotification(title, {

    body,
    icon: iconPath,
    /*icon: "/icon-192.png",*/
    data: payload.data

  })
  .then(() => {

    console.log(
      "✅ NOTIFICAÇÃO FOREGROUND EXIBIDA"
    );

  })
  .catch(err => {

    console.error(
      "❌ ERRO FOREGROUND:",
      err
    );

  });


});



// ===============================
// REGISTRA TOKEN
// ===============================

async function registrarPush(idUsuarioLogado) {


  /*console.log(
    "🔥 REGISTRAR PUSH INICIADO:",
    idUsuarioLogado
  );*/


  if (!idUsuarioLogado) {

    /*console.log(
      "Usuário não informado."
    );*/

    return;

  }


  const permissao =
    await Notification.requestPermission();


  /*console.log(
    "Permissão:",
    permissao
  );*/


  if (permissao !== "granted") {

    return;

  }



  const registration =
    await navigator.serviceWorker.ready;


  /*console.log(
    "🔥 SW:",
    registration.scope
  );*/



  const token =
    await getToken(messaging, {

      vapidKey:
        "BAhESxPEg1ZWMh2t6ZXLhXTHO_FqRrd9fKgETRl-VzJJ1c5ZR7nMuL54lr6uDp2UYBsznU_4w2uyoQemA83IXng",

      serviceWorkerRegistration:
        registration


    });



  /*console.log(
    "TOKEN:",
    token
  );*/


  salvarTokenFCM(
    idUsuarioLogado,
    token
  );


}



window.registrarPush = registrarPush;

window.messaging = messaging;
window.deleteToken = deleteToken;