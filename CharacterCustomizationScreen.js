import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const CHARACTERS = ['👶', '👧', '🧒', '👦', '🧑'];
const HATS = ['🎩', '🧢', '👒', '⛑️', '🎓', '👑'];
const GLASSES = ['🕶️', '👓', '🥽'];
const ACCESSORIES = ['🎀', '🌸', '⭐', '💫', '✨'];

export default function CharacterCustomizationScreen() {
  const [selectedCharacter, setSelectedCharacter] = useState('👦');
  const [selectedHat, setSelectedHat] = useState(null);
  const [selectedGlasses, setSelectedGlasses] = useState(null);
  const [selectedAccessory, setSelectedAccessory] = useState(null);
  const [activeMenu, setActiveMenu] = useState('character');

  const menuItems = [
    { id: 'character', label: '👤 Karakter', icon: '👤' },
    { id: 'hat', label: '🎩 Şapka', icon: '🎩' },
    { id: 'glasses', label: '👓 Gözlük', icon: '👓' },
    { id: 'accessory', label: '✨ Aksesuar', icon: '✨' },
  ];

  const renderItems = () => {
    switch (activeMenu) {
      case 'character':
        return CHARACTERS.map((char, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.itemButton,
              selectedCharacter === char && styles.itemButtonSelected,
            ]}
            onPress={() => setSelectedCharacter(char)}
          >
            <Text style={styles.itemIcon}>{char}</Text>
          </TouchableOpacity>
        ));
      case 'hat':
        return HATS.map((hat, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.itemButton,
              selectedHat === hat && styles.itemButtonSelected,
            ]}
            onPress={() => setSelectedHat(hat)}
          >
            <Text style={styles.itemIcon}>{hat}</Text>
          </TouchableOpacity>
        ));
      case 'glasses':
        return GLASSES.map((glasses, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.itemButton,
              selectedGlasses === glasses && styles.itemButtonSelected,
            ]}
            onPress={() => setSelectedGlasses(glasses)}
          >
            <Text style={styles.itemIcon}>{glasses}</Text>
          </TouchableOpacity>
        ));
      case 'accessory':
        return ACCESSORIES.map((acc, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.itemButton,
              selectedAccessory === acc && styles.itemButtonSelected,
            ]}
            onPress={() => setSelectedAccessory(acc)}
          >
            <Text style={styles.itemIcon}>{acc}</Text>
          </TouchableOpacity>
        ));
    }
  };

  return (
    <View style={styles.container}>
      {/* Header - Sevap Puanı ve Derece */}
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>450</Text>
            <Text style={styles.statLabel}>Sevap Puanı</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statValue}>Altın</Text>
            <Text style={styles.statLabel}>Derecen</Text>
          </View>
        </View>
      </View>

      {/* Karakter Gösterimi */}
      <View style={styles.characterDisplay}>
        <View style={styles.characterCircle}>
          <Text style={styles.characterBase}>{selectedCharacter}</Text>
          {selectedHat && (
            <Text style={styles.characterHat}>{selectedHat}</Text>
          )}
          {selectedGlasses && (
            <Text style={styles.characterGlasses}>{selectedGlasses}</Text>
          )}
          {selectedAccessory && (
            <Text style={styles.characterAccessory}>{selectedAccessory}</Text>
          )}
        </View>
        <Text style={styles.characterName}>Benim Karakterim</Text>
      </View>

      {/* Kategori Menüsü */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.menuScroll}
        contentContainerStyle={styles.menuContainer}
      >
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuButton,
              activeMenu === item.id && styles.menuButtonActive,
            ]}
            onPress={() => setActiveMenu(item.id)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text
              style={[
                styles.menuText,
                activeMenu === item.id && styles.menuTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Öğe Seçim Grid */}
      <View style={styles.itemsContainer}>
        <ScrollView contentContainerStyle={styles.itemsGrid}>
          {renderItems()}
          {/* Temizle Butonu */}
          {activeMenu !== 'character' && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                if (activeMenu === 'hat') setSelectedHat(null);
                if (activeMenu === 'glasses') setSelectedGlasses(null);
                if (activeMenu === 'accessory') setSelectedAccessory(null);
              }}
            >
              <Text style={styles.clearButtonText}>❌ Çıkar</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
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
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 120,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  characterDisplay: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  characterCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
  },
  characterBase: {
    fontSize: 100,
  },
  characterHat: {
    fontSize: 50,
    position: 'absolute',
    top: -10,
  },
  characterGlasses: {
    fontSize: 40,
    position: 'absolute',
    top: 60,
  },
  characterAccessory: {
    fontSize: 35,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  characterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginTop: 15,
  },
  menuScroll: {
    maxHeight: 100,
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuButtonActive: {
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.3,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  menuTextActive: {
    color: '#FFFFFF',
  },
  itemsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 20,
    padding: 15,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  itemButton: {
    width: 80,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  itemButtonSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#EDE9FE',
  },
  itemIcon: {
    fontSize: 40,
  },
  clearButton: {
    width: 80,
    height: 80,
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    borderWidth: 3,
    borderColor: '#EF4444',
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#EF4444',
    textAlign: 'center',
  },
});
