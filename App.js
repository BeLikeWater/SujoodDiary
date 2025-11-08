import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import PrayerTracker from './PrayerTracker';

export default function App() {
  return (
    <View style={styles.container}>
      <PrayerTracker />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});
