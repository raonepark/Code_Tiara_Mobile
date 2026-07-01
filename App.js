import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, Platform, View, ActivityIndicator, StatusBar as RNStatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  // Use the local IP where the PC React server will be running (port 3000)
  const LOCAL_IP = '172.30.1.66';
  const PC_WEB_URL = `http://${LOCAL_IP}:3000`;

  // Dynamically track theme changes from WebView to style native status bar
  const [currentTheme, setCurrentTheme] = useState('auth');

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data && data.type === 'THEME_CHANGE') {
        setCurrentTheme(data.theme);
      }
    } catch (e) {
      console.log('Error parsing WebView message:', e);
    }
  };

  // Status Bar and safe area style config based on active theme
  const getStatusBarConfig = () => {
    switch (currentTheme) {
      case 'auth':
        return {
          backgroundColor: '#F9FAFB', // Matches bg-gray-50 background of AuthScreen
          statusBarStyle: 'dark'
        };
      case 'princess':
        return {
          backgroundColor: '#FFF0F5',
          statusBarStyle: 'dark'
        };
      case 'excel':
        return {
          backgroundColor: '#107C41',
          statusBarStyle: 'light'
        };
      case 'developer':
        return {
          backgroundColor: '#21252B',
          statusBarStyle: 'light'
        };
      default:
        return {
          backgroundColor: '#ffffff',
          statusBarStyle: 'dark'
        };
    }
  };

  const config = getStatusBarConfig();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: config.backgroundColor }]}>
      <StatusBar style={config.statusBarStyle} translucent={true} backgroundColor="transparent" />
      <WebView 
        source={{ uri: PC_WEB_URL }} 
        style={styles.webview}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        )}
        allowsInlineMediaPlayback={true}
        bounces={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  }
});
