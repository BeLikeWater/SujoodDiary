import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';

export default function NotificationSettingsScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [prayerReminders, setPrayerReminders] = useState(true);
  const [quranReminders, setQuranReminders] = useState(true);
  const [responsibilityReminders, setResponsibilityReminders] = useState(true);
  const [motivationalMessages, setMotivationalMessages] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const NotificationRow = ({ title, description, value, onValueChange, disabled = false }) => (
    <View style={[styles.notificationRow, disabled && styles.disabledRow]}>
      <View style={styles.notificationInfo}>
        <Text style={[styles.notificationTitle, disabled && styles.disabledText]}>{title}</Text>
        {description && (
          <Text style={[styles.notificationDescription, disabled && styles.disabledText]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#D1D5DB', true: '#10B981' }}
        thumbColor={value ? '#FFFFFF' : '#F3F4F6'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹ Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔔 Bildirimler</Text>
      </View>

      {/* Ana Bildirim Kontrolü */}
      <View style={styles.section}>
        <View style={styles.card}>
          <NotificationRow
            title="Bildirimleri Aç"
            description="Tüm bildirimleri aç/kapat"
            value={notificationsEnabled}
            onValueChange={(value) => {
              setNotificationsEnabled(value);
              if (!value) {
                Alert.alert(
                  'Bildirimler Kapatıldı',
                  'Tüm bildirimler devre dışı bırakıldı. İstediğin zaman tekrar açabilirsin.'
                );
              }
            }}
          />
        </View>
      </View>

      {/* Bildirim Türleri */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📬 Bildirim Türleri</Text>
        <View style={styles.card}>
          <NotificationRow
            title="🕌 Namaz Vakti Hatırlatıcıları"
            description="Her namaz vaktinde bildirim al"
            value={prayerReminders}
            onValueChange={setPrayerReminders}
            disabled={!notificationsEnabled}
          />
          <View style={styles.divider} />
          <NotificationRow
            title="📖 Kuran Okuma Hatırlatıcıları"
            description="Günlük Kuran okuma hedefin için hatırlatma"
            value={quranReminders}
            onValueChange={setQuranReminders}
            disabled={!notificationsEnabled}
          />
          <View style={styles.divider} />
          <NotificationRow
            title="✅ Sorumluluk Hatırlatıcıları"
            description="Günlük sorumluluklarını tamamla"
            value={responsibilityReminders}
            onValueChange={setResponsibilityReminders}
            disabled={!notificationsEnabled}
          />
          <View style={styles.divider} />
          <NotificationRow
            title="⭐ Motivasyon Mesajları"
            description="Günlük ilham verici mesajlar"
            value={motivationalMessages}
            onValueChange={setMotivationalMessages}
            disabled={!notificationsEnabled}
          />
        </View>
      </View>

      {/* Bildirim Ayarları */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Bildirim Davranışı</Text>
        <View style={styles.card}>
          <NotificationRow
            title="🔊 Bildirim Sesi"
            description="Bildirimler geldiğinde ses çal"
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            disabled={!notificationsEnabled}
          />
          <View style={styles.divider} />
          <NotificationRow
            title="📳 Titreşim"
            description="Bildirimler geldiğinde titreşim"
            value={vibrationEnabled}
            onValueChange={setVibrationEnabled}
            disabled={!notificationsEnabled}
          />
        </View>
      </View>

      {/* Namaz Vakti Detayları */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🕌 Namaz Vakti Ayarları</Text>
        <View style={styles.card}>
          <TouchableOpacity 
            style={[styles.settingRow, !notificationsEnabled && styles.disabledRow]}
            onPress={() => {
              if (notificationsEnabled) {
                Alert.alert('Yakında', 'Bu özellik yakında eklenecek');
              }
            }}
            disabled={!notificationsEnabled}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>⏰</Text>
              <Text style={[styles.settingTitle, !notificationsEnabled && styles.disabledText]}>
                Hatırlatma Zamanı
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, !notificationsEnabled && styles.disabledText]}>
                Vakit girmeden 5 dk önce
              </Text>
              <Text style={styles.settingArrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Kuran Hatırlatıcı Detayları */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📖 Kuran Hatırlatıcı Ayarları</Text>
        <View style={styles.card}>
          <TouchableOpacity 
            style={[styles.settingRow, !notificationsEnabled && styles.disabledRow]}
            onPress={() => {
              if (notificationsEnabled) {
                Alert.alert('Yakında', 'Bu özellik yakında eklenecek');
              }
            }}
            disabled={!notificationsEnabled}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🕐</Text>
              <Text style={[styles.settingTitle, !notificationsEnabled && styles.disabledText]}>
                Günlük Hatırlatma Saati
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, !notificationsEnabled && styles.disabledText]}>
                20:00
              </Text>
              <Text style={styles.settingArrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bilgi Kutusu */}
      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Bildirimlerin düzgün çalışması için telefonunun ayarlarından SujoodDiary için bildirimlere izin vermelisin.
        </Text>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#10B981',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
    marginLeft: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  disabledRow: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#9CA3AF',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  settingArrow: {
    fontSize: 20,
    color: '#D1D5DB',
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  footer: {
    height: 30,
  },
});
