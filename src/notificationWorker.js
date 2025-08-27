// Notification Worker - Extends the auto-generated service worker
export const registerNotificationHandlers = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'TRIGGER_NOTIFICATION') {
        const { title, body, data } = event.data.payload;
        
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body,
            icon: '/vite.svg',
            badge: '/vite.svg',
            tag: 'app-notification',
            data,
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
        });
      }
    });

    // Handle notification clicks
    navigator.serviceWorker.addEventListener('notificationclick', event => {
      event.notification.close();
      
      if (event.action === 'view') {
        window.focus();
      } else if (event.action === 'dismiss') {
        return;
      } else {
        window.focus();
      }
    });
  }
};

// Send message to service worker to show notification
export const showServiceWorkerNotification = (title, body, data = {}) => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        body,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'manual-notification',
        data,
        requireInteraction: false,
        silent: false
      });
    });
  }
};

// Background sync registration
export const registerBackgroundSync = (tag = 'background-sync') => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then(registration => {
      return registration.sync.register(tag);
    }).catch(error => {
      console.log('Background sync registration failed:', error);
    });
  }
};