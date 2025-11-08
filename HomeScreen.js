import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function HomeScreen({ navigation }) {
  // Mock data - gerçekte bu veriler PrayerTracker'dan gelecek
  const [stats] = useState({
    completed: 12,
    percentage: 68,
    remaining: 23,
  });

  return (
    <View style={styles.container}>
      {/* Profil Butonu - Sol Üst Köşe */}
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.profileIcon}>👤</Text>
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hoş Geldin Başlığı */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeEmoji}>🌟</Text>
          <Text style={styles.welcomeTitle}>Hoş Geldin!</Text>
          <Text style={styles.welcomeSubtitle}>Küçük Mümin</Text>
        </View>

        {/* İstatistik Kartları */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Bu Hafta</Text>
            <Text style={styles.statSubLabel}>Kıldım</Text>
          </View>

          <View style={[styles.statCard, styles.statCardBlue]}>
            <Text style={styles.statEmoji}>📊</Text>
            <Text style={styles.statNumber}>%{stats.percentage}</Text>
            <Text style={styles.statLabel}>Başarı</Text>
            <Text style={styles.statSubLabel}>Oranı</Text>
          </View>

          <View style={[styles.statCard, styles.statCardOrange]}>
            <Text style={styles.statEmoji}>�</Text>
            <Text style={styles.statNumber}>{stats.remaining}</Text>
            <Text style={styles.statLabel}>Kalan</Text>
            <Text style={styles.statSubLabel}>Namaz</Text>
          </View>
        </View>

        {/* Hızlı Erişim Butonları */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('PrayerTimes')}
          >
            <Text style={styles.actionIcon}>🕌</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Secde Günlüğüm</Text>
              <Text style={styles.actionSubtitle}>Namazlarını işaretle</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Responsibilities')}
          >
            <Text style={styles.actionIcon}>�</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Sorumluluklar</Text>
              <Text style={styles.actionSubtitle}>Görevlerini tamamla</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Quran')}
          >
            <Text style={styles.actionIcon}>📖</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Kuran Çizelgem</Text>
              <Text style={styles.actionSubtitle}>Okuduğun sayfaları kaydet</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Sevap Puanı */}
        <View style={styles.sevapCard}>
          <View style={styles.sevapHeader}>
            <Text style={styles.sevapTitle}>Sevap Puanın</Text>
            <Text style={styles.sevapBadge}>🏆 Altın Yıldız</Text>
          </View>
          <Text style={styles.sevapPoints}>⭐ 450</Text>
          <View style={styles.sevapProgress}>
            <View style={[styles.sevapProgressFill, { width: '75%' }]} />
          </View>
          <Text style={styles.sevapNextLevel}>Sonraki seviye için 100 puan daha!</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  profileButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  profileIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 120,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statCardGreen: {
    backgroundColor: '#D1FAE5',
  },
  statCardBlue: {
    backgroundColor: '#DBEAFE',
  },
  statCardOrange: {
    backgroundColor: '#FEF3C7',
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  statSubLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  quickActions: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
    marginLeft: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 3,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  actionArrow: {
    fontSize: 20,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  sevapCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sevapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  sevapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sevapBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sevapPoints: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  sevapProgress: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  sevapProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  sevapNextLevel: {
    fontSize: 13,
    color: '#E9D5FF',
    fontWeight: '600',
  },
});
