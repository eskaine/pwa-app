// Mock backend API for notifications
class MockNotificationAPI {
  constructor() {
    this.notifications = [];
    this.subscribers = [];
  }

  // Simulate API endpoint to send notifications
  async sendNotification(data) {
    const notification = {
      id: Date.now(),
      title: data.title || 'Location Alert',
      body: data.body || 'Your location has been updated',
      timestamp: new Date().toISOString(),
      type: data.type || 'location-update',
      data: data.data || {}
    };

    this.notifications.push(notification);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Trigger notification to service worker
    this.notifySubscribers(notification);
    
    return { success: true, notification };
  }

  // Simulate push notification endpoint
  async triggerPushNotification(locationData) {
    const notification = await this.sendNotification({
      title: 'Location Update',
      body: `New position: ${locationData.lat.toFixed(4)}, ${locationData.lng.toFixed(4)}`,
      type: 'location-push',
      data: { location: locationData, timestamp: Date.now() }
    });

    return notification;
  }

  // Subscribe to notifications (for service worker)
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // Notify all subscribers
  notifySubscribers(notification) {
    this.subscribers.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  // Get notification history
  getNotifications(limit = 10) {
    return this.notifications.slice(-limit).reverse();
  }

  // Simulate weather alerts based on location
  async checkLocationAlerts(lat, lng) {
    // Mock weather conditions
    const conditions = ['sunny', 'cloudy', 'rainy', 'stormy'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    if (condition === 'stormy') {
      await this.sendNotification({
        title: 'Weather Alert',
        body: 'Storm warning in your area!',
        type: 'weather-alert',
        data: { lat, lng, condition }
      });
    }
    
    return { condition, alertSent: condition === 'stormy' };
  }
}

// Create global instance
export const mockAPI = new MockNotificationAPI();

// Simulate periodic background notifications
export const startBackgroundNotifications = () => {
  setInterval(async () => {
    // Random chance to send a background notification
    if (Math.random() < 0.3) { // 30% chance every interval
      await mockAPI.sendNotification({
        title: 'Background Notification',
        body: 'This is a background notification from the mock API',
        type: 'background-sync'
      });
    }
  }, 30000); // Every 30 seconds
};