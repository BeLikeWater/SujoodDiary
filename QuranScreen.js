import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function QuranScreen() {
  const [showInitialSetup, setShowInitialSetup] = useState(false);
  const [pagesPerJuz, setPagesPerJuz] = useState(20);

  const [currentJuz, setCurrentJuz] = useState(1);
  const [progress, setProgress] = useState({});
  const [sliderValue, setSliderValue] = useState(0);

  const [showContinueSetup, setShowContinueSetup] = useState(false);
  const [continueJuz, setContinueJuz] = useState('');
  const [continuePage, setContinuePage] = useState('');

  // Her cüzün sayfa sayısı
  const getJuzPages = (juzNum) => {
    if (juzNum === 30 && pagesPerJuz === 20) {
      return 24; // 30. cüz standart hatimde 24 sayfa
    }
    return pagesPerJuz;
  };

  useEffect(() => {
    loadData();
  }, []);

  // Slider değerini progress'e göre ayarla
  useEffect(() => {
    setSliderValue(progress[currentJuz] || 0);
  }, [currentJuz, progress]);

  const loadData = async () => {
    try {
      const setupDone = await AsyncStorage.getItem('quran_setup_done');
      const savedPagesPerJuz = await AsyncStorage.getItem('quran_pages_per_juz');
      const savedProgress = await AsyncStorage.getItem('quran_progress');

      if (savedPagesPerJuz) {
        setPagesPerJuz(parseInt(savedPagesPerJuz));
      }

      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }

      if (!setupDone) {
        setShowInitialSetup(true);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  const saveData = async (newProgress) => {
    try {
      await AsyncStorage.setItem('quran_progress', JSON.stringify(newProgress));
    } catch (error) {
      console.error('Veri kaydetme hatası:', error);
    }
  };

  const handleInitialChoice = async (isNewHatim) => {
    if (isNewHatim) {
      // Sıfırdan başlıyor
      await AsyncStorage.setItem('quran_setup_done', 'true');
      setShowInitialSetup(false);
    } else {
      // Devam eden hatim var
      setShowInitialSetup(false);
      setShowContinueSetup(true);
    }
  };

  const handleContinueSetup = async () => {
    const juz = parseInt(continueJuz);
    const page = parseInt(continuePage);

    if (!juz || juz < 1 || juz > 30) {
      Alert.alert('Hata', 'Cüz numarası 1-30 arasında olmalıdır.');
      return;
    }

    const maxPages = getJuzPages(juz);
    if (!page || page < 1 || page > maxPages) {
      Alert.alert('Hata', `Sayfa numarası 1-${maxPages} arasında olmalıdır.`);
      return;
    }

    // Girilen noktaya kadar tüm cüz ve sayfaları doldur
    const newProgress = {};

    for (let i = 1; i < juz; i++) {
      newProgress[i] = getJuzPages(i);
    }

    newProgress[juz] = page;

    setProgress(newProgress);
    await saveData(newProgress);
    await AsyncStorage.setItem('quran_setup_done', 'true');
    setShowContinueSetup(false);
    setCurrentJuz(juz);

    Alert.alert('Harika! 🎉', `${juz}. cüzün ${page}. sayfasından devam ediyorsun!`);
  };


  const incrementPage = () => {
    const maxPages = getJuzPages(currentJuz);
    if (sliderValue < maxPages) {
      setSliderValue(sliderValue + 1);
    }
  };

  const decrementPage = () => {
    if (sliderValue > 0) {
      setSliderValue(sliderValue - 1);
    }
  };

  const addReading = async () => {
    const pageNum = Math.round(sliderValue);

    if (pageNum < 1) {
      Alert.alert('Bilgi', 'Lütfen sayfa seçin.');
      return;
    }

    const newProgress = { ...progress };
    newProgress[currentJuz] = pageNum;
    setProgress(newProgress);
    await saveData(newProgress);

    const points = pageNum * 5;
    Alert.alert(
      'Tebrikler! 🌟',
      `${currentJuz}. cüzün ${pageNum}. sayfasına kadar okudun!\n+${points} Sevap Puanı kazandın!`
    );
  };

  const selectJuz = (juzNum) => {
    setCurrentJuz(juzNum);
    setSliderValue(progress[juzNum] || 0);
  };

  const getCurrentJuzProgress = () => {
    const read = progress[currentJuz] || 0;
    const total = getJuzPages(currentJuz);
    return { read, total, percent: Math.round((read / total) * 100) };
  };

  const getTotalStats = () => {
    let totalPagesRead = 0;
    let completedJuzCount = 0;

    for (let i = 1; i <= 30; i++) {
      const read = progress[i] || 0;
      const total = getJuzPages(i);
      totalPagesRead += read;
      if (read >= total) {
        completedJuzCount++;
      }
    }

    return { totalPagesRead, completedJuzCount };
  };

  const stats = getTotalStats();
  const juzProgress = getCurrentJuzProgress();

  return (
    <SafeAreaView style={styles.container}>
      {/* İlk Kurulum Modalı */}
      <Modal
        visible={showInitialSetup}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>📖</Text>
            <Text style={styles.modalTitle}>Kuran Çizelgeme Hoş Geldin!</Text>
            <Text style={styles.modalText}>
              Hatmini takip etmeye başlayalım. Sıfırdan mı başlıyorsun yoksa devam eden bir hatmin mi var?
            </Text>

            <TouchableOpacity
              style={styles.modalButtonPrimary}
              onPress={() => handleInitialChoice(true)}
            >
              <Text style={styles.modalButtonPrimaryText}>✨ Sıfırdan Başlıyorum</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButtonSecondary}
              onPress={() => handleInitialChoice(false)}
            >
              <Text style={styles.modalButtonSecondaryText}>📚 Devam Eden Hatmim Var</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Devam Eden Hatim Kurulum Modalı */}
      <Modal
        visible={showContinueSetup}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>📍</Text>
            <Text style={styles.modalTitle}>Kaldığın Yeri Söyle</Text>
            <Text style={styles.modalText}>
              Hangi cüzün kaçıncı sayfasındasın? Girdiğin noktaya kadar tüm sayfaları tamamlanmış olarak işaretleyeceğiz.
            </Text>

            <View style={styles.continueInputContainer}>
              <View style={styles.continueInputWrapper}>
                <Text style={styles.continueInputLabel}>Cüz</Text>
                <TextInput
                  style={styles.continueInput}
                  value={continueJuz}
                  onChangeText={setContinueJuz}
                  keyboardType="number-pad"
                  placeholder="1-30"
                  maxLength={2}
                />
              </View>

              <View style={styles.continueInputWrapper}>
                <Text style={styles.continueInputLabel}>Sayfa</Text>
                <TextInput
                  style={styles.continueInput}
                  value={continuePage}
                  onChangeText={setContinuePage}
                  keyboardType="number-pad"
                  placeholder="1-20"
                  maxLength={2}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalButtonPrimary}
              onPress={handleContinueSetup}
            >
              <Text style={styles.modalButtonPrimaryText}>Devam Et</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📖 Kuran Çizelgem</Text>
        <Text style={styles.headerSubtitle}>Cüz cüz ilerle!</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Genel İstatistikler */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>📚</Text>
            <Text style={styles.statNumber}>{stats.totalPagesRead}</Text>
            <Text style={styles.statLabel}>Okunan Sayfa</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statNumber}>{stats.completedJuzCount}/30</Text>
            <Text style={styles.statLabel}>Tamamlanan Cüz</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statNumber}>{stats.totalPagesRead * 5}</Text>
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
              const juzTotal = getJuzPages(juzNum);
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

            {/* Sayfa Seçici (+/- Butonlar) */}
            <View style={styles.pageSelector}>
              <TouchableOpacity
                style={[styles.pageButton, sliderValue <= 0 && styles.pageButtonDisabled]}
                onPress={decrementPage}
                disabled={sliderValue <= 0}
              >
                <Text style={styles.pageButtonText}>−</Text>
              </TouchableOpacity>

              <View style={styles.pageDisplay}>
                <Text style={styles.pageNumber}>{Math.round(sliderValue)}</Text>
                <Text style={styles.pageTotal}>/ {getJuzPages(currentJuz)}</Text>
              </View>

              <TouchableOpacity
                style={[styles.pageButton, sliderValue >= getJuzPages(currentJuz) && styles.pageButtonDisabled]}
                onPress={incrementPage}
                disabled={sliderValue >= getJuzPages(currentJuz)}
              >
                <Text style={styles.pageButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Kaydet Butonu */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={addReading}
            >
              <Text style={styles.saveButtonText}>✓ Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tüm Cüzler Genel Bakış */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tüm Cüzler</Text>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
            const juzRead = progress[juzNum] || 0;
            const juzTotal = getJuzPages(juzNum);
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
                        isCompleted && { backgroundColor: '#8B5CF6' }
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
    backgroundColor: '#F0F9FF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#8B5CF6',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E9D5FF',
    marginTop: 4,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  juzContainer: {
    paddingVertical: 5,
  },
  juzButton: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  juzButtonSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  juzButtonCompleted: {
    borderColor: '#8B5CF6',
    backgroundColor: '#E9D5FF',
  },
  juzNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  juzNumberSelected: {
    color: '#8B5CF6',
  },
  juzNumberCompleted: {
    color: '#7C3AED',
  },
  juzCheck: {
    fontSize: 16,
    color: '#8B5CF6',
    position: 'absolute',
    top: 4,
    right: 6,
  },
  juzProgress: {
    fontSize: 9,
    color: '#6B7280',
    position: 'absolute',
    bottom: 4,
    fontWeight: '600',
  },
  currentJuzCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 10,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
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
    color: '#8B5CF6',
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#E9D5FF',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
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
    borderTopColor: '#E9D5FF',
    paddingTop: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  pageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  pageButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  pageButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
  },
  pageButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pageDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  pageNumber: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  pageTotal: {
    fontSize: 26,
    fontWeight: '600',
    color: '#9CA3AF',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 30,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  juzListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  juzListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  juzListIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  juzListIconCompleted: {
    backgroundColor: '#E9D5FF',
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
    marginBottom: 4,
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
    height: 5,
    backgroundColor: '#E9D5FF',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
  },
  juzListPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  bottomPadding: {
    height: 100,
  },
  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modalEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  modalButtonPrimary: {
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonSecondary: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueInputContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
    width: '100%',
  },
  continueInputWrapper: {
    flex: 1,
  },
  continueInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  continueInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E9D5FF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1F2937',
  },
  settingsInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E9D5FF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    marginBottom: 30,
    color: '#1F2937',
  },
});
