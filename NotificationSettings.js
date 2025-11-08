import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotificationsAsync,
  schedulePrayerNotification,
  cancelAllNotifications,
  getScheduledNotifications,
} from './notificationService';

const PRAYER_TIMES_DEFAULT = [
  { name: 'Sabah', hour: 6, minute: 0 },
  { name: 'Öğle', hour: 12, minute: 30 },
  { name: 'İkindi', hour: 15, minute: 30 },
  { name: 'Akşam', hour: 18, minute: 30 },
  { name: 'Yatsı', hour: 20, minute: 0 },
];

const STORAGE_KEY = '@prayer_times';
const NOTIFICATIONS_KEY = '@notifications_enabled';

export default function NotificationSettings() {
  const [prayerTimes, setPrayerTimes] = useState(PRAYER_TIMES_DEFAULT);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // İzin iste ve bildirim sistemi hazırla
    registerForPushNotificationsAsync();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTimes = await AsyncStorage.getItem(STORAGE_KEY);
      const savedEnabled = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      
      if (savedTimes) {
        setPrayerTimes(JSON.parse(savedTimes));
      }
      if (savedEnabled) {
        setNotificationsEnabled(JSON.parse(savedEnabled));
      }
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error);
    }
  };

  const saveSettings = async (times, enabled) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(times));
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(enabled));
    } catch (error) {
      console.error('Ayarlar kaydedilemedi:', error);
    }
  };

  const handleTimeChange = (index, field, value) => {
    const newTimes = [...prayerTimes];
    newTimes[index][field] = parseInt(value) || 0;
    setPrayerTimes(newTimes);
  };

  const saveNotifications = async () => {
    try {
      // Önce tüm bildirimleri iptal et
      await cancelAllNotifications();

      // Her namaz için bildirim planla
      for (const prayer of prayerTimes) {
        await schedulePrayerNotification(prayer.name, prayer.hour, prayer.minute);
      }

      setNotificationsEnabled(true);
      await saveSettings(prayerTimes, true);
      
      Alert.alert(
        'Başarılı!', 
        'Namaz vakti bildirimleri ayarlandı.'
      );
      
      // Planlanan bildirimleri kontrol et
      const scheduled = await getScheduledNotifications();
      console.log('Planlanan bildirimler:', scheduled);
    } catch (error) {
      console.error('Bildirim ayarlama hatası:', error);
      Alert.alert('Hata', 'Bildirimler ayarlanamadı!');
    }
  };

  const disableNotifications = async () => {
    try {
      await cancelAllNotifications();
      setNotificationsEnabled(false);
      await saveSettings(prayerTimes, false);
      Alert.alert('Başarılı!', 'Bildirim ayarları kapatıldı.');
    } catch (error) {
      console.error('Bildirim kapatma hatası:', error);
    }
  };

  const testNotification = async () => {
    try {
      const now = new Date();
      const testTime = new Date(now.getTime() + 10 * 1000); // 10 saniye sonra
      
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Bildirimi 🔔',
          body: 'Bu bir test bildirimidir. Bildirimler çalışıyor!',
          sound: true,
        },
        trigger: {
          type: 'timeInterval',
          seconds: 10,
          repeats: false,
        },
      });
      
      Alert.alert(
        'Test Başarılı!',
        '10 saniye içinde bir test bildirimi alacaksınız.'
      );
      console.log('Test bildirimi planlandı:', id);
    } catch (error) {
      console.error('Test bildirimi hatası:', error);
      Alert.alert('Hata', 'Test bildirimi gönderilemedi!');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bildirim Ayarları</Text>
        <Text style={styles.subtitle}>Namaz vakti bildirimlerini ayarlayın</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {prayerTimes.map((prayer, index) => (
          <View key={index} style={styles.prayerTimeCard}>
            <Text style={styles.prayerName}>{prayer.name}</Text>
            <View style={styles.timeInputs}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeLabel}>Saat</Text>
                <TextInput
                  style={styles.timeInput}
                  value={prayer.hour}
                  onChangeText={(text) => handleTimeChange(index, 'hour', text)}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeLabel}>Dakika</Text>
                <TextInput
                  style={styles.timeInput}
                  value={prayer.minute}
                  onChangeText={(text) => handleTimeChange(index, 'minute', text)}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="00"
                />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={saveNotifications}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {notificationsEnabled ? '✓ Bildirimleri Güncelle' : 'Bildirimleri Ayarla'}
          </Text>
        </TouchableOpacity>

        {notificationsEnabled && (
          <TouchableOpacity
            style={[styles.button, styles.disableButton]}
            onPress={disableNotifications}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Bildirimleri Kapat</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={testNotification}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>🔔 Test Bildirimi Gönder (10sn)</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ Nasıl Çalışır?</Text>
          <Text style={styles.infoText}>
            • Bildirimler her gün belirlediğiniz saatlerde gelir{'\n'}
            • Namaz vakti geldiğinde hatırlatma alırsınız{'\n'}
            • İstediğiniz zaman saatleri değiştirebilirsiniz{'\n'}
            • Development build gerektirir (Expo Go'da çalışmaz)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#6B46C1',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#E9D5FF',
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  prayerTimeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeInputGroup: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 5,
  },
  timeInput: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderRadius: 10,
    padding: 10,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    width: 70,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginHorizontal: 10,
    marginTop: 15,
  },
  button: {
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  disableButton: {
    backgroundColor: '#EF4444',
  },
  testButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});
