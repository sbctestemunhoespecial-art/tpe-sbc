importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBVEqO-fKJvNoWvfsOi7rQzLOGbwB2HFLg",
  authDomain: "webapp-tpe-sbc.firebaseapp.com",
  projectId: "webapp-tpe-sbc",
  messagingSenderId: "1012545018348",
  appId: "1:1012545018348:web:80c2160979ffebd10948c9"
});

console.log("🔥 SW ATIVO");

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

  /*console.log(
    "📩 BACKGROUND MESSAGE:",
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
  self.location.hostname === "127.0.0.1" ||
  self.location.hostname === "localhost"
    ? "./icon-192.png"
    : "/tpe-sbc/icon-192.png";

  self.registration.showNotification(title, {
    body: body,
    /*icon: "/icon-192.png",*/
    icon: iconPath,
    data: payload.data
  })
  .then(() => {
    console.log("✅ NOTIFICAÇÃO EXIBIDA");
  })
  .catch(err => {
    console.error("❌ ERRO AO EXIBIR:", err);
  });

});