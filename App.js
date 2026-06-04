import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import './i18n';
import { useTranslation } from 'react-i18next';
import AuthScreen from './components/AuthScreen';
import TodoListScreen from './components/TodoListScreen';
import { auth, onAuthStateChanged, signOut, isConfigured } from './firebase/firebaseConfig';
import { THEME_CONFIG } from './constants/themeConfig';
import { getThemeColor } from './utils/themeHelper';

export default function App() {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState('developer');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen to Firebase auth changes if configured
  useEffect(() => {
    if (!isConfigured) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    if (user?.uid === 'guest_user') {
      setUser(null);
    } else {
      setAuthLoading(true);
      try {
        await signOut(auth);
        setUser(null);
      } catch (err) {
        console.error(err);
      } finally {
        setAuthLoading(false);
      }
    }
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  const isDark = false;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {!user ? (
        <AuthScreen
          currentTheme={theme}
          onAuthSuccess={handleAuthSuccess}
          onThemeChange={setTheme}
        />
      ) : (
        <TodoListScreen user={user} onLogout={handleLogout} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  themeHeader: {
    marginBottom: 24,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  userIconWrapper: {
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
  },
  infoBox: {
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(128,128,128,0.06)',
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  infoSubText: {
    fontSize: 12,
    textAlign: 'center',
  },
  logoutButton: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
