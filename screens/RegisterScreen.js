import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!name || !email || !password || !confirmPassword || !groupCode) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı');
      return;
    }

    setLoading(true);
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with name
      await updateProfile(user, {
        displayName: name,
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        groupCode: groupCode.toUpperCase().trim(),
        createdAt: new Date().toISOString(),
        sevapPoints: 0,
        weeklyPoints: 0,
        degree: 'Yeni Başlayan',
        avatar: {
          character: '🧒',
          hat: '',
          glasses: '',
          accessory: '',
        },
      });

      Alert.alert('Başarılı', 'Hesabın oluşturuldu! Hoş geldin 🎉', [
        { text: 'Tamam' }
      ]);

      // Navigation will be handled by App.js based on auth state
    } catch (error) {
      console.log('Register error:', error);
      let errorMessage = 'Kayıt olunamadı';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Bu email adresi zaten kullanılıyor';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Geçersiz email adresi';
          break;
        case 'auth/weak-password':
          errorMessage = 'Şifre çok zayıf';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'İnternet bağlantısı hatası. Firebase Authentication aktif mi kontrol edin.';
          break;
        default:
          errorMessage = `${error.code}: ${error.message}`;
      }
      
      Alert.alert('Kayıt Hatası', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Logo/Icon */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🕌</Text>
            <Text style={styles.title}>Kayıt Ol</Text>
            <Text style={styles.subtitle}>Hadi başlayalım!</Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>👤 İsim</Text>
              <TextInput
                style={styles.input}
                placeholder="Adın Soyadın"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>📧 Email</Text>
              <TextInput
                style={styles.input}
                placeholder="ornek@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>🔒 Şifre</Text>
              <TextInput
                style={styles.input}
                placeholder="En az 6 karakter"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>🔒 Şifre Tekrar</Text>
              <TextInput
                style={styles.input}
                placeholder="Şifreni tekrar gir"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>👥 Grup Kodu</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: AILE2024"
                value={groupCode}
                onChangeText={setGroupCode}
                autoCapitalize="characters"
                editable={!loading}
              />
              <Text style={styles.inputHint}>
                Ailenle veya arkadaşlarınla yarışmak için grup kodu gir
              </Text>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Zaten hesabın var mı? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  registerButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
});
