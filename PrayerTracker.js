import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
// import { db } from './firebaseConfig'; // Firebase şimdilik devre dışı

const PRAYER_TIMES = ['Sabah', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'];

const DAYS_OF_WEEK = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const PRAYER_STATUS = {
  EMPTY: 'empty',
  PRAYED: 'prayed',
  MISSED: 'missed',
  CONGREGATION: 'congregation',
};

export default function PrayerTracker() {
  const [selectedCell, setSelectedCell] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [prayerData, setPrayerData] = useState({});
  const [weekOffset, setWeekOffset] = useState(0); // 0 = bu hafta, -1 = geçen hafta, 1 = gelecek hafta

  // Belirli bir haftanın tarihlerini al
  const getWeekDates = (offset) => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Pazar
    const monday = new Date(today);
    
    // Pazartesiye git
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
        return '#4CAF50'; // Yeşil
      case PRAYER_STATUS.MISSED:
        return '#424242'; // Siyah
      case PRAYER_STATUS.CONGREGATION:
        return '#2196F3'; // Mavi
      default:
        return '#E0E0E0'; // Boş (gri)
    }
  };

  const renderStar = (dayIndex, prayerIndex) => {
    const color = getStarColor(dayIndex, prayerIndex);
    return (
      <TouchableOpacity
        style={styles.starButton}
        onPress={() => handleStarPress(dayIndex, prayerIndex)}
        activeOpacity={0.7}
      >
        <Text style={[styles.star, { color }]}>★</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Namaz Takibi</Text>
        <Text style={styles.weekRange}>{getWeekRange()}</Text>
        
        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={goToPreviousWeek}
            activeOpacity={0.7}
          >
            <Text style={styles.navButtonText}>← Önceki</Text>
          </TouchableOpacity>
          
          {weekOffset !== 0 && (
            <TouchableOpacity 
              style={styles.todayButton} 
              onPress={goToCurrentWeek}
              activeOpacity={0.7}
            >
              <Text style={styles.todayButtonText}>Bugün</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={goToNextWeek}
            activeOpacity={0.7}
          >
            <Text style={styles.navButtonText}>Sonraki →</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.table}>
          {/* Header Row - Namaz Vakitleri */}
          <View style={styles.row}>
            <View style={styles.dateHeaderCell}>
              <Text style={styles.headerText}>Gün</Text>
            </View>
            {PRAYER_TIMES.map((prayer, index) => (
              <View key={index} style={styles.prayerHeaderCell}>
                <Text style={styles.headerText}>{prayer}</Text>
              </View>
            ))}
          </View>

          {/* Data Rows - Her gün için */}
          {weekDates.map((date, dayIndex) => (
            <View key={dayIndex} style={styles.row}>
              <View style={styles.dateCell}>
                <Text style={styles.dayName}>{DAYS_OF_WEEK[dayIndex]}</Text>
                <Text style={styles.dateText}>{formatDate(date)}</Text>
              </View>
              {PRAYER_TIMES.map((_, prayerIndex) => (
                <View key={prayerIndex} style={styles.dataCell}>
                  {renderStar(dayIndex, prayerIndex)}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal */}
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
            <Text style={styles.modalTitle}>Namaz Durumu</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleStatusSelect(PRAYER_STATUS.PRAYED)}
              activeOpacity={0.8}
            >
              <Text style={[styles.modalStar, { color: '#4CAF50' }]}>★</Text>
              <Text style={styles.modalOptionText}>Namaz Kıldım</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleStatusSelect(PRAYER_STATUS.CONGREGATION)}
              activeOpacity={0.8}
            >
              <Text style={[styles.modalStar, { color: '#2196F3' }]}>★</Text>
              <Text style={styles.modalOptionText}>Cemaatle Kıldım</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleStatusSelect(PRAYER_STATUS.MISSED)}
              activeOpacity={0.8}
            >
              <Text style={[styles.modalStar, { color: '#424242' }]}>★</Text>
              <Text style={styles.modalOptionText}>Kılamadım</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>İptal</Text>
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
  weekRange: {
    fontSize: 16,
    color: '#E9D5FF',
    marginBottom: 15,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  navButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  todayButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  todayButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  table: {
    flex: 1,
    marginHorizontal: 5,
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  dateCell: {
    flex: 1.5,
    padding: 6,
    backgroundColor: '#8B5CF6',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    minWidth: 70,
  },
  dateHeaderCell: {
    flex: 1.5,
    padding: 6,
    backgroundColor: '#8B5CF6',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  headerCell: {
    alignItems: 'center',
  },
  prayerHeaderCell: {
    flex: 1,
    padding: 6,
    backgroundColor: '#A78BFA',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataCell: {
    flex: 1,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
    textAlign: 'center',
  },
  dayName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  dateText: {
    color: '#E9D5FF',
    fontSize: 10,
    marginTop: 2,
  },
  starButton: {
    padding: 2,
  },
  star: {
    fontSize: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#374151',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  modalStar: {
    fontSize: 32,
    marginRight: 15,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 15,
    marginTop: 10,
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
});
