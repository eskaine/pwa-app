// Custom Service Worker for Background Notifications
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Background sync for notifications
self.addEventListener('sync', event => {
  if (event.tag === 'background-notification-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

// Handle background sync
async function handleBackgroundSync() {
  try {
    // Simulate checking for new notifications from server
    const notifications = await checkForNewNotifications();
    
    for (const notification of notifications) {
      await self.registration.showNotification(notification.title, {
        body: notification.body,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: notification.type || 'background-sync',
        data: notification.data,
        requireInteraction: false,
        actions: [
          {
            action: 'view',
            title: 'View',
            icon: '/vite.svg'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      });
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Mock function to check for new notifications
async function checkForNewNotifications() {
  // In a real app, this would fetch from your backend API
  const mockNotifications = [];
  
  // Random chance to have background notifications
  if (Math.random() < 0.5) {
    mockNotifications.push({
      title: 'Location Alert',
      body: 'Your location tracking is active in the background',
      type: 'location-background',
      data: { timestamp: Date.now() }
    });
  }
  
  return mockNotifications;
}

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for (let client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Handle push notifications (for real backend integration)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'Push Notification', {
        body: data.body || 'You have a new notification',
        icon: data.icon || '/vite.svg',
        badge: data.badge || '/vite.svg',
        tag: data.tag || 'push-notification',
        data: data.data || {},
        requireInteraction: data.requireInteraction || false
      })
    );
  }
});

// Periodic background sync (requires registration)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'location-sync') {
    event.waitUntil(handlePeriodicLocationSync());
  }
});

async function handlePeriodicLocationSync() {
  try {
    // This would normally sync location data with server
    // and potentially trigger notifications based on server response
    console.log('Periodic background location sync triggered');
    
    // Show a background sync notification
    await self.registration.showNotification('Background Sync', {
      body: 'Location data synchronized in the background',
      icon: '/vite.svg',
      tag: 'periodic-sync',
      silent: true
    });
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}

// Message handling from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'TRIGGER_NOTIFICATION') {
    const { title, body, data } = event.data.payload;
    
    self.registration.showNotification(title, {
      body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: 'manual-trigger',
      data,
      requireInteraction: false
    });
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});