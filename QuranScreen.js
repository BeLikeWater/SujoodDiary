import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';

// Her cüzün sayfa sayısı (1-29: 20 sayfa, 30: 24 sayfa)
const JUZ_PAGES = Array(30).fill(20);
JUZ_PAGES[29] = 24; // 30. cüz 24 sayfa

export default function QuranScreen() {
  const [currentJuz, setCurrentJuz] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [progress, setProgress] = useState({
    // Örnek: { 1: 5, 2: 12 } -> 1. cüzde 5 sayfa, 2. cüzde 12 sayfa okundu
  });

  const [inputPage, setInputPage] = useState('');

  const completedPages = Object.values(progress).reduce((sum, pages) => sum + pages, 0);
  const totalPages = 604;
  const totalJuz = 30;
  const completedJuz = Object.keys(progress).filter(juz => progress[juz] >= JUZ_PAGES[juz - 1]).length;

  const addReading = () => {
    if (!inputPage) {
      Alert.alert('Eksik Bilgi', 'Lütfen sayfa numarasını girin.');
      return;
    }

    const pageNum = parseInt(inputPage);
    const maxPages = JUZ_PAGES[currentJuz - 1];

    if (pageNum < 1 || pageNum > maxPages) {
      Alert.alert('Hata', `${currentJuz}. cüzde sayfa numarası 1-${maxPages} arasında olmalıdır.`);
      return;
    }

    const newProgress = { ...progress };
    newProgress[currentJuz] = pageNum;
    setProgress(newProgress);
    setCurrentPage(pageNum);
    setInputPage('');

    const points = pageNum * 5;
    Alert.alert(
      'Tebrikler! 🌟', 
      `${currentJuz}. cüzün ${pageNum}. sayfasına kadar okudun!\n+${points} Sevap Puanı kazandın!`
    );
  };

  const selectJuz = (juzNum) => {
    setCurrentJuz(juzNum);
    setCurrentPage(progress[juzNum] || 0);
    setInputPage('');
  };

  const getCurrentJuzProgress = () => {
    const read = progress[currentJuz] || 0;
    const total = JUZ_PAGES[currentJuz - 1];
    return { read, total, percent: Math.round((read / total) * 100) };
  };

  const juzProgress = getCurrentJuzProgress();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kuran Çizelgem</Text>
        <Text style={styles.headerSubtitle}>Cüz cüz ilerle! 📖</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Genel İstatistikler */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>📚</Text>
            <Text style={styles.statNumber}>{completedPages}</Text>
            <Text style={styles.statLabel}>Okunan Sayfa</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statNumber}>{completedJuz}/{totalJuz}</Text>
            <Text style={styles.statLabel}>Tamamlanan Cüz</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statNumber}>{completedPages * 5}</Text>
            <Text style={styles.statLabel}>Sevap Puanı</Text>
          </View>
        </View>

        {/* Cüz Seçimi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cüz Seç</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.juzContainer}
          >
            {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
              const isSelected = currentJuz === juzNum;
              const juzRead = progress[juzNum] || 0;
              const juzTotal = JUZ_PAGES[juzNum - 1];
              const isCompleted = juzRead >= juzTotal;
              
              return (
                <TouchableOpacity
                  key={juzNum}
                  style={[
                    styles.juzButton,
                    isSelected && styles.juzButtonSelected,
                    isCompleted && styles.juzButtonCompleted,
                  ]}
                  onPress={() => selectJuz(juzNum)}
                >
                  <Text style={[
                    styles.juzNumber,
                    isSelected && styles.juzNumberSelected,
                    isCompleted && styles.juzNumberCompleted,
                  ]}>
                    {juzNum}
                  </Text>
                  {isCompleted && <Text style={styles.juzCheck}>✓</Text>}
                  {!isCompleted && juzRead > 0 && (
                    <Text style={styles.juzProgress}>{juzRead}/{juzTotal}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Mevcut Cüz Detayı */}
        <View style={styles.currentJuzCard}>
          <View style={styles.currentJuzHeader}>
            <Text style={styles.currentJuzTitle}>{currentJuz}. Cüz</Text>
            <Text style={styles.currentJuzPages}>
              {juzProgress.read} / {juzProgress.total} sayfa
            </Text>
          </View>

          {/* İlerleme Çubuğu */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill,
                  { width: `${juzProgress.percent}%` }
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>%{juzProgress.percent}</Text>
          </View>

          {/* Sayfa Girişi */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              Kaçıncı sayfaya kadar okudun?
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.pageInput}
                value={inputPage}
                onChangeText={setInputPage}
                keyboardType="number-pad"
                placeholder="Sayfa numarası"
                maxLength={2}
              />
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={addReading}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.inputHint}>
              1-{JUZ_PAGES[currentJuz - 1]} arası sayfa girebilirsin
            </Text>
          </View>
        </View>

        {/* Tüm Cüzler Genel Bakış */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tüm Cüzler</Text>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
            const juzRead = progress[juzNum] || 0;
            const juzTotal = JUZ_PAGES[juzNum - 1];
            const percent = Math.round((juzRead / juzTotal) * 100);
            const isCompleted = juzRead >= juzTotal;

            return (
              <TouchableOpacity
                key={juzNum}
                style={styles.juzListCard}
                onPress={() => selectJuz(juzNum)}
              >
                <View style={styles.juzListLeft}>
                  <View style={[
                    styles.juzListIcon,
                    isCompleted && styles.juzListIconCompleted
                  ]}>
                    <Text style={styles.juzListIconText}>
                      {isCompleted ? '✓' : juzNum}
                    </Text>
                  </View>
                  <View style={styles.juzListContent}>
                    <Text style={styles.juzListTitle}>
                      {juzNum}. Cüz
                    </Text>
                    <Text style={styles.juzListSubtitle}>
                      {juzRead} / {juzTotal} sayfa
                    </Text>
                  </View>
                </View>
                <View style={styles.juzListRight}>
                  <View style={styles.miniProgressBar}>
                    <View 
                      style={[
                        styles.miniProgressFill,
                        { width: `${percent}%` },
                        isCompleted && { backgroundColor: '#10B981' }
                      ]}
                    />
                  </View>
                  <Text style={styles.juzListPercent}>%{percent}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    padding: 15,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  juzContainer: {
    paddingVertical: 5,
  },
  juzButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  juzButtonSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  juzButtonCompleted: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  juzNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  juzNumberSelected: {
    color: '#3B82F6',
  },
  juzNumberCompleted: {
    color: '#10B981',
  },
  juzCheck: {
    fontSize: 16,
    color: '#10B981',
    position: 'absolute',
    top: 4,
    right: 6,
  },
  juzProgress: {
    fontSize: 9,
    color: '#6B7280',
    position: 'absolute',
    bottom: 4,
  },
  currentJuzCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 5,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentJuzHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  currentJuzTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  currentJuzPages: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 6,
  },
  progressPercent: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  inputSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pageInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  juzListCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  juzListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  juzListIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  juzListIconCompleted: {
    backgroundColor: '#ECFDF5',
  },
  juzListIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  juzListContent: {
    flex: 1,
  },
  juzListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  juzListSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  juzListRight: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  miniProgressBar: {
    width: 50,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  juzListPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  bottomPadding: {
    height: 20,
  },
});
