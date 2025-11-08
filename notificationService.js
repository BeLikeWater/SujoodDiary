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

  // İzin durumunu kontrol et
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  console.log('Mevcut bildirim izni:', existingStatus);
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log('Yeni bildirim izni:', status);
  }
  
  if (finalStatus !== 'granted') {
    alert('Bildirim izni verilmedi! Ayarlardan izin vermeniz gerekiyor.');
    return null;
  }

  // Sadece fiziksel cihazda push token alınabilir
  if (Device.isDevice) {
    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push Token:', token);
    } catch (error) {
      console.log('Push token alınamadı:', error);
    }
  } else {
    console.log('Simülatörde çalışıyor - local bildirimler aktif');
  }

  return token;
}

// Namaz vakti bildirimi planla
export async function schedulePrayerNotification(prayerName, hour, minute) {
  try {
    // iOS ve Android için calendar trigger kullanmalıyız
    const trigger = {
      type: 'calendar',
      hour: parseInt(hour),
      minute: parseInt(minute),
      repeats: true,
    };

    console.log(`${prayerName} için bildirim planlanıyor:`, trigger);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${prayerName} Vakti! 🕌`,
        body: `${prayerName} namazı vakti geldi. Namazını kılmayı unutma! 🤲`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });

    console.log(`${prayerName} bildirimi planlandı, ID:`, id);
    return id;
  } catch (error) {
    console.error(`${prayerName} bildirimi planlanamadı:`, error);
    throw error;
  }
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
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Planlanan bildirim sayısı:', notifications.length);
    notifications.forEach((notif, index) => {
      console.log(`Bildirim ${index + 1}:`, {
        id: notif.identifier,
        trigger: notif.trigger,
      });
    });
    return notifications;
  } catch (error) {
    console.error('Bildirimler getirilemedi:', error);
    return [];
  }
}
