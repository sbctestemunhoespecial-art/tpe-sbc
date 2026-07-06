/*importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBVEqO-fKJvNoWvfsOi7rQzLOGbwB2HFLg",
  authDomain: "webapp-tpe-sbc.firebaseapp.com",
  projectId: "webapp-tpe-sbc",
  messagingSenderId: "1012545018348",
  appId: "1:1012545018348:web:80c2160979ffebd10948c9"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Push recebido em background:", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/tpe-sbc/icon-192.png"
  });
});
*/

/*console.log("🔥 SW Firebase carregado");

importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBVEqO-fKJvNoWvfsOi7rQzLOGbwB2HFLg",
  authDomain: "webapp-tpe-sbc.firebaseapp.com",
  projectId: "webapp-tpe-sbc",
  storageBucket: "webapp-tpe-sbc.firebasestorage.app",
  messagingSenderId: "1012545018348",
  appId: "1:1012545018348:web:80c2160979ffebd10948c9"
});

const messaging = firebase.messaging();

// 🔔 NOTIFICAÇÃO EM BACKGROUND
messaging.onBackgroundMessage(function(payload) {
  console.log("Push recebido:", payload);

  const notificationTitle = payload.notification?.title || "Nova notificação";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/icon-192.png"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});*/

/*importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBVEqO-fKJvNoWvfsOi7rQzLOGbwB2HFLg",
  authDomain: "webapp-tpe-sbc.firebaseapp.com",
  projectId: "webapp-tpe-sbc",
  messagingSenderId: "1012545018348",
  appId: "1:1012545018348:web:80c2160979ffebd10948c9"
});

const messaging = firebase.messaging();

console.log("🔥 SW Firebase ativo");

// 🔴 ISSO É O MAIS IMPORTANTE
messaging.onBackgroundMessage((payload) => {

  console.log("📩 PUSH RECEBIDO NO SW:", payload);

  const title = payload?.notification?.title || "Nova notificação";
  const options = {
    body: payload?.notification?.body || "",
    icon: "/icon-192.png"
  };

  self.registration.showNotification(title, options);
});*/

/*console.log("🔥 FIREBASE SW ATIVO");

importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBVEqO-fKJvNoWvfsOi7rQzLOGbwB2HFLg",
  authDomain: "webapp-tpe-sbc.firebaseapp.com",
  projectId: "webapp-tpe-sbc",
  messagingSenderId: "1012545018348",
  appId: "1:1012545018348:web:80c2160979ffebd10948c9"
});

const messaging = firebase.messaging();

console.log("🔥 SW Firebase ativo (FINAL)");

messaging.onBackgroundMessage((payload) => {

  console.log("📩 FIREBASE MESSAGE:", payload);

  self.registration.showNotification(
    payload.notification?.title || "Nova notificação",
    {
      body: payload.notification?.body || "",
      icon: "/icon-192.png"
    }
  );
});*/
/*importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBVEqO-fKJvNoWvfsOi7rQzLOGbwB2HFLg",
  authDomain: "webapp-tpe-sbc.firebaseapp.com",
  projectId: "webapp-tpe-sbc",
  messagingSenderId: "1012545018348",
  appId: "1:1012545018348:web:80c2160979ffebd10948c9"
});

const messaging = firebase.messaging();

console.log("🔥 SW Firebase ativo FINAL");

// 🔴 FORÇA CAPTURA DE BACKGROUND MESSAGES
messaging.setBackgroundMessageHandler(function(payload) {

  console.log("📩 BACKGROUND (FORÇADO):", payload);

  const title = payload?.notification?.title || "Nova notificação";
  const options = {
    body: payload?.notification?.body || "",
    icon: "/icon-192.png"
  };

  return self.registration.showNotification(title, options);
});*/

/*importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBVEqO-fKJvNoWvfsOi7rQzLOGbwB2HFLg",
  authDomain: "webapp-tpe-sbc.firebaseapp.com",
  projectId: "webapp-tpe-sbc",
  messagingSenderId: "1012545018348",
  appId: "1:1012545018348:web:80c2160979ffebd10948c9"
});

console.log("🔥 SW carregado com sucesso");

self.addEventListener("install", () => {
  console.log("🟢 SW INSTALL OK");
});

self.addEventListener("activate", () => {
  console.log("🟡 SW ACTIVE OK");
});

const messaging = firebase.messaging();*/

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

/* 🔥 IGNORA FIREBASE LAYER (porque não está sendo chamado no seu caso)
self.addEventListener("push", function(event) {

  console.log("📩 PUSH RECEBIDO DIRETO:", event);

  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {}

  const title =
    data?.notification?.title ||
    data?.data?.titulo ||
    "Nova notificação";

  const body =
    data?.notification?.body ||
    data?.data?.mensagem ||
    "";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: "/icon-192.png"
    })
  );
});*/
self.addEventListener("push", function(event) {

  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.log("Erro ao parsear payload:", e);
  }

  const title =
    data?.notification?.title ||
    data?.data?.titulo ||
    "Nova notificação";

  const body =
    data?.notification?.body ||
    data?.data?.mensagem ||
    "";

  //console.log("📩 PUSH FINAL:", data);
  console.log(JSON.stringify(data, null, 2));
  console.log("Antes do showNotification");

  /*event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      data: data
    })
  );*/
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      data: data
    }).then(() => {
      console.log("✅ showNotification executado");
    }).catch(err => {
      console.error("❌ Erro no showNotification:", err);
    })
  );
});