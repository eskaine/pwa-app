import { useEffect, useState } from 'react';
import { messaging, getToken, onMessage, isMessagingSupported } from './firebase';

const NotificationManager = () => {
  const [token, setToken] = useState('');
  const [permission, setPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window 
      ? Notification.permission 
      : 'not-supported'
  );
  const [isSupported, setIsSupported] = useState(false);
  const [notificationSupported, setNotificationSupported] = useState(false);

  useEffect(() => {
    // Check if Notification API is available
    const notifSupported = typeof window !== 'undefined' && 'Notification' in window;
    setNotificationSupported(notifSupported);
    
    const supported = isMessagingSupported();
    setIsSupported(supported);
    
    if (notifSupported) {
      setPermission(Notification.permission);
    }
    
    if (supported && messaging && notifSupported) {
      requestPermission();
      setupMessageListener();
    } else {
      console.log('Firebase Cloud Messaging or Notifications not supported on this device/browser');
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported || !messaging || !notificationSupported) {
      console.log('Skipping FCM token request - not supported on this browser');
      return;
    }

    try {
      console.log('Requesting notification permission...');
      
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      setPermission(permission);
      
      if (permission === 'granted') {
        console.log('Permission granted, requesting FCM token...');
        
        // Let Firebase handle service worker registration automatically
        try {
          console.log('Getting FCM token with Firebase auto-registration...');
          const fcmToken = await getToken(messaging, {
            vapidKey: 'BJm1LxKY-pocd7qwIhPGiCFMpsAk77O8L32giL2ntAG6G41IOGpBRGk--JxNfw8QloaXBaYbfMxCqqNhZxVWAOI'
          });
          
          console.log('FCM Token result:', fcmToken);
          if (fcmToken) {
            console.log('SUCCESS! FCM Token:', fcmToken);
            setToken(fcmToken);
          } else {
            console.log('No FCM token received');
          }
        } catch (fcmError) {
          console.error('FCM token error:', fcmError);
        }
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const setupMessageListener = () => {
    if (!isSupported || !messaging) {
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('FCM foreground message:', payload);
      
      if (notificationSupported && Notification.permission === 'granted') {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: payload.notification.icon || '/vite.svg'
        });
      }
    });
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px 0' }}>
      <h3>Firebase Cloud Messaging</h3>
      
      {!notificationSupported ? (
        <div>
          <p style={{ color: 'red' }}>❌ Notifications not supported on this browser</p>
          <p>This browser doesn't support the Notification API.</p>
        </div>
      ) : !isSupported ? (
        <div>
          <p style={{ color: 'orange' }}>⚠️ FCM not supported on this browser (likely iOS Safari)</p>
          <p>FCM requires service workers, which are limited on iOS Safari.</p>
          <p>Basic notifications may still work through the Notifications API.</p>
        </div>
      ) : (
        <>
          <p>Permission: {permission}</p>
          <p>Token length: {token.length}</p>
          <p>Has token: {token ? 'Yes' : 'No'}</p>
          
          {permission !== 'granted' && (
            <button onClick={requestPermission}>
              Enable Notifications
            </button>
          )}
          
          {permission === 'granted' && !token && (
            <button onClick={requestPermission}>
              Get FCM Token
            </button>
          )}
          
          {token && (
            <div>
              <p>FCM Token (copy this for testing):</p>
              <textarea 
                value={token} 
                readOnly 
                style={{ width: '100%', height: '100px' }}
              />
              <button onClick={copyToken}>Copy Token</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationManager;