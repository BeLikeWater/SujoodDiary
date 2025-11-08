import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';

const PRAYER_TIMES = [
  { name: 'Sabah', icon: '🌅' },
  { name: 'Öğle', icon: '☀️' },
  { name: 'İkindi', icon: '🌤️' },
  { name: 'Akşam', icon: '🌆' },
  { name: 'Yatsı', icon: '🌙' }
];

const DAYS_OF_WEEK = [
  { short: 'Pzt', full: 'Pazartesi', emoji: '🌟' },
  { short: 'Sal', full: 'Salı', emoji: '⭐' },
  { short: 'Çar', full: 'Çarşamba', emoji: '✨' },
  { short: 'Per', full: 'Perşembe', emoji: '💫' },
  { short: 'Cum', full: 'Cuma', emoji: '🌙' },
  { short: 'Cmt', full: 'Cumartesi', emoji: '🎨' },
  { short: 'Paz', full: 'Pazar', emoji: '🖼️' }
];

const PRAYER_STATUS = {
  EMPTY: 'empty',
  PRAYED: 'prayed',
  MISSED: 'missed',
  CONGREGATION: 'congregation',
};

export default function PrayerTracker() {
  const [selectedCell, setSelectedCell] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [prayerData, setPrayerData] = useState({});
  const [weekOffset, setWeekOffset] = useState(0);

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
    setSelectedCell({ dayIndex, prayerIndex });
    setModalVisible(true);
  };

  const handleStatusSelect = (status) => {
    if (selectedCell) {
      const key = `${selectedCell.dayIndex}-${selectedCell.prayerIndex}`;
      setPrayerData({
        ...prayerData,
        [key]: status,
      });
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
        {/* Info Butonu - Sağ Üst */}
        {/* <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => setHelpModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.infoButtonText}>ℹ️</Text>
        </TouchableOpacity> */}

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

        <Text style={styles.headerEmoji}>🕌</Text>
        <Text style={styles.title}>Secde Günlüğüm</Text>
        <Text style={styles.weekRange}>{getWeekRange()}</Text>
        
        {/* Bugün Butonu - Sadece farklı haftadaysa göster */}
        {weekOffset !== 0 && (
          <TouchableOpacity 
            style={styles.todayButton} 
            onPress={goToCurrentWeek}
            activeOpacity={0.7}
          >
            <Text style={styles.todayButtonText}>🏠 Bugün</Text>
          </TouchableOpacity>
        )}
      </View>

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
            <Text style={styles.modalTitle}>🕌 Namaz Durumu</Text>
            <Text style={styles.modalSubtitle}>Nasıl kıldın?</Text>

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
                <Text style={styles.modalOptionTitle}>Namaz Kıldım</Text>
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
                <Text style={styles.modalOptionTitle}>Cemaatle Kıldım</Text>
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
                <Text style={styles.modalOptionTitle}>Kılamadım</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>❌ İptal</Text>
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
    backgroundColor: '#F59E0B',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 15,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  todayButtonText: {
    color: '#FFFFFF',
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
});
