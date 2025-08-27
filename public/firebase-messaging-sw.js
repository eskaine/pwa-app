importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCLYgdDFtSI2cXyRbJwblm3eLC1fpue2Ns",
  authDomain: "pwa-app-83b92.firebaseapp.com",
  projectId: "pwa-app-83b92",
  storageBucket: "pwa-app-83b92.firebasestorage.app",
  messagingSenderId: "884850723282",
  appId: "1:884850723282:web:8965ee70841f0289c3e00b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('FCM background message received:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});