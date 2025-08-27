import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// Precache app assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Firebase messaging in service worker
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
  console.log('FCM background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Background notification timer
let backgroundTimer = null;

// Start background notifications when SW activates  
self.addEventListener('activate', event => {
  console.log('SW activated - starting background notifications');
  event.waitUntil(clients.claim());
});

self.addEventListener('install', event => {
  console.log('SW installed');
  self.skipWaiting();
});

// Simulate push notifications (works when tab is minimized but browser open)
function startBackgroundNotifications() {
  console.log('Starting background notification simulation');
  
  // Clear existing timer
  if (backgroundTimer) {
    clearInterval(backgroundTimer);
  }
  
  // This works when:
  // - Tab is minimized but browser is open
  // - Tab is in background but browser is open
  // Does NOT work when:
  // - Browser is completely closed
  // - System puts browser to sleep
  backgroundTimer = setInterval(async () => {
    console.log('Background timer fired');
    
    try {
      const clientList = await self.clients.matchAll({ 
        type: 'window',
        includeUncontrolled: true 
      });
      
      const hasVisibleClient = clientList.some(client => 
        client.visibilityState === 'visible' && client.focused
      );
      
      // Show notification when app is not actively focused
      if (!hasVisibleClient && clientList.length > 0) {
        console.log('App backgrounded - showing notification');
        
        const notification = {
          title: '🔔 Background Alert',
          body: `Notification at ${new Date().toLocaleTimeString()} (tab minimized)`,
          tag: 'background-demo'
        };
        
        await showBackgroundNotification(notification);
        
        // Send to main app for history tracking
        clientList.forEach(client => {
          client.postMessage({
            type: 'NOTIFICATION_SENT',
            notification: {
              id: Date.now(),
              title: notification.title,
              body: notification.body,
              timestamp: new Date().toISOString(),
              type: 'background-alert'
            }
          });
        });
      } else if (clientList.length === 0) {
        console.log('No clients - browser may be closed');
        // This rarely works due to browser limitations
        const notification = {
          title: '📱 PWA Notification', 
          body: `Background notification - browser closed`,
          tag: 'closed-demo'
        };
        
        await showBackgroundNotification(notification);
      }
    } catch (error) {
      console.error('Background notification error:', error);
    }
  }, 10000);
}

async function showBackgroundNotification(options) {
  try {
    await self.registration.showNotification(options.title, {
      body: options.body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: options.tag || 'background-notification',
      requireInteraction: false,
      silent: false,
      actions: [
        {
          action: 'open',
          title: 'Open App'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      data: {
        timestamp: Date.now(),
        url: '/'
      }
    });
    
    console.log('Background notification shown:', options.title);
  } catch (error) {
    console.error('Failed to show background notification:', error);
  }
}

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event.action);
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // Focus existing window if available
        for (let client of clientList) {
          if (client.url.includes('/') && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if no existing window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', event => {
  console.log('SW received message:', event.data);
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag } = event.data.payload;
    showBackgroundNotification({ title, body, tag });
  }
  
  if (event.data && event.data.type === 'START_BACKGROUND_SYNC') {
    console.log('Starting background sync from message');
    startBackgroundNotifications();
  }
});

// Background sync event
self.addEventListener('sync', event => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'location-sync') {
    event.waitUntil(handleLocationSync());
  }
});

async function handleLocationSync() {
  console.log('Handling location sync');
  
  await showBackgroundNotification({
    title: 'Location Sync',
    body: 'Background location sync completed',
    tag: 'location-sync'
  });
}