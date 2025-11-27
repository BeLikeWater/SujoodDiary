import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';

const translations = {
  tr: {
    title: '🕌 Namaz Takip',
    subtitle: 'Her namaz bir nurdur! ⭐',
    week: 'Hafta',
    thisWeek: 'Bu Hafta',
    previousWeek: 'Önceki Hafta',
    nextWeek: 'Sonraki Hafta',
    help: 'Nasıl Kullanılır?',
    selectAction: 'Bir işlem seçin',
    prayed: 'Kıldım',
    missed: 'Kaza',
    congregation: 'Cemaatle',
    clear: 'Temizle',
    cancel: 'İptal',
    helpTitle: 'Nasıl Kullanılır?',
    helpInstruction1: 'Namaz hücresine dokun',
    helpInstruction2: 'Durumu seç:',
    helpGreen: 'Yeşil = Kıldım',
    helpOrange: 'Turuncu = Kaza',
    helpPurple: 'Mor = Cemaatle',
    helpClear: 'Temizle = Boş yap',
    close: 'Kapat',
    days: {
      monday: 'Pazartesi',
      tuesday: 'Salı',
      wednesday: 'Çarşamba',
      thursday: 'Perşembe',
      friday: 'Cuma',
      saturday: 'Cumartesi',
      sunday: 'Pazar',
    },
    daysShort: {
      monday: 'Pzt',
      tuesday: 'Sal',
      wednesday: 'Çar',
      thursday: 'Per',
      friday: 'Cum',
      saturday: 'Cmt',
      sunday: 'Paz',
    },
    prayers: {
      fajr: 'Sabah',
      dhuhr: 'Öğle',
      asr: 'İkindi',
      maghrib: 'Akşam',
      isha: 'Yatsı',
    },
  },
  ar: {
    title: '🕌 متابعة الصلاة',
    subtitle: 'كل صلاة نور! ⭐',
    week: 'الأسبوع',
    thisWeek: 'هذا الأسبوع',
    previousWeek: 'الأسبوع السابق',
    nextWeek: 'الأسبوع القادم',
    help: 'كيفية الاستخدام؟',
    selectAction: 'اختر إجراء',
    prayed: 'صليت',
    missed: 'قضاء',
    congregation: 'جماعة',
    clear: 'مسح',
    cancel: 'إلغاء',
    helpTitle: 'كيفية الاستخدام؟',
    helpInstruction1: 'اضغط على خلية الصلاة',
    helpInstruction2: 'اختر الحالة:',
    helpGreen: 'أخضر = صليت',
    helpOrange: 'برتقالي = قضاء',
    helpPurple: 'بنفسجي = جماعة',
    helpClear: 'مسح = فراغ',
    close: 'إغلاق',
    days: {
      monday: 'الاثنين',
      tuesday: 'الثلاثاء',
      wednesday: 'الأربعاء',
      thursday: 'الخميس',
      friday: 'الجمعة',
      saturday: 'السبت',
      sunday: 'الأحد',
    },
    daysShort: {
      monday: 'إثن',
      tuesday: 'ثلث',
      wednesday: 'أرب',
      thursday: 'خمس',
      friday: 'جمع',
      saturday: 'سبت',
      sunday: 'أحد',
    },
    prayers: {
      fajr: 'الفجر',
      dhuhr: 'الظهر',
      asr: 'العصر',
      maghrib: 'المغرب',
      isha: 'العشاء',
    },
  },
};


const PRAYER_STATUS = {
  EMPTY: 'empty',
  PRAYED: 'prayed',
  MISSED: 'missed',
  CONGREGATION: 'congregation',
};

// Namaz ID'lerini kısa karakterlere dönüştür
const PRAYER_SHORT_CODES = {
  'fajr': 's',     // Sabah
  'dhuhr': 'ö',    // Öğle
  'asr': 'i',      // İkindi
  'maghrib': 'a',  // Akşam
  'isha': 'y'      // Yatsı
};

// Status'u sayıya dönüştür
const STATUS_TO_NUMBER = {
  'empty': 0,
  'prayed': 1,
  'congregation': 2,
  'missed': 0  // Kaza da 0 olarak kaydedilecek (kılmadı anlamında)
};

export default function PrayerTracker() {
  const [selectedCell, setSelectedCell] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [prayerData, setPrayerData] = useState({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [language, setLanguage] = useState('tr'); // Default Türkçe
  const [pointsModalVisible, setPointsModalVisible] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(null);
  const [pointsInfoModalVisible, setPointsInfoModalVisible] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadLanguage();
    loadPrayersFromFirebase();
  }, []);

  // Hafta değiştiğinde verileri yeniden yükle
  useEffect(() => {
    loadPrayersFromFirebase();
  }, [weekOffset]);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Dil yükleme hatası:', error);
    }
  };

  // Firestore'a namaz verisini kaydet
  const savePrayerToFirebase = async (date, prayerId, status) => {
    if (!auth.currentUser) {
      console.log('Kullanıcı giriş yapmamış');
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD formatı
      const prayerCode = PRAYER_SHORT_CODES[prayerId];
      const statusNumber = STATUS_TO_NUMBER[status];

      // Document ID: userId_tarih_vakit (örn: abc123_2025-11-22_s)
      const docId = `${userId}_${dateStr}_${prayerCode}`;
      const prayerDocRef = doc(db, 'prayers', docId);

      await setDoc(prayerDocRef, {
        userId: userId,
        date: dateStr,
        prayer: prayerCode,
        'operation-time': Date.now(),
        status: statusNumber
      });

      console.log(`Namaz kaydedildi: ${dateStr} - ${prayerCode} - ${statusNumber}`);

      // Haftalık puanı güncelle
      await updateWeeklyPoints();
    } catch (error) {
      console.error('Firestore kaydetme hatası:', error);
    }
  };

  // Haftalık puanları hesapla ve güncelle
  const updateWeeklyPoints = async () => {
    if (!auth.currentUser) return;

    try {
      const userId = auth.currentUser.uid;

      // Bu haftanın başlangıç ve bitiş tarihlerini bul
      const today = new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const mondayStr = monday.toISOString().split('T')[0];
      const sundayStr = sunday.toISOString().split('T')[0];

      console.log(`Hafta aralığı: ${mondayStr} - ${sundayStr}`);

      // Bu haftanın namazlarını çek
      const prayersRef = collection(db, 'prayers');
      const q = query(
        prayersRef,
        where('userId', '==', userId),
        where('date', '>=', mondayStr),
        where('date', '<=', sundayStr)
      );

      const querySnapshot = await getDocs(q);
      let weeklyPoints = 0;

      console.log(`Bulunan namaz sayısı: ${querySnapshot.size}`);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 1 || data.status === 2) {
          let points = data.prayer === 's' ? 15 : 10;
          if (data.status === 2) {
            points += 5;
          }
          weeklyPoints += points;
          console.log(`Namaz: ${data.prayer}, Status: ${data.status}, Puan: ${points}, Toplam: ${weeklyPoints}`);
        }
      });

      // Kullanıcı belgesini güncelle
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const currentTotal = userDoc.data().sevapPoints || 0;
        await setDoc(userDocRef, {
          weeklyPoints: weeklyPoints,
          sevapPoints: currentTotal,
        }, { merge: true });
        console.log(`✅ Haftalık puan güncellendi: ${weeklyPoints} (Firestore'a yazıldı)`);
      } else {
        console.log('❌ Kullanıcı belgesi bulunamadı!');
      }
    } catch (error) {
      console.error('Haftalık puan güncelleme hatası:', error);
    }
  };

  // Firestore'dan tüm namaz verilerini yükle
  const loadPrayersFromFirebase = async () => {
    if (!auth.currentUser) {
      console.log('Kullanıcı giriş yapmamış');
      return;
    }

    try {
      const userId = auth.currentUser.uid;

      // Bu haftanın tarih aralığını hesapla
      const weekDatesForQuery = getWeekDates(weekOffset);
      const startDate = weekDatesForQuery[0].toISOString().split('T')[0];
      const endDate = weekDatesForQuery[6].toISOString().split('T')[0];

      // Firestore query: kullanıcının bu haftaki namazları
      const prayersQuery = query(
        collection(db, 'prayers'),
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );

      const querySnapshot = await getDocs(prayersQuery);
      const loadedPrayerData = {};

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const date = new Date(data.date);
        const prayerCode = data.prayer;

        // Kısa kodu ID'ye dönüştür
        const prayerId = Object.keys(PRAYER_SHORT_CODES).find(
          key => PRAYER_SHORT_CODES[key] === prayerCode
        );

        if (prayerId) {
          const prayerIndex = PRAYER_TIMES.findIndex(p => p.id === prayerId);
          const dayIndex = getDayIndexFromDate(date);

          if (prayerIndex !== -1 && dayIndex !== -1) {
            const key = `${dayIndex}-${prayerIndex}`;

            // Sayıyı status'e dönüştür
            if (data.status === 1) {
              loadedPrayerData[key] = PRAYER_STATUS.PRAYED;
            } else if (data.status === 2) {
              loadedPrayerData[key] = PRAYER_STATUS.CONGREGATION;
            }
          }
        }
      });

      setPrayerData(loadedPrayerData);
      console.log(`Firestore'dan ${querySnapshot.size} namaz verisi yüklendi`);
    } catch (error) {
      console.error('Firestore yükleme hatası:', error);
    }
  };

  const t = translations[language];

  const PRAYER_TIMES = [
    { id: 'fajr', name: t.prayers.fajr, icon: '🌅' },
    { id: 'dhuhr', name: t.prayers.dhuhr, icon: '☀️' },
    { id: 'asr', name: t.prayers.asr, icon: '🌤️' },
    { id: 'maghrib', name: t.prayers.maghrib, icon: '🌆' },
    { id: 'isha', name: t.prayers.isha, icon: '🌙' }
  ];

  const DAYS_OF_WEEK = [
    { short: t.daysShort.monday, full: t.days.monday, emoji: '🌟' },
    { short: t.daysShort.tuesday, full: t.days.tuesday, emoji: '⭐' },
    { short: t.daysShort.wednesday, full: t.days.wednesday, emoji: '✨' },
    { short: t.daysShort.thursday, full: t.days.thursday, emoji: '💫' },
    { short: t.daysShort.friday, full: t.days.friday, emoji: '🌙' },
    { short: t.daysShort.saturday, full: t.days.saturday, emoji: '🎨' },
    { short: t.daysShort.sunday, full: t.days.sunday, emoji: '🖼️' }
  ];

  // Bugünün tarihini kontrol et
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const getWeekDates = (offset) => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    monday.setDate(today.getDate() + diff + (offset * 7));

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(weekOffset);

  // Tarihten günün haftadaki indeksini bul
  const getDayIndexFromDate = (date) => {
    return weekDates.findIndex(d =>
      d.getDate() === date.getDate() &&
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear()
    );
  };

  const goToPreviousWeek = () => {
    setWeekOffset(weekOffset - 1);
  };

  const goToNextWeek = () => {
    setWeekOffset(weekOffset + 1);
  };

  const goToCurrentWeek = () => {
    setWeekOffset(0);
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
  };

  const getWeekRange = () => {
    const firstDate = weekDates[0];
    const lastDate = weekDates[6];
    const year = firstDate.getFullYear();
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${firstDate.getDate()} - ${lastDate.getDate()} ${months[firstDate.getMonth()]} ${year}`;
  };

  // Haftalık istatistikler
  const getWeeklyStats = () => {
    let total = 0;
    let completed = 0;
    
    weekDates.forEach((_, dayIndex) => {
      PRAYER_TIMES.forEach((_, prayerIndex) => {
        const key = `${dayIndex}-${prayerIndex}`;
        const status = prayerData[key];
        total++;
        if (status === PRAYER_STATUS.PRAYED || status === PRAYER_STATUS.CONGREGATION) {
          completed++;
        }
      });
    });
    
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const stats = getWeeklyStats();

  const handleStarPress = (dayIndex, prayerIndex) => {
    setSelectedCell({
      dayIndex,
      prayerIndex,
      prayer: PRAYER_TIMES[prayerIndex]
    });
    setModalVisible(true);
  };

  // Puan hesaplama fonksiyonu
  const calculatePoints = (prayerId, status, dayIndex) => {
    if (status === PRAYER_STATUS.EMPTY || status === PRAYER_STATUS.MISSED) {
      return null; // Puan yok
    }

    let basePoints = 0;
    let bonusPoints = 0;
    let details = [];

    // Sabah namazı 15 puan, diğerleri 10 puan
    if (prayerId === 'fajr') {
      basePoints = 15;
      details.push({ text: 'Sabah Namazı', icon: '🕊️', points: 15 });
    } else {
      basePoints = 10;
      const prayerName = PRAYER_TIMES.find(p => p.id === prayerId)?.name || 'Namaz';
      details.push({ text: prayerName, icon: '🌙', points: 10 });
    }

    // Cemaatle bonus
    if (status === PRAYER_STATUS.CONGREGATION) {
      bonusPoints += 5;
      details.push({ text: 'Cemaatle Bonus', icon: '🤝', points: 5 });
    }

    // 5 vakit tam kontrol (bugün için)
    const updatedPrayerData = {
      ...prayerData,
      [`${dayIndex}-${selectedCell.prayerIndex}`]: status
    };

    let dayPrayerCount = 0;
    for (let i = 0; i < 5; i++) {
      const key = `${dayIndex}-${i}`;
      const prayerStatus = updatedPrayerData[key];
      if (prayerStatus === PRAYER_STATUS.PRAYED || prayerStatus === PRAYER_STATUS.CONGREGATION) {
        dayPrayerCount++;
      }
    }

    let fullDayBonus = 0;
    if (dayPrayerCount === 5) {
      fullDayBonus = 20;
      details.push({ text: '5 Vakit Tam Bonus', icon: '🏆', points: 20 });
    }

    return {
      total: basePoints + bonusPoints + fullDayBonus,
      details: details
    };
  };

  const showPointsAnimation = (points) => {
    setEarnedPoints(points);
    setPointsModalVisible(true);

    // Animasyonları sıfırla
    scaleAnim.setValue(0);
    fadeAnim.setValue(0);

    // Animasyonları başlat
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // 3 saniye sonra otomatik kapat
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setPointsModalVisible(false);
        setEarnedPoints(null);
      });
    }, 3000);
  };

  const handleStatusSelect = async (status) => {
    if (selectedCell) {
      const key = `${selectedCell.dayIndex}-${selectedCell.prayerIndex}`;

      // Local state'i güncelle
      setPrayerData({
        ...prayerData,
        [key]: status,
      });

      // Firebase'e kaydet
      const date = weekDates[selectedCell.dayIndex];
      const prayer = PRAYER_TIMES[selectedCell.prayerIndex];
      await savePrayerToFirebase(date, prayer.id, status);

      // Puan hesapla ve göster
      const points = calculatePoints(prayer.id, status, selectedCell.dayIndex);
      if (points) {
        showPointsAnimation(points);
      }
    }
    setModalVisible(false);
    setSelectedCell(null);
  };

  const getStarColor = (dayIndex, prayerIndex) => {
    const key = `${dayIndex}-${prayerIndex}`;
    const status = prayerData[key];

    switch (status) {
      case PRAYER_STATUS.PRAYED:
        return '#EF4444'; // Kırmızı
      case PRAYER_STATUS.MISSED:
        return '#1F2937'; // Siyah
      case PRAYER_STATUS.CONGREGATION:
        return '#10B981'; // Yeşil
      default:
        return '#D1D5DB'; // Boş (açık gri)
    }
  };

  const renderStar = (dayIndex, prayerIndex, isTodayRow) => {
    const color = getStarColor(dayIndex, prayerIndex);
    const key = `${dayIndex}-${prayerIndex}`;
    const status = prayerData[key];
    const isFilled = status !== PRAYER_STATUS.EMPTY && status !== undefined;
    
    return (
      <TouchableOpacity
        style={[
          styles.starButton,
          isTodayRow && styles.starButtonToday,
        ]}
        onPress={() => handleStarPress(dayIndex, prayerIndex)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.star, 
          { 
            color: isFilled ? color : '#D1D5DB',
            textShadowColor: isFilled ? color : '#D1D5DB',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 1
          }
        ]}>
          {isFilled ? '★' : '☆'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Önceki Hafta Butonu - Sol */}
        <TouchableOpacity
          style={styles.navArrowButton}
          onPress={goToPreviousWeek}
          activeOpacity={0.7}
        >
          <Text style={styles.navArrowText}>←</Text>
        </TouchableOpacity>

        {/* Sonraki Hafta Butonu - Sağ */}
        <TouchableOpacity
          style={[styles.navArrowButton, styles.navArrowButtonRight]}
          onPress={goToNextWeek}
          activeOpacity={0.7}
        >
          <Text style={styles.navArrowText}>→</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.weekRange}>{getWeekRange()}</Text>

        {/* Bugün Butonu - Sadece farklı haftadaysa göster */}
        {weekOffset !== 0 && (
          <TouchableOpacity
            style={styles.todayButton}
            onPress={goToCurrentWeek}
            activeOpacity={0.7}
          >
            <Text style={styles.todayButtonText}>🏠 {t.thisWeek}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Puan Bilgi Butonu - Sağ Alt Köşe (Floating) */}
      <TouchableOpacity
        style={styles.pointsInfoButton}
        onPress={() => setPointsInfoModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.pointsInfoButtonText}>⭐</Text>
      </TouchableOpacity>

      {/* Tablo */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Namaz İkonları Header */}
        <View style={styles.prayerIconsRow}>
          <View style={styles.emptyCorner} />
          {PRAYER_TIMES.map((prayer, index) => (
            <View key={index} style={styles.prayerIconCell}>
              <Text style={styles.prayerIcon}>{prayer.icon}</Text>
              <Text style={styles.prayerNameSmall}>{prayer.name}</Text>
            </View>
          ))}
        </View>

        {/* Günler */}
        {weekDates.map((date, dayIndex) => {
          const isTodayRow = isToday(date);
          return (
            <View 
              key={dayIndex} 
              style={[
                styles.dayRow,
                isTodayRow && styles.todayRow,
              ]}
            >
              <View style={[
                styles.dayCell,
                isTodayRow && styles.todayDayCell,
              ]}>
                <Text style={styles.dayEmoji}>{DAYS_OF_WEEK[dayIndex].emoji}</Text>
                <Text style={[
                  styles.dayName,
                  isTodayRow && styles.todayText,
                ]}>
                  {DAYS_OF_WEEK[dayIndex].full}
                </Text>
                <Text style={[
                  styles.dateText,
                  isTodayRow && styles.todayDateText,
                ]}>
                  {formatDate(date)}
                </Text>
                {isTodayRow && (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayBadgeText}>BUGÜN</Text>
                  </View>
                )}
              </View>
              {PRAYER_TIMES.map((_, prayerIndex) => (
                <View 
                  key={prayerIndex} 
                  style={[
                    styles.prayerCell,
                    isTodayRow && styles.todayPrayerCell,
                  ]}
                >
                  {renderStar(dayIndex, prayerIndex, isTodayRow)}
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>

      {/* Puan Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={pointsModalVisible}
        onRequestClose={() => setPointsModalVisible(false)}
      >
        <View style={styles.pointsModalOverlay}>
          <Animated.View
            style={[
              styles.pointsModalContent,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              }
            ]}
          >
            <View style={styles.pointsModalHeader}>
              <Text style={styles.pointsModalTitle}>🎉 Sevap Kazandın!</Text>
            </View>

            {earnedPoints && (
              <>
                {/* Detaylar */}
                <View style={styles.pointsDetailsList}>
                  {earnedPoints.details.map((detail, index) => (
                    <View key={index} style={styles.pointsDetailItem}>
                      <Text style={styles.pointsDetailIcon}>{detail.icon}</Text>
                      <Text style={styles.pointsDetailText}>{detail.text}</Text>
                      <Text style={styles.pointsDetailPoints}>+{detail.points}</Text>
                    </View>
                  ))}
                </View>

                {/* Toplam */}
                <View style={styles.pointsTotalContainer}>
                  <Text style={styles.pointsTotalLabel}>Toplam Puan</Text>
                  <Text style={styles.pointsTotalValue}>⭐ {earnedPoints.total}</Text>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Puan Bilgi Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={pointsInfoModalVisible}
        onRequestClose={() => setPointsInfoModalVisible(false)}
      >
        <View style={styles.infoModalOverlay}>
          <View style={styles.infoModalContent}>
            <View style={styles.infoModalHeader}>
              <Text style={styles.infoModalTitle}>⭐ Sevap Puanları</Text>
              <TouchableOpacity
                style={styles.infoModalCloseButton}
                onPress={() => setPointsInfoModalVisible(false)}
              >
                <Text style={styles.infoModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.infoModalDescription}>
                Her namaz kıldığında sevap puanı kazanırsın! 🎉
              </Text>

              {/* Puan Tablosu */}
              <View style={styles.pointsInfoTable}>
                <View style={styles.pointsInfoRow}>
                  <View style={styles.pointsInfoCell}>
                    <Text style={styles.pointsInfoIcon}>🕊️</Text>
                    <Text style={styles.pointsInfoLabel}>Sabah Namazı</Text>
                  </View>
                  <Text style={styles.pointsInfoValue}>15 puan</Text>
                </View>

                <View style={styles.pointsInfoDivider} />

                <View style={styles.pointsInfoRow}>
                  <View style={styles.pointsInfoCell}>
                    <Text style={styles.pointsInfoIcon}>🌙</Text>
                    <Text style={styles.pointsInfoLabel}>Diğer Vakitler</Text>
                  </View>
                  <Text style={styles.pointsInfoValue}>10 puan</Text>
                </View>

                <View style={styles.pointsInfoSubtext}>
                  <Text style={styles.pointsInfoSubtextText}>
                    (Öğle, İkindi, Akşam, Yatsı)
                  </Text>
                </View>

                <View style={styles.pointsInfoDivider} />

                <View style={styles.pointsInfoRow}>
                  <View style={styles.pointsInfoCell}>
                    <Text style={styles.pointsInfoIcon}>🤝</Text>
                    <Text style={styles.pointsInfoLabel}>Cemaatle Bonus</Text>
                  </View>
                  <Text style={styles.pointsInfoValueBonus}>+5 puan</Text>
                </View>

                <View style={styles.pointsInfoDivider} />

                <View style={styles.pointsInfoRow}>
                  <View style={styles.pointsInfoCell}>
                    <Text style={styles.pointsInfoIcon}>🏆</Text>
                    <Text style={styles.pointsInfoLabel}>5 Vakit Tam Bonus</Text>
                  </View>
                  <Text style={styles.pointsInfoValueBonus}>+20 puan</Text>
                </View>
              </View>

              {/* Örnek Hesaplama */}
              <View style={styles.exampleBox}>
                <Text style={styles.exampleTitle}>💡 Örnek Hesaplama</Text>
                <View style={styles.exampleItem}>
                  <Text style={styles.exampleText}>
                    Sabah namazını cemaatle kılarsam:
                  </Text>
                  <Text style={styles.exampleCalc}>15 + 5 = <Text style={styles.exampleResult}>20 puan ⭐</Text></Text>
                </View>
                <View style={styles.exampleDivider} />
                <View style={styles.exampleItem}>
                  <Text style={styles.exampleText}>
                    Günde 5 vakit namazı cemaatle kılarsam:
                  </Text>
                  <Text style={styles.exampleCalc}>(15+5) + (10+5)×4 + 20 = <Text style={styles.exampleResult}>100 puan ⭐</Text></Text>
                </View>
              </View>

              <View style={styles.infoModalFooter}>
                <Text style={styles.infoModalFooterText}>
                  Her namaz bir nurdur, her sevap bir kazançtır! 🌟
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Namaz Durumu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🕌 {t.selectAction}</Text>
            <Text style={styles.modalSubtitle}>{selectedCell?.prayer?.name || ''}</Text>

            <TouchableOpacity
              style={[styles.modalOption, styles.modalOptionRed]}
              onPress={() => handleStatusSelect(PRAYER_STATUS.PRAYED)}
              activeOpacity={0.8}
            >
              <Text style={[styles.modalStar, { 
                color: '#EF4444',
                textShadowColor: '#EF4444',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 2
              }]}>★</Text>
              <View style={styles.modalOptionContent}>
                <Text style={styles.modalOptionTitle}>{t.prayed}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, styles.modalOptionGreen]}
              onPress={() => handleStatusSelect(PRAYER_STATUS.CONGREGATION)}
              activeOpacity={0.8}
            >
              <Text style={[styles.modalStar, { 
                color: '#10B981',
                textShadowColor: '#10B981',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 2
              }]}>★</Text>
              <View style={styles.modalOptionContent}>
                <Text style={styles.modalOptionTitle}>{t.congregation}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, styles.modalOptionBlack]}
              onPress={() => handleStatusSelect(PRAYER_STATUS.MISSED)}
              activeOpacity={0.8}
            >
              <Text style={[styles.modalStar, { 
                color: '#1F2937',
                textShadowColor: '#1F2937',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 2
              }]}>★</Text>
              <View style={styles.modalOptionContent}>
                <Text style={styles.modalOptionTitle}>{t.missed}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>❌ {t.cancel}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Yardım Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={helpModalVisible}
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.helpModalOverlay}
          activeOpacity={1}
          onPress={() => setHelpModalVisible(false)}
        >
          <View style={styles.helpModalContent}>
            <Text style={styles.helpModalTitle}>🌟 Nasıl Kullanılır?</Text>
            <Text style={styles.helpModalSubtitle}>Namaz takibi çok kolay!</Text>

            <View style={styles.helpModalItem}>
              <View style={styles.helpModalIconContainer}>
                <Text style={[styles.helpModalStar, { 
                  color: '#EF4444',
                  textShadowColor: '#EF4444',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 2
                }]}>★</Text>
              </View>
              <View style={styles.helpModalTextContainer}>
                <Text style={styles.helpModalItemTitle}>Kırmızı Yıldız</Text>
                <Text style={styles.helpModalItemText}>Namaz Kıldım</Text>
              </View>
            </View>

            <View style={styles.helpModalItem}>
              <View style={styles.helpModalIconContainer}>
                <Text style={[styles.helpModalStar, { 
                  color: '#10B981',
                  textShadowColor: '#10B981',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 2
                }]}>★</Text>
              </View>
              <View style={styles.helpModalTextContainer}>
                <Text style={styles.helpModalItemTitle}>Yeşil Yıldız</Text>
                <Text style={styles.helpModalItemText}>Cemaatle Kıldım</Text>
              </View>
            </View>

            <View style={styles.helpModalItem}>
              <View style={styles.helpModalIconContainer}>
                <Text style={[styles.helpModalStar, { 
                  color: '#1F2937',
                  textShadowColor: '#1F2937',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 2
                }]}>★</Text>
              </View>
              <View style={styles.helpModalTextContainer}>
                <Text style={styles.helpModalItemTitle}>Siyah Yıldız</Text>
                <Text style={styles.helpModalItemText}>Kılamadım</Text>
              </View>
            </View>

            <View style={styles.helpModalItem}>
              <View style={styles.helpModalIconContainer}>
                <Text style={[styles.helpModalStar, { 
                  color: '#D1D5DB',
                  textShadowColor: '#D1D5DB',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 1
                }]}>☆</Text>
              </View>
              <View style={styles.helpModalTextContainer}>
                <Text style={styles.helpModalItemTitle}>Boş Yıldız</Text>
                <Text style={styles.helpModalItemText}>Henüz işaretlenmedi</Text>
              </View>
            </View>

            <View style={styles.helpModalTip}>
              <Text style={styles.helpModalTipIcon}>💡</Text>
              <Text style={styles.helpModalTipText}>
                Yıldıza tıklayarak namaz durumunu seçebilirsin!
              </Text>
            </View>

            <TouchableOpacity
              style={styles.helpModalCloseButton}
              onPress={() => setHelpModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.helpModalCloseText}>✓ Anladım</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    backgroundColor: '#8B5CF6',
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  infoButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  infoButtonText: {
    fontSize: 18,
  },
  headerEmoji: {
    fontSize: 32,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  weekRange: {
    fontSize: 14,
    color: '#E9D5FF',
    marginBottom: 10,
    fontWeight: '600',
  },
  navArrowButton: {
    position: 'absolute',
    top: 85,
    left: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: 10,
  },
  navArrowButtonRight: {
    left: 'auto',
    right: 30,
  },
  navArrowText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  todayButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 15,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  todayButtonText: {
    color: '#8B5CF6',
    fontWeight: 'bold',
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  prayerIconsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  emptyCorner: {
    width: 80,
  },
  prayerIconCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  prayerIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  prayerNameSmall: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  dayRow: {
    flexDirection: 'row',
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  todayRow: {
    borderWidth: 3,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.3,
    elevation: 6,
  },
  dayCell: {
    width: 85,
    backgroundColor: '#8B5CF6',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  todayDayCell: {
    backgroundColor: '#F59E0B',
  },
  dayEmoji: {
    fontSize: 14,
    marginBottom: 2,
  },
  dayName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
    marginBottom: 2,
  },
  todayText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  dateText: {
    color: '#E9D5FF',
    fontSize: 9,
    fontWeight: '600',
  },
  todayDateText: {
    color: '#FEF3C7',
  },
  todayBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  todayBadgeText: {
    color: '#F59E0B',
    fontSize: 7,
    fontWeight: 'bold',
  },
  prayerCell: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  todayPrayerCell: {
    backgroundColor: '#FEF3C7',
  },
  starButton: {
    padding: 3,
  },
  starButtonToday: {
    transform: [{ scale: 1.05 }],
  },
  star: {
    fontSize: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#1F2937',
  },
  modalSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 25,
    color: '#6B7280',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modalOptionGreen: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  modalOptionRed: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  modalOptionBlack: {
    backgroundColor: '#F3F4F6',
    borderColor: '#1F2937',
  },
  modalStar: {
    fontSize: 36,
    marginRight: 15,
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  modalOptionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    padding: 18,
    borderRadius: 18,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  // Yardım Modal Stilleri
  helpModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  helpModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  helpModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#1F2937',
  },
  helpModalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
    color: '#6B7280',
  },
  helpModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 15,
  },
  helpModalIconContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpModalStar: {
    fontSize: 32,
  },
  helpModalTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  helpModalItemTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 3,
  },
  helpModalItemText: {
    fontSize: 13,
    color: '#6B7280',
  },
  helpModalTip: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  helpModalTipIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  helpModalTipText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
  },
  helpModalCloseButton: {
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: 15,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  helpModalCloseText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  // Puan Modal Stilleri
  pointsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 25,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  pointsModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    textAlign: 'center',
  },
  pointsDetailsList: {
    marginBottom: 20,
  },
  pointsDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  pointsDetailIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  pointsDetailText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  pointsDetailPoints: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  pointsTotalContainer: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  pointsTotalLabel: {
    fontSize: 14,
    color: '#E9D5FF',
    marginBottom: 8,
    fontWeight: '600',
  },
  pointsTotalValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Puan Bilgi Butonu Stilleri
  pointsInfoButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  pointsInfoButtonText: {
    fontSize: 24,
  },
  // Puan Bilgi Modal Stilleri
  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  infoModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '90%',
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#E9D5FF',
  },
  infoModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  infoModalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoModalCloseText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  infoModalDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  pointsInfoTable: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  pointsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  pointsInfoCell: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pointsInfoIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  pointsInfoLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  pointsInfoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  pointsInfoValueBonus: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  pointsInfoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  pointsInfoSubtext: {
    paddingLeft: 40,
    marginTop: -5,
    marginBottom: 5,
  },
  pointsInfoSubtextText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  exampleBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  exampleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 15,
  },
  exampleItem: {
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 14,
    color: '#78350F',
    marginBottom: 8,
    lineHeight: 20,
  },
  exampleCalc: {
    fontSize: 15,
    color: '#92400E',
    fontWeight: '600',
    paddingLeft: 10,
  },
  exampleResult: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  exampleDivider: {
    height: 1,
    backgroundColor: '#FDE68A',
    marginVertical: 12,
  },
  infoModalFooter: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  infoModalFooterText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
});
