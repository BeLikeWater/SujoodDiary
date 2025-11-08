import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
import { ref, set, push } from 'firebase/database';
import { database, auth } from './firebaseConfig';

const CATEGORIES = [
  { id: 1, name: 'Ev İçi', emoji: '🏡', color: '#10B981', tasks: [
    { id: 1, title: 'Dolabımı ve çekmecelerimi düzenlemek', emoji: '👕' },
    { id: 2, title: 'Yatağımı düzeltmek', emoji: '🛏️' },
    { id: 3, title: 'Ayakkabılarımı dolaba düzenli koymak', emoji: '👟' },
    { id: 4, title: 'Kıyafetlerimi dolaba yerleştirmek', emoji: '👔' },
    { id: 5, title: 'Masayı kurmaya yardım etmek', emoji: '🍽️' },
    { id: 6, title: 'Masayı toplamaya yardım etmek', emoji: '🧹' },
    { id: 7, title: 'Yemekten önce ve sonra ellerimi yıkamak', emoji: '🧼' },
    { id: 8, title: 'Kendi tabağımı mutfağa götürmek', emoji: '🍴' },
    { id: 9, title: 'Çöpleri çöp kutusuna atmak', emoji: '🗑️' },
    { id: 10, title: 'Çiçekleri sulamak', emoji: '🌻' },
    { id: 11, title: 'Çamaşırları katlamaya yardım etmek', emoji: '👚' },
    { id: 12, title: 'Kitaplığımdaki kitapları düzenlemek', emoji: '📚' },
    { id: 13, title: 'Lavabo ve klozeti temizlemek', emoji: '🚽' },
    { id: 14, title: 'Buzdolabını düzenlemeye yardım etmek', emoji: '🧊' },
    { id: 15, title: 'Bulaşıkları makineye yerleştirmek', emoji: '🍽️' },
    { id: 16, title: 'Odamdaki tozları silmek', emoji: '🧽' },
    { id: 17, title: 'Sofra duasını okumak', emoji: '🤲' },
    { id: 18, title: 'Evi süpürmede aileme yardım etmek', emoji: '🧹' },
    { id: 19, title: 'Evcil hayvanı varsa beslemek', emoji: '🐾' },
    { id: 20, title: 'Ailece film veya kitap saati yapmak', emoji: '📖' },
  ]},
  { id: 2, name: 'Kişisel', emoji: '🙋', color: '#3B82F6', tasks: [
    { id: 21, title: 'Dişlerimi fırçalamak', emoji: '🪥' },
    { id: 22, title: 'Üzerimi temiz tutmak', emoji: '👕' },
    { id: 23, title: 'Ellerimi yıkamak', emoji: '🧼' },
    { id: 24, title: 'Zamanında uyumak', emoji: '😴' },
    { id: 25, title: 'Zamanında uyanmak', emoji: '⏰' },
    { id: 26, title: 'Çantamı hazırlamak', emoji: '🎒' },
    { id: 27, title: 'Ödevlerimi zamanında yapmak', emoji: '📝' },
    { id: 28, title: 'Eşyalarımı kaybetmemek', emoji: '🔑' },
    { id: 29, title: 'Su israf etmemek', emoji: '💧' },
    { id: 30, title: 'Gereksiz ışıkları kapatmak', emoji: '💡' },
    { id: 31, title: 'Yere düşen çöp varsa kaldırmak', emoji: '🗑️' },
    { id: 32, title: 'Tırnaklarımı kesmek', emoji: '✂️' },
    { id: 33, title: 'Telefon/tablet süresini sınırlamak', emoji: '📱' },
    { id: 34, title: 'Sağlıklı beslenmeye özen göstermek', emoji: '🥗' },
    { id: 35, title: 'Kendi saçımı taramak', emoji: '💇' },
    { id: 36, title: 'Güne dua ederek başlamak', emoji: '🤲' },
    { id: 37, title: 'Gün sonunda şükretmek', emoji: '🙏' },
    { id: 38, title: 'Doğru söz söylemek', emoji: '💬' },
    { id: 39, title: 'Sabırlı olmak', emoji: '⏳' },
    { id: 40, title: 'Günlük yaşamda Allah\'ı hatırlamak', emoji: '☪️' },
  ]},
  { id: 3, name: 'Aile', emoji: '👨‍👩‍👧‍👦', color: '#F59E0B', tasks: [
    { id: 41, title: 'Kardeşime kitap okumak', emoji: '📖' },
    { id: 42, title: 'Büyüklerime çay ikramı yapmak', emoji: '☕' },
    { id: 43, title: 'Anneme mutfakta yardım etmek', emoji: '👩‍🍳' },
    { id: 44, title: 'Babama alışveriş poşetlerini taşımak', emoji: '🛍️' },
    { id: 45, title: 'Günaydın demek, selam vermek', emoji: '👋' },
    { id: 46, title: 'Selam vererek sofraya oturmak', emoji: '🍽️' },
    { id: 47, title: 'Büyüklerime sarılmak ve teşekkür etmek', emoji: '🤗' },
    { id: 48, title: 'Akrabalarımı ziyaret etmek', emoji: '🏠' },
    { id: 49, title: 'Dedeme/nineme telefon etmek', emoji: '📞' },
    { id: 50, title: 'Kardeşime oyun öğretmek', emoji: '🎮' },
  ]},
  { id: 4, name: 'Sosyal', emoji: '🌍', color: '#EF4444', tasks: [
    { id: 51, title: 'Yardımlaşma faaliyetlerinde aktif rol almak', emoji: '🤝' },
    { id: 52, title: 'Sıra arkadaşımla iyi anlaşmak', emoji: '👫' },
    { id: 53, title: 'Derslerime vaktinde girmek ve çıkmak', emoji: '⏰' },
    { id: 54, title: 'Çöpleri çöp kutusuna atmak', emoji: '🗑️' },
    { id: 55, title: 'Selam vererek sınıfa girmek', emoji: '👋' },
    { id: 56, title: 'Okul çalışanlarına selam vermek', emoji: '🙋' },
    { id: 57, title: 'Komşulara selam vermek', emoji: '👋' },
    { id: 58, title: 'Doğum günü olan birini tebrik etmek', emoji: '🎂' },
    { id: 59, title: 'Arkadaşlarıma güzel söz söylemek', emoji: '💬' },
    { id: 60, title: 'Öğretmenlerime teşekkür etmek', emoji: '👨‍🏫' },
    { id: 61, title: 'Okul eşyalarını özenle kullanmak', emoji: '✏️' },
  ]},
  { id: 5, name: 'Allah\'a Karşı', emoji: '🕌', color: '#8B5CF6', tasks: [
    { id: 62, title: 'Sabah ve akşam dua etmek', emoji: '🤲' },
    { id: 63, title: 'Elhamdülillah demek', emoji: '🙏' },
    { id: 64, title: 'Öğle namazını cemaatle kılmak', emoji: '🕌' },
    { id: 65, title: 'Kur\'an\'dan sure ezberlemek', emoji: '📖' },
    { id: 66, title: 'Allah\'a şükretmek', emoji: '🙏' },
    { id: 67, title: 'Başkasına zarar vermemek', emoji: '❤️' },
    { id: 68, title: 'Yardım ederek Allah\'ın rızasını kazanmak', emoji: '🤝' },
    { id: 69, title: 'Allah\'tan özür dilemek', emoji: '🤲' },
    { id: 70, title: 'Cuma sünnetlerini yerine getirmek', emoji: '🕌' },
    { id: 71, title: 'İyilikle örnek olmak', emoji: '⭐' },
  ]},
];

export default function ResponsibilitiesScreen() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [completedTasks, setCompletedTasks] = useState(new Set());

  const takePhoto = async (task) => {
    // Fotoğraf özelliği geçici olarak devre dışı
    Alert.alert('Yakında! 📸', 'Fotoğraf çekme özelliği yakında eklenecek!');
    
    // TODO: expo-image-picker sorunları çözülünce tekrar aktif edilecek
    /*
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera iznine ihtiyacımız var.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          Alert.alert('Hata', 'Giriş yapmalısınız');
          return;
        }

        const photoRef = ref(database, `users/${userId}/responsibility_photos`);
        const newPhotoRef = push(photoRef);
        
        await set(newPhotoRef, {
          taskId: task.id,
          taskTitle: task.title,
          taskEmoji: task.emoji,
          category: selectedCategory.name,
          photo: result.assets[0].base64,
          timestamp: new Date().toISOString(),
          date: new Date().toLocaleDateString('tr-TR'),
        });

        Alert.alert('Başarılı! 📸', `${task.emoji} ${task.title} fotoğrafı kaydedildi!`);
      }
    } catch (error) {
      console.error('Fotoğraf çekme hatası:', error);
      Alert.alert('Hata', 'Fotoğraf çekilemedi');
    }
    */
  };

  const toggleTask = (taskId) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
  };

  const completedCount = selectedCategory.tasks.filter(task => 
    completedTasks.has(task.id)
  ).length;
  const progressPercent = Math.round((completedCount / selectedCategory.tasks.length) * 100);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sorumluluklarım</Text>
        <Text style={styles.headerSubtitle}>Her gün bir görev yap! 🌟</Text>
      </View>

      {/* Category Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategory.id === category.id && {
                backgroundColor: category.color,
              }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text style={[
              styles.categoryName,
              selectedCategory.id === category.id && styles.categoryNameActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            {completedCount} / {selectedCategory.tasks.length} tamamlandı
          </Text>
          <Text style={styles.progressPercent}>%{progressPercent}</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${progressPercent}%`,
                backgroundColor: selectedCategory.color 
              }
            ]} 
          />
        </View>
      </View>

      {/* Task List */}
      <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false}>
        {selectedCategory.tasks.map((task, index) => (
          <TouchableOpacity
            key={task.id}
            style={[
              styles.taskCard,
              completedTasks.has(task.id) && styles.taskCardCompleted
            ]}
            onPress={() => toggleTask(task.id)}
          >
            <View style={styles.taskLeft}>
              <View style={[
                styles.checkbox,
                completedTasks.has(task.id) && {
                  backgroundColor: selectedCategory.color,
                  borderColor: selectedCategory.color,
                }
              ]}>
                {completedTasks.has(task.id) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.taskEmoji}>{task.emoji}</Text>
              <View style={styles.taskTextContainer}>
                <Text style={[
                  styles.taskTitle,
                  completedTasks.has(task.id) && styles.taskTitleCompleted
                ]}>
                  {task.title}
                </Text>
              </View>
            </View>
            <View style={styles.taskRight}>
              {completedTasks.has(task.id) && (
                <>
                  <TouchableOpacity
                    style={styles.photoButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      takePhoto(task);
                    }}
                  >
                    <Text style={styles.photoButtonText}>📸</Text>
                  </TouchableOpacity>
                  <Text style={styles.taskPoints}>+10 ⭐</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        ))}
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
  categoryScroll: {
    backgroundColor: '#fff',
    maxHeight: 80,
  },
  categoryContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  categoryNameActive: {
    color: '#fff',
  },
  progressContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  taskCard: {
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
  taskCardCompleted: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  photoButtonText: {
    fontSize: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 20,
  },
  taskTitleCompleted: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  taskPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  bottomPadding: {
    height: 20,
  },
});
