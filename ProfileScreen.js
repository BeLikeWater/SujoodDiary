import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';

export default function ProfileScreen({ navigation }) {
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
              Alert.alert('Hata', 'Çıkış yapılamadı');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👤 Profilim</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌟 Bilgilerim</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>İsim:</Text>
          <Text style={styles.value}>{auth.currentUser?.displayName || 'Küçük Mümin'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{auth.currentUser?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Sevap Puanı:</Text>
          <Text style={styles.valueHighlight}>⭐ 450</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Derece:</Text>
          <Text style={styles.valueHighlight}>🏆 Altın Yıldız</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.characterButton}
        onPress={() => navigation.navigate('CharacterCustomization')}
      >
        <Text style={styles.characterButtonIcon}>🎨</Text>
        <Text style={styles.characterButtonText}>Karakterimi Özelleştir</Text>
        <Text style={styles.characterButtonArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.settingsButtonIcon}>⚙️</Text>
        <Text style={styles.settingsButtonText}>Ayarlar</Text>
        <Text style={styles.settingsButtonArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.reportButton}>
        <Text style={styles.reportButtonIcon}>📊</Text>
        <Text style={styles.reportButtonText}>Rapor Merkezi</Text>
        <Text style={styles.reportButtonArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonIcon}>🚪</Text>
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>
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
    backgroundColor: '#10B981',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: {
    fontSize: 16,
    color: '#6B7280',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  valueHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  characterButton: {
    backgroundColor: '#8B5CF6',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  characterButtonIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  characterButtonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  characterButtonArrow: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  settingsButton: {
    backgroundColor: '#6366F1',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  settingsButtonIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  settingsButtonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  settingsButtonArrow: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  reportButton: {
    backgroundColor: '#3B82F6',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  reportButtonIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  reportButtonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  reportButtonArrow: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    margin: 20,
    marginTop: 10,
    marginBottom: 40,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutButtonIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
