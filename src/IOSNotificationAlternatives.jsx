import { useState, useEffect } from 'react';

const IOSNotificationAlternatives = () => {
  const [inAppNotifications, setInAppNotifications] = useState([]);
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    // Simulate receiving notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 10 seconds
        addInAppNotification();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const addInAppNotification = () => {
    const notification = {
      id: Date.now(),
      title: 'New Update Available',
      body: `Update received at ${new Date().toLocaleTimeString()}`,
      timestamp: Date.now(),
      read: false
    };

    setInAppNotifications(prev => [notification, ...prev.slice(0, 9)]);
    setBadgeCount(prev => prev + 1);
    
    // Update PWA badge (iOS 16.4+)
    if ('setAppBadge' in navigator) {
      navigator.setAppBadge(badgeCount + 1);
    }
  };

  const markAsRead = (id) => {
    setInAppNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setBadgeCount(prev => Math.max(0, prev - 1));
    
    if ('setAppBadge' in navigator) {
      navigator.setAppBadge(Math.max(0, badgeCount - 1));
    }
  };

  const clearBadge = () => {
    setBadgeCount(0);
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge();
    }
  };

  const scheduleLocalNotification = () => {
    // Schedule a notification for 10 seconds from now
    setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Scheduled Notification', {
          body: 'This was scheduled 10 seconds ago!',
          icon: '/vite.svg'
        });
      } else {
        addInAppNotification();
      }
    }, 10000);
    
    alert('Local notification scheduled for 10 seconds from now!');
  };

  const sendEmailNotification = () => {
    // Simulate email fallback
    const subject = 'PWA Notification';
    const body = 'This would be sent via email as a fallback for iOS notifications';
    
    // Open email client (fallback method)
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const triggerBackgroundSync = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if ('sync' in registration) {
          await registration.sync.register('background-sync');
          alert('Background sync registered! Data will sync when connection is available.');
        } else {
          alert('Background sync not supported');
        }
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px 0', borderRadius: '8px' }}>
      <h3>🍎 iOS Notification Alternatives</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>📬 In-App Notifications</h4>
        <p>Badge Count: <span style={{ 
          backgroundColor: badgeCount > 0 ? 'red' : 'gray', 
          color: 'white', 
          padding: '2px 8px', 
          borderRadius: '12px',
          fontSize: '12px'
        }}>
          {badgeCount}
        </span></p>
        
        <button onClick={addInAppNotification} style={{ margin: '5px', padding: '5px 10px' }}>
          Add Test Notification
        </button>
        <button onClick={clearBadge} style={{ margin: '5px', padding: '5px 10px' }}>
          Clear Badge
        </button>
        
        <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '10px' }}>
          {inAppNotifications.map(notif => (
            <div 
              key={notif.id}
              style={{
                padding: '10px',
                margin: '5px 0',
                backgroundColor: notif.read ? '#f5f5f5' : '#e3f2fd',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
              onClick={() => markAsRead(notif.id)}
            >
              <strong>{notif.title}</strong>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>{notif.body}</p>
              <small>{new Date(notif.timestamp).toLocaleTimeString()}</small>
              {!notif.read && <span style={{ color: 'blue', marginLeft: '10px' }}>NEW</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>⏰ Alternative Notification Methods</h4>
        
        <button 
          onClick={scheduleLocalNotification}
          style={{ margin: '5px', padding: '8px 16px', display: 'block' }}
        >
          🔔 Schedule Local Notification (10s)
        </button>
        
        <button 
          onClick={sendEmailNotification}
          style={{ margin: '5px', padding: '8px 16px', display: 'block' }}
        >
          📧 Email Fallback Notification
        </button>
        
        <button 
          onClick={triggerBackgroundSync}
          style={{ margin: '5px', padding: '8px 16px', display: 'block' }}
        >
          🔄 Background Sync (Check for Updates)
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
        <h4>💡 iOS Notification Strategy</h4>
        <ol style={{ textAlign: 'left', fontSize: '14px' }}>
          <li><strong>iOS 16.4+:</strong> Use Web Push API (requires PWA installation)</li>
          <li><strong>iOS 13-16.3:</strong> In-app notifications + badge counts</li>
          <li><strong>Critical alerts:</strong> Email/SMS fallback</li>
          <li><strong>Background updates:</strong> Sync when app opens</li>
          <li><strong>User engagement:</strong> Encourage PWA installation for better experience</li>
        </ol>
      </div>
    </div>
  );
};

export default IOSNotificationAlternatives;