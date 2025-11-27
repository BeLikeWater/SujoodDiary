import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, setDoc, orderBy, limit } from 'firebase/firestore';

export default function HomeScreen({ navigation }) {
  const [weeklyStats, setWeeklyStats] = useState({
    totalPrayers: 0,
    prayedCount: 0,
    congregationCount: 0,
    totalPoints: 0,
    percentage: 0,
  });
  const [leaderboardTab, setLeaderboardTab] = useState('group'); // 'group' or 'global'
  const [groupLeaderboard, setGroupLeaderboard] = useState([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState({ group: 0, global: 0 });
  const [userGroupCode, setUserGroupCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadWeeklyStats(),
      loadLeaderboards(),
    ]);
  };

  // Haftalık namaz verilerini çek
  const loadWeeklyStats = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

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

      // Firestore'dan bu hafta kılınan namazları çek
      const prayersRef = collection(db, 'prayers');
      const q = query(
        prayersRef,
        where('userId', '==', user.uid),
        where('date', '>=', mondayStr),
        where('date', '<=', sundayStr)
      );

      const querySnapshot = await getDocs(q);

      let prayedCount = 0;
      let congregationCount = 0;
      let totalPoints = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 1 || data.status === 2) {
          prayedCount++;

          // Puan hesaplama
          let points = data.prayer === 's' ? 15 : 10;
          if (data.status === 2) {
            points += 5;
            congregationCount++;
          }
          totalPoints += points;
        }
      });

      const totalPrayers = 35;
      const percentage = Math.round((prayedCount / totalPrayers) * 100);

      setWeeklyStats({
        totalPrayers,
        prayedCount,
        congregationCount,
        totalPoints,
        percentage,
      });

      // Kullanıcının weeklyPoints değerini Firestore'da güncelle
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        weeklyPoints: totalPoints,
      }, { merge: true });
      console.log(`✅ Ana sayfa - Haftalık puan güncellendi: ${totalPoints}`);
    } catch (error) {
      console.error('Haftalık istatistikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Liderlik tablolarını yükle
  const loadLeaderboards = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Kullanıcının grup kodunu al
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const groupCode = userData.groupCode || '';
      setUserGroupCode(groupCode);

      // Tüm kullanıcıları çek
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      let allUsers = [];
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`User: ${data.name}, weeklyPoints: ${data.weeklyPoints}`); // Debug log
        allUsers.push({
          id: doc.id,
          ...data,
        });
      });

      // Haftalık puana göre sırala
      allUsers.sort((a, b) => (b.weeklyPoints || 0) - (a.weeklyPoints || 0));

      console.log('Sorted users:', allUsers.map(u => ({ name: u.name, points: u.weeklyPoints }))); // Debug log

      // Global liderlik tablosu (ilk 10)
      setGlobalLeaderboard(allUsers.slice(0, 10));

      // Grup liderlik tablosu
      const groupUsers = allUsers.filter(u => u.groupCode === groupCode);
      setGroupLeaderboard(groupUsers.slice(0, 10));

      // Kullanıcının sıralamasını bul
      const globalRank = allUsers.findIndex(u => u.id === user.uid) + 1;
      const groupRank = groupUsers.findIndex(u => u.id === user.uid) + 1;

      setUserRank({
        global: globalRank,
        group: groupRank,
      });
    } catch (error) {
      console.error('Liderlik tablosu yüklenirken hata:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğine emin misin?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              console.error('Çıkış hatası:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  const renderLeaderboardItem = (user, index, isCurrentUser) => {
    const medals = ['🥇', '🥈', '🥉'];
    const medal = index < 3 ? medals[index] : `${index + 1}.`;

    return (
      <View
        key={user.id}
        style={[
          styles.leaderboardItem,
          isCurrentUser && styles.leaderboardItemCurrent,
        ]}
      >
        <Text style={styles.leaderboardRank}>{medal}</Text>
        <View style={styles.leaderboardInfo}>
          <Text style={[styles.leaderboardName, isCurrentUser && styles.leaderboardNameCurrent]}>
            {user.name} {isCurrentUser && '(Sen)'}
          </Text>
          {user.groupCode && (
            <Text style={styles.leaderboardGroup}>Grup: {user.groupCode}</Text>
          )}
        </View>
        <Text style={styles.leaderboardPoints}>⭐ {user.weeklyPoints || 0}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  const currentLeaderboard = leaderboardTab === 'group' ? groupLeaderboard : globalLeaderboard;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hoş Geldin Başlığı */}
        <View style={styles.welcomeCard}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>

          <Text style={styles.welcomeEmoji}>🌟</Text>
          <Text style={styles.welcomeTitle}>Hoş Geldin!</Text>
          <Text style={styles.welcomeSubtitle}>
            {auth.currentUser?.displayName || 'Küçük Mümin'}
          </Text>
        </View>

        {/* Haftalık Namaz Raporu */}
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>📊 Bu Haftanın Raporu</Text>
          </View>

          {/* Puan Gösterimi */}
          <View style={styles.pointsSection}>
            <Text style={styles.pointsLabel}>Toplam Sevap Puanı</Text>
            <Text style={styles.pointsValue}>⭐ {weeklyStats.totalPoints}</Text>
          </View>

          {/* İstatistik Detayları */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={styles.statValue}>{weeklyStats.prayedCount}</Text>
              <Text style={styles.statLabel}>Kılınan</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🕌</Text>
              <Text style={styles.statValue}>{weeklyStats.congregationCount}</Text>
              <Text style={styles.statLabel}>Cemaatle</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📈</Text>
              <Text style={styles.statValue}>%{weeklyStats.percentage}</Text>
              <Text style={styles.statLabel}>Başarı</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⏳</Text>
              <Text style={styles.statValue}>
                {weeklyStats.totalPrayers - weeklyStats.prayedCount}
              </Text>
              <Text style={styles.statLabel}>Kalan</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${weeklyStats.percentage}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {weeklyStats.prayedCount}/{weeklyStats.totalPrayers} namaz kılındı
            </Text>
          </View>
        </View>

        {/* Liderlik Tablosu */}
        <View style={styles.leaderboardCard}>
          <Text style={styles.leaderboardTitle}>🏆 Liderlik Tablosu</Text>

          {/* Tab Seçimi */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, leaderboardTab === 'group' && styles.tabActive]}
              onPress={() => setLeaderboardTab('group')}
            >
              <Text style={[styles.tabText, leaderboardTab === 'group' && styles.tabTextActive]}>
                Grubum ({userGroupCode})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, leaderboardTab === 'global' && styles.tabActive]}
              onPress={() => setLeaderboardTab('global')}
            >
              <Text style={[styles.tabText, leaderboardTab === 'global' && styles.tabTextActive]}>
                Herkes
              </Text>
            </TouchableOpacity>
          </View>

          {/* Kullanıcının Sıralaması */}
          <View style={styles.userRankCard}>
            <Text style={styles.userRankLabel}>Senin Sıralaman:</Text>
            <Text style={styles.userRankValue}>
              {leaderboardTab === 'group'
                ? (userRank.group > 0 ? `${userRank.group}. sırada` : 'Sıralama yok')
                : (userRank.global > 0 ? `${userRank.global}. sırada` : 'Sıralama yok')
              }
            </Text>
          </View>

          {/* Liderlik Listesi */}
          <View style={styles.leaderboardList}>
            {currentLeaderboard.length === 0 ? (
              <Text style={styles.emptyText}>Henüz kimse puan kazanmamış</Text>
            ) : (
              currentLeaderboard.map((user, index) =>
                renderLeaderboardItem(user, index, user.id === auth.currentUser?.uid)
              )
            )}
          </View>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
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
    position: 'relative',
  },
  logoutButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: {
    fontSize: 22,
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
  // Rapor Kartı
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  reportHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  pointsSection: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#E9D5FF',
    marginBottom: 8,
    fontWeight: '600',
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 10,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E9D5FF',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  // Liderlik Tablosu
  leaderboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  userRankCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRankLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  userRankValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
  },
  leaderboardList: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  leaderboardItemCurrent: {
    backgroundColor: '#E9D5FF',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  leaderboardRank: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 35,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  leaderboardNameCurrent: {
    color: '#7C3AED',
  },
  leaderboardGroup: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  leaderboardPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});
