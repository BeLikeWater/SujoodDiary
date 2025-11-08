import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PrayerTracker from './PrayerTracker';
import NotificationSettings from './NotificationSettings';
import HomeScreen from './HomeScreen';
import ResponsibilitiesScreen from './ResponsibilitiesScreen';
import QuranScreen from './QuranScreen';
import ProfileScreen from './ProfileScreen';
import CharacterCustomizationScreen from './CharacterCustomizationScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || route.name;
        const isFocused = state.index === index;
        const isCenter = index === 2; // Ana sayfa ortada

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isCenter) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.centerButtonContainer}
            >
              <View style={styles.centerButton}>
                <Text style={styles.centerButtonIcon}>{options.tabBarIcon}</Text>
              </View>
              <Text style={styles.centerButtonLabel}>{label}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
          >
            <Text style={[styles.tabIcon, isFocused && styles.tabIconFocused]}>
              {options.tabBarIcon}
            </Text>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="PrayerTimes" 
        component={PrayerTracker}
        options={{
          tabBarLabel: 'Namaz',
          tabBarIcon: '🕌',
        }}
      />
      <Tab.Screen 
        name="Responsibilities" 
        component={ResponsibilitiesScreen}
        options={{
          tabBarLabel: 'Sorumluluklar',
          tabBarIcon: '🎯',
        }}
      />
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: '🏠',
        }}
      />
      <Tab.Screen 
        name="Quran" 
        component={QuranScreen}
        options={{
          tabBarLabel: 'Kuran',
          tabBarIcon: '📖',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={NotificationSettings}
        options={{
          tabBarLabel: 'Ayarlar',
          tabBarIcon: '⚙️',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Main" 
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            title: 'Profilim',
            headerStyle: {
              backgroundColor: '#8B5CF6',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen 
          name="CharacterCustomization" 
          component={CharacterCustomizationScreen}
          options={{
            title: 'Karakterimi Özelleştir',
            headerStyle: {
              backgroundColor: '#8B5CF6',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 80,
    paddingBottom: 10,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabLabelFocused: {
    color: '#10B981',
    fontWeight: '600',
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  centerButton: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 5,
    borderColor: '#FFFFFF',
  },
  centerButtonIcon: {
    fontSize: 28,
  },
  centerButtonLabel: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 4,
  },
});
