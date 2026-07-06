import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getMessaging,
  getToken,
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

console.log("Firebase inicializado.");

async function registrarPush() {

  const permissao = await Notification.requestPermission();

  console.log("Permissão:", permissao);

  if (permissao !== "granted") {
    console.log("Usuário não permitiu notificações.");
    return;
  }

  /*const token = await getToken(
    messaging,
    {
      vapidKey: "BAhESxPEg1ZWMh2t6ZXLhXTHO_FqRrd9fKgETRl-VzJJ1c5ZR7nMuL54lr6uDp2UYBsznU_4w2uyoQemA83IXng"
    }
  );*/

  const registration = await navigator.serviceWorker.ready;

    const token = await getToken(
    messaging,
    {
        vapidKey: "BAhESxPEg1ZWMh2t6ZXLhXTHO_FqRrd9fKgETRl-VzJJ1c5ZR7nMuL54lr6uDp2UYBsznU_4w2uyoQemA83IXng",
        serviceWorkerRegistration: registration
    }
    );

console.log(token);

  console.log("TOKEN:");
  console.log(token);

}

registrarPush();