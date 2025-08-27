import { useEffect, useState } from 'react';
import { messaging, getToken, onMessage } from './firebase';

const NotificationManager = () => {
  const [token, setToken] = useState('');
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    requestPermission();
    setupMessageListener();
  }, []);

  const requestPermission = async () => {
    try {
      console.log('Requesting notification permission...');
      
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      setPermission(permission);
      
      if (permission === 'granted') {
        console.log('Permission granted, requesting FCM token...');
        
        // Try to get token without service worker first
        try {
          const fcmToken = await getToken(messaging, {
            vapidKey: 'BHIu2q_7NueR77sDsPFTNeSWGXnFsxSpOKAs_9ne6Sz6gKemZY4Up16kWFXaISPqL_VayLv7N-UpWbCaqbLqrVA'
          });
          
          console.log('FCM Token result:', fcmToken);
          if (fcmToken) {
            console.log('FCM Token:', fcmToken);
            setToken(fcmToken);
          } else {
            console.log('No FCM token received');
          }
        } catch (tokenError) {
          console.log('Failed to get token without SW, trying with SW registration:', tokenError);
          
          // If that fails, try with service worker registration
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Firebase SW registered:', registration);
            
            const fcmToken = await getToken(messaging, {
              vapidKey: 'BHIu2q_7NueR77sDsPFTNeSWGXnFsxSpOKAs_9ne6Sz6gKemZY4Up16kWFXaISPqL_VayLv7N-UpWbCaqbLqrVA',
              serviceWorkerRegistration: registration
            });
            
            console.log('FCM Token with SW:', fcmToken);
            if (fcmToken) {
              console.log('FCM Token:', fcmToken);
              setToken(fcmToken);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const setupMessageListener = () => {
    onMessage(messaging, (payload) => {
      console.log('FCM foreground message:', payload);
      
      if (Notification.permission === 'granted') {
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
    </div>
  );
};

export default NotificationManager;