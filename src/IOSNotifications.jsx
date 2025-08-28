import { useState, useEffect } from 'react';

const IOSNotifications = () => {
  const [isIOSWebPushSupported, setIsIOSWebPushSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    checkIOSWebPushSupport();
  }, []);

  const checkIOSWebPushSupport = () => {
    // iOS 16.4+ supports Web Push API
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasPushManager = 'PushManager' in window;
    const hasNotifications = 'Notification' in window;
    
    const supported = isIOS && hasServiceWorker && hasPushManager && hasNotifications;
    setIsIOSWebPushSupported(supported);
    
    if (hasNotifications) {
      setPermission(Notification.permission);
    }
    
    console.log('iOS Web Push Support Check:', {
      isIOS,
      hasServiceWorker,
      hasPushManager,
      hasNotifications,
      supported
    });
  };

  const requestIOSWebPushPermission = async () => {
    if (!isIOSWebPushSupported) {
      alert('Web Push not supported on this iOS version. Requires iOS 16.4+');
      return;
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        // Register service worker and get push subscription
        const registration = await navigator.serviceWorker.ready;
        
        // You'll need to replace this with your actual VAPID public key
        const vapidPublicKey = 'BJm1LxKY-pocd7qwIhPGiCFMpsAk77O8L32giL2ntAG6G41IOGpBRGk--JxNfw8QloaXBaYbfMxCqqNhZxVWAOI';
        
        const pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey
        });

        setSubscription(pushSubscription);
        console.log('iOS Web Push subscription:', pushSubscription);
        
        // Send subscription to your server
        await sendSubscriptionToServer(pushSubscription);
        
        // Show test notification
        await registration.showNotification('iOS Web Push Enabled!', {
          body: 'You can now receive push notifications on iOS Safari',
          icon: '/vite.svg',
          badge: '/vite.svg'
        });
      }
    } catch (error) {
      console.error('iOS Web Push setup failed:', error);
    }
  };

  const sendSubscriptionToServer = async (subscription) => {
    // TODO: Replace with your actual server endpoint
    console.log('Subscription to send to server:', JSON.stringify(subscription));
    
    // Example server call:
    // await fetch('/api/push-subscriptions', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ subscription, platform: 'ios' })
    // });
  };

  const sendTestNotification = async () => {
    if (!subscription) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Test Notification', {
        body: `Sent at ${new Date().toLocaleTimeString()}`,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'test-notification',
        requireInteraction: false
      });
    } catch (error) {
      console.error('Test notification failed:', error);
    }
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px 0', borderRadius: '8px' }}>
      <h3>📱 iOS Notifications (iOS 16.4+)</h3>
      
      {!isIOS ? (
        <p style={{ color: 'gray' }}>This section is specific to iOS devices</p>
      ) : !isIOSWebPushSupported ? (
        <div>
          <p style={{ color: 'orange' }}>⚠️ Web Push not supported</p>
          <p>Requires iOS 16.4+ and PWA installation</p>
          <details style={{ marginTop: '10px' }}>
            <summary>Alternative options for older iOS versions:</summary>
            <ul style={{ textAlign: 'left', marginTop: '10px' }}>
              <li>🔄 <strong>Periodic Background Sync</strong> - Check for updates when app opens</li>
              <li>🎯 <strong>In-App Notifications</strong> - Show alerts within the app</li>
              <li>📧 <strong>Email/SMS fallback</strong> - For critical notifications</li>
              <li>🔔 <strong>Local Notifications</strong> - Schedule notifications based on user actions</li>
            </ul>
          </details>
        </div>
      ) : (
        <div>
          <p>Status: <span style={{ color: permission === 'granted' ? 'green' : 'orange' }}>
            {permission}
          </span></p>
          
          {permission === 'default' && (
            <button 
              onClick={requestIOSWebPushPermission}
              style={{ marginRight: '10px', padding: '8px 16px' }}
            >
              Enable iOS Web Push
            </button>
          )}
          
          {permission === 'granted' && !subscription && (
            <button 
              onClick={requestIOSWebPushPermission}
              style={{ marginRight: '10px', padding: '8px 16px' }}
            >
              Setup Push Subscription
            </button>
          )}
          
          {subscription && (
            <div>
              <p style={{ color: 'green' }}>✅ iOS Web Push Active!</p>
              <button 
                onClick={sendTestNotification}
                style={{ marginRight: '10px', padding: '8px 16px' }}
              >
                Send Test Notification
              </button>
              <details style={{ marginTop: '10px' }}>
                <summary>Subscription Details</summary>
                <textarea 
                  value={JSON.stringify(subscription, null, 2)}
                  readOnly
                  style={{ width: '100%', height: '100px', fontSize: '12px' }}
                />
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IOSNotifications;