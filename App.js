import React from 'react';
import { StyleSheet, SafeAreaView, Platform, View, ActivityIndicator, StatusBar as RNStatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  // Use the local IP where the PC React server will be running (port 3000)
  const LOCAL_IP = '172.30.1.42';
  const PC_WEB_URL = `http://${LOCAL_IP}:3000`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <WebView 
        source={{ uri: PC_WEB_URL }} 
        style={styles.webview}
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
    backgroundColor: '#1E1E1E', // Dark background while loading
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
