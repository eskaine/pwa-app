import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// Precache app assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Background notification timer
let backgroundTimer = null;

// Start background notifications when SW activates
self.addEventListener('activate', event => {
  console.log('SW activated - starting background notifications');
  startBackgroundNotifications();
  event.waitUntil(clients.claim());
});

self.addEventListener('install', event => {
  console.log('SW installed');
  self.skipWaiting();
});

function startBackgroundNotifications() {
  // Clear existing timer
  if (backgroundTimer) {
    clearInterval(backgroundTimer);
  }
  
  // Start background notification timer
  backgroundTimer = setInterval(async () => {
    console.log('Background notification timer fired');
    
    // Check if any clients are focused (app in foreground)
    const clients = await self.clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    });
    
    const hasVisibleClient = clients.some(client => client.visibilityState === 'visible');
    
    // Only show background notifications when app is not visible
    if (!hasVisibleClient) {
      console.log('App is in background - showing notification');
      
      // Random chance to show notification (30%)
      if (Math.random() < 0.3) {
        await showBackgroundNotification({
          title: 'Background Location Update',
          body: `Location tracked in background at ${new Date().toLocaleTimeString()}`,
          tag: 'background-location'
        });
      }
    } else {
      console.log('App is in foreground - skipping background notification');
    }
  }, 10000); // Every 10 seconds
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