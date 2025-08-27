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
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };