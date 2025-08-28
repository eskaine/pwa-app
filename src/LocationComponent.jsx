import { useState, useEffect } from 'react';
import { mockAPI, startBackgroundNotifications } from './mockApi';
import { registerNotificationHandlers, showServiceWorkerNotification } from './notificationWorker';

export const LocationComponent = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [watching, setWatching] = useState(true);
  const [data, setData] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'not-supported'
  );
  const [notificationHistory, setNotificationHistory] = useState([]);


  // useEffect(() => {
  //   let watchId;

  //   if (!navigator.geolocation) {
  //     setError('Geolocation is not supported by this browser');
  //     return;
  //   }

  //   setLoading(true);
  //   setWatching(true);

  //   watchId = navigator.geolocation.watchPosition(
  //     (position) => {
  //       setLocation({
  //         latitude: position.coords.latitude,
  //         longitude: position.coords.longitude,
  //         accuracy: position.coords.accuracy,
  //         timestamp: position.timestamp
  //       });


  //       console.log("position", data)
  //       console.log("position2", position.timestamp)
  //       setData([...data, position.timestamp]);

  //       setError(null);
  //       setLoading(false);
  //     },
  //     (error) => {
  //       setError(error.message);
  //       setLoading(false);
  //     },
  //     {
  //       enableHighAccuracy: true,
  //       timeout: 10000,
  //       maximumAge: 60000
  //     }
  //   );

  //   return () => {
  //     if (watchId) {
  //       navigator.geolocation.clearWatch(watchId);
  //       setWatching(false);
  //     }
  //   };
  // }, []);

  useEffect(() => {
    requestNotificationPermission();
    registerNotificationHandlers();

    // Listen for messages from service worker
    const handleServiceWorkerMessage = (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_SENT') {
        const notification = event.data.notification;
        setNotificationHistory(prev => [notification, ...prev.slice(0, 9)]);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    // Subscribe to mock API notifications (only when app is active)
    const unsubscribe = mockAPI.subscribe((notification) => {
      setNotificationHistory(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
      showServiceWorkerNotification(notification.title, notification.body, notification.data);
    });

    // const intervalId = setInterval(() => {
    //   getCurrentLocation();
    // }, 10000);

    // Start background sync in service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({
          type: 'START_BACKGROUND_SYNC'
        });

        // Register background sync
        if ('sync' in registration) {
          registration.sync.register('location-sync').catch(err => {
            console.log('Background sync registration failed:', err);
          });
        }
      });
    }

    return () => {
      clearInterval(intervalId);
      unsubscribe();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window && navigator.serviceWorker) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);

        if (permission === 'granted') {
          // Register service worker for background notifications
          const registration = await navigator.serviceWorker.ready;
          console.log('Service Worker registered for notifications');
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  const sendLocationNotification = (location) => {
    if (notificationPermission === 'granted' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('Location Update', {
          body: `New location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
          icon: '/vite.svg',
          badge: '/vite.svg',
          tag: 'location-update',
          requireInteraction: false,
          silent: false
        });
      });
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
        console.log("position", data)
        console.log("position2", position.timestamp)
        const timeString = new Date(position.timestamp).toLocaleTimeString();
        setData(prevData => [...prevData, timeString]);

        // Send notification only when app is active
        if (document.visibilityState === 'visible') {
          mockAPI.triggerPushNotification({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });

          // Also check for location-based alerts
          mockAPI.checkLocationAlerts(position.coords.latitude, position.coords.longitude);
        }

        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const testNotification = async () => {
    await mockAPI.sendNotification({
      title: 'Test Notification',
      body: 'This is a test notification from the PWA!',
      type: 'test',
      data: { test: true, timestamp: Date.now() }
    });
  };

  const startBackgroundTimer = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({
          type: 'START_BACKGROUND_SYNC'
        });
      });
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <span style={{ color: watching ? 'green' : 'orange' }}>
          {watching ? '📍 Location tracking active' : '⏸️ Location tracking paused'}
        </span>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <span style={{
          color:
            notificationPermission === 'not-supported' ? 'gray' :
              notificationPermission === 'granted' ? 'green' : 'red'
        }}>
          🔔 Notifications: {notificationPermission}
        </span>
        {notificationPermission === 'granted' && (
          <>
            <button
              onClick={testNotification}
              style={{ marginLeft: '10px', padding: '5px 10px' }}
            >
              Test Notification
            </button>
            <button
              onClick={startBackgroundTimer}
              style={{ marginLeft: '10px', padding: '5px 10px' }}
            >
              Start Background Timer
            </button>
          </>
        )}
        {notificationPermission === 'not-supported' && (
          <span style={{ marginLeft: '10px', color: 'gray', fontSize: '0.9em' }}>
            (Not supported in this browser)
          </span>
        )}
      </div>

      {/* <button onClick={getCurrentLocation} disabled={loading}>
        {loading ? 'Getting Location...' : 'Refresh Location'}
      </button> */}

      {/* {location && (
        <div>
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>
          <p>Accuracy: {location.accuracy} meters</p>
          <p>Last updated: {new Date(location.timestamp).toLocaleTimeString()}</p>
        </div>
      )} */}

      <div>
        <h3>Location Updates:</h3>
        {data.map((d, index) => {
          return <div key={index}>timestamp: {d}</div>
        })}
      </div>

      {notificationHistory.length > 0 && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
          <h3>Notification History:</h3>
          {notificationHistory.map((notification, index) => (
            <div key={notification.id || index} style={{
              marginBottom: '10px',
              padding: '8px',
              backgroundColor: '#f5f5f5',
              borderRadius: '3px'
            }}>
              <strong style={{ color: 'black' }}>{notification.title}</strong>
              <p style={{ color: 'black' }}>{notification.body}</p>
              <small style={{ color: 'black' }}>
                {notification.type} - {new Date(notification.timestamp).toLocaleTimeString()}
              </small>
            </div>
          ))}
        </div>
      )}

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

    </div>
  );
};
