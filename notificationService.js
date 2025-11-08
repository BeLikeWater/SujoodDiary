import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Notification handler - Bildirim geldiğinde nasıl gösterileceğini ayarlar
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Push notification token al
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Bildirim izni verilmedi!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push Token:', token);
  } else {
    alert('Push notification fiziksel cihazda çalışır!');
  }

  return token;
}

// Namaz vakti bildirimi planla
export async function schedulePrayerNotification(prayerName, hour, minute) {
  const trigger = {
    hour: hour,
    minute: minute,
    repeats: true, // Her gün tekrarla
  };

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${prayerName} Vakti! 🕌`,
      body: `${prayerName} namazı vakti geldi. Namazını kılmayı unutma! 🤲`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger,
  });

  return id;
}

// Tüm bildirimleri iptal et
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Belirli bir bildirimi iptal et
export async function cancelNotification(notificationId) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Planlanan bildirimleri listele
export async function getScheduledNotifications() {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  return notifications;
}
