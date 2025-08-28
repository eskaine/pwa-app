import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCLYgdDFtSI2cXyRbJwblm3eLC1fpue2Ns",
  authDomain: "pwa-app-83b92.firebaseapp.com",
  projectId: "pwa-app-83b92",
  storageBucket: "pwa-app-83b92.firebasestorage.app",
  messagingSenderId: "884850723282",
  appId: "1:884850723282:web:8965ee70841f0289c3e00b"
};

const app = initializeApp(firebaseConfig);

// Check if messaging is supported (will fail on iOS Safari)
const isMessagingSupported = () => {
  try {
    return typeof navigator !== 'undefined' && 
           'serviceWorker' in navigator && 
           'Notification' in window &&
           !(/iPad|iPhone|iPod/.test(navigator.userAgent));
  } catch (error) {
    console.log('Messaging support check failed:', error);
    return false;
  }
};

let messaging = null;
try {
  if (isMessagingSupported()) {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.log('Firebase messaging not supported in this browser:', error);
}

export { messaging, getToken, onMessage, isMessagingSupported };