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
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        const fcmToken = await getToken(messaging, {
          vapidKey: 'BHIu2q_7NueR77sDsPFTNeSWGXnFsxSpOKAs_9ne6Sz6gKemZY4Up16kWFXaISPqL_VayLv7N-UpWbCaqbLqrVA'
        });
        
        if (fcmToken) {
          console.log('FCM Token:', fcmToken);
          setToken(fcmToken);
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
    &lt;div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px 0' }}&gt;
      &lt;h3&gt;Firebase Cloud Messaging&lt;/h3&gt;
      &lt;p&gt;Permission: {permission}&lt;/p&gt;
      
      {permission !== 'granted' && (
        &lt;button onClick={requestPermission}&gt;
          Enable Notifications
        &lt;/button&gt;
      )}
      
      {token && (
        &lt;div&gt;
          &lt;p&gt;FCM Token (copy this for testing):&lt;/p&gt;
          &lt;textarea 
            value={token} 
            readOnly 
            style={{ width: '100%', height: '100px' }}
          /&gt;
          &lt;button onClick={copyToken}&gt;Copy Token&lt;/button&gt;
        &lt;/div&gt;
      )}
    &lt;/div&gt;
  );
};

export default NotificationManager;