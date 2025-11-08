import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, I18nManager } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const translations = {
  tr: {
    settings: '⚙️ Ayarlar',
    account: '👤 Hesap',
    application: '🎨 Uygulama',
    notifications: 'Bildirimler',
    sounds: 'Sesler',
    vibration: 'Titreşim',
    darkMode: 'Karanlık Mod',
    language: 'Dil',
    turkish: 'Türkçe',
    arabic: 'العربية (Arapça)',
    content: '📚 İçerik',
    prayerTimes: 'Namaz Vakitleri',
    quranSettings: 'Kuran Okuma Ayarları',
    goalSettings: 'Hedef Ayarları',
    about: 'ℹ️ Hakkında',
    appVersion: 'Uygulama Sürümü',
    contactUs: 'Bize Ulaşın',
    rateApp: 'Uygulamayı Değerlendir',
    privacyPolicy: 'Gizlilik Politikası',
    termsOfUse: 'Kullanım Şartları',
    logout: 'Çıkış Yap',
    logoutConfirm: 'Çıkış yapmak istediğine emin misin?',
    cancel: 'İptal',
    footer: 'Made with ❤️ for young Muslims',
    istanbul: 'İstanbul',
  },
  ar: {
    settings: '⚙️ الإعدادات',
    account: '👤 الحساب',
    application: '🎨 التطبيق',
    notifications: 'الإشعارات',
    sounds: 'الأصوات',
    vibration: 'الاهتزاز',
    darkMode: 'الوضع الداكن',
    language: 'اللغة',
    turkish: 'التركية',
    arabic: 'العربية',
    content: '📚 المحتوى',
    prayerTimes: 'أوقات الصلاة',
    quranSettings: 'إعدادات قراءة القرآن',
    goalSettings: 'إعدادات الأهداف',
    about: 'ℹ️ حول',
    appVersion: 'إصدار التطبيق',
    contactUs: 'اتصل بنا',
    rateApp: 'قيم التطبيق',
    privacyPolicy: 'سياسة الخصوصية',
    termsOfUse: 'شروط الاستخدام',
    logout: 'تسجيل الخروج',
    logoutConfirm: 'هل أنت متأكد من تسجيل الخروج؟',
    cancel: 'إلغاء',
    footer: 'صنع بـ ❤️ للمسلمين الصغار',
    istanbul: 'إسطنبول',
  },
};

export default function SettingsScreen({ navigation }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('ar'); // 'tr' veya 'ar'

  const handleLogout = async () => {
    Alert.alert(
      t.logout,
      t.logoutConfirm,
      [
        {
          text: t.cancel,
          style: 'cancel',
        },
        {
          text: t.logout,
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılamadı');
            }
          },
        },
      ]
    );
  };

  const handleLanguageChange = () => {
    Alert.alert(
      language === 'tr' ? 'Dil Seçin' : 'اختر اللغة',
      language === 'tr' ? 'Hangi dili kullanmak istersin?' : 'أي لغة تريد استخدامها؟',
      [
        {
          text: language === 'tr' ? 'Türkçe' : 'التركية',
          onPress: () => setLanguage('tr'),
        },
        {
          text: language === 'tr' ? 'العربية (Arapça)' : 'العربية',
          onPress: () => setLanguage('ar'),
        },
        {
          text: language === 'tr' ? 'İptal' : 'إلغاء',
          style: 'cancel',
        },
      ]
    );
  };

  const t = translations[language];

  const SettingRow = ({ icon, title, value, onPress, showArrow = true, showSwitch = false, switchValue, onSwitchChange }) => (
    <TouchableOpacity 
      style={styles.settingRow}
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#D1D5DB', true: '#10B981' }}
          thumbColor={switchValue ? '#FFFFFF' : '#F3F4F6'}
        />
      ) : (
        <View style={styles.settingRight}>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          {showArrow && <Text style={styles.settingArrow}>›</Text>}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.settings}</Text>
      </View>

      {/* Hesap Bilgileri */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.account}</Text>
        <View style={styles.card}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{auth.currentUser?.displayName || 'Küçük Mümin'}</Text>
            <Text style={styles.userEmail}>{auth.currentUser?.email}</Text>
          </View>
        </View>
      </View>

      {/* Uygulama Ayarları */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.application}</Text>
        <View style={styles.card}>
          <SettingRow
            icon="🌐"
            title={t.language}
            value={language === 'tr' ? t.turkish : t.arabic}
            onPress={handleLanguageChange}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="🔔"
            title={t.notifications}
            onPress={() => navigation.navigate('NotificationSettings')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="🔊"
            title={t.sounds}
            showSwitch={true}
            switchValue={soundEnabled}
            onSwitchChange={setSoundEnabled}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="📳"
            title={t.vibration}
            showSwitch={true}
            switchValue={vibrationEnabled}
            onSwitchChange={setVibrationEnabled}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="🌙"
            title={t.darkMode}
            showSwitch={true}
            switchValue={darkMode}
            onSwitchChange={setDarkMode}
          />
        </View>
      </View>

      {/* İçerik Ayarları */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.content}</Text>
        <View style={styles.card}>
          <SettingRow
            icon="🕌"
            title={t.prayerTimes}
            value={t.istanbul}
            onPress={() => Alert.alert('Yakında', 'Bu özellik yakında eklenecek')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="📖"
            title={t.quranSettings}
            onPress={() => Alert.alert('Yakında', 'Bu özellik yakında eklenecek')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="🎯"
            title={t.goalSettings}
            onPress={() => Alert.alert('Yakında', 'Bu özellik yakında eklenecek')}
          />
        </View>
      </View>

      {/* Hakkında */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.about}</Text>
        <View style={styles.card}>
          <SettingRow
            icon="📱"
            title={t.appVersion}
            value="1.1.0"
            showArrow={false}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="📧"
            title={t.contactUs}
            onPress={() => Alert.alert('İletişim', 'support@sujooddiary.com')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="⭐"
            title={t.rateApp}
            onPress={() => Alert.alert('Teşekkürler!', 'App Store\'a yönlendiriliyorsunuz...')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="📄"
            title={t.privacyPolicy}
            onPress={() => Alert.alert('Yakında', 'Bu özellik yakında eklenecek')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="📋"
            title={t.termsOfUse}
            onPress={() => Alert.alert('Yakında', 'Bu özellik yakında eklenecek')}
          />
        </View>
      </View>

      {/* Çıkış */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>{t.logout}</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t.footer}</Text>
      </View>
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
    backgroundColor: '#8B5CF6',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
  userInfo: {
    padding: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
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
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 52,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
    padding: 18,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
