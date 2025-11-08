# iOS Development Build Kurulum Rehberi

## 1. Xcode Kurulumu
```bash
# App Store'dan Xcode'u indirin ve yükleyin
# Ardından komut satırı araçlarını yükleyin:
sudo xcode-select --install
```

## 2. CocoaPods Kurulumu
```bash
sudo gem install cocoapods
```

## 3. Development Build Oluşturma

### İlk Build:
```bash
# Expo config dosyasını oluştur
npx expo prebuild --platform ios

# iOS native projesini build et ve çalıştır
npx expo run:ios
```

Bu komut:
- iOS native klasörünü oluşturur
- Bağımlılıkları yükler
- Xcode projesini açar
- Simülatörde veya bağlı cihazda uygulamayı çalıştırır

### Fiziksel Cihazda Çalıştırma:
```bash
# Bağlı cihazınızı görmek için:
xcrun xctrace list devices

# Belirli bir cihazda çalıştırmak için:
npx expo run:ios --device
```

## 4. Notification Özelliklerini Ekle

app.json'a geri ekleyin:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "ios": {
      "bundleIdentifier": "com.sujooddiary.app"
    }
  }
}
```

## 5. Kod Değişiklikleri

NotificationSettings.js ve PrayerTracker.js'deki yorum satırlarını kaldırın:
- Firebase import satırlarını aktifleştirin
- Notification servis çağrılarını aktifleştirin

## 6. Yeniden Build

Her native değişiklikten sonra:
```bash
# Önce temizle
rm -rf ios/

# Sonra yeniden build et
npx expo prebuild --platform ios --clean
npx expo run:ios
```

## Notlar:
- İlk build 10-20 dakika sürebilir
- Her kod değişikliğinde yeniden build gerekmez (Fast Refresh çalışır)
- Sadece native modül/plugin değişikliklerinde yeniden build gerekir
- Simülatör: Ücretsiz, hızlı test
- Fiziksel cihaz: Gerçek notification testi için gerekli
