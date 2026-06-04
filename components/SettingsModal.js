import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { X, Palette } from 'lucide-react-native';
import { NATIVE_THEMES } from '../constants/nativeThemeConfig';

export default function SettingsModal({ visible, onClose, currentTheme, onThemeChange, tStyles, colors }) {
  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable 
          style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.borderColor, borderRadius: tStyles.borderRadius || 12 }]} 
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.borderColor, borderBottomWidth: tStyles.borderWidth || 1 }]}>
            <Text style={[styles.title, { color: colors.textAccent, fontFamily: tStyles.titleFontFamily || tStyles.fontFamily }]}>설정 (Settings)</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textMain} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {/* Theme Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Palette size={16} color={colors.textMain} />
                <Text style={[styles.sectionTitle, { color: colors.textMain, fontFamily: tStyles.fontFamily }]}> 테마 변경</Text>
              </View>
              
              <View style={styles.themeGrid}>
                {Object.keys(NATIVE_THEMES).map(key => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => onThemeChange(key)}
                    style={[
                      styles.themeCard,
                      { 
                        backgroundColor: currentTheme === key ? colors.taskHoverBg : colors.taskBg,
                        borderColor: currentTheme === key ? colors.textAccent : colors.borderColor,
                        borderRadius: tStyles.borderRadius || 8,
                        borderWidth: currentTheme === key ? 2 : 1
                      }
                    ]}
                  >
                    <Text style={{ fontSize: 24, marginBottom: 8 }}>{NATIVE_THEMES[key].icon}</Text>
                    <Text style={{ color: currentTheme === key ? colors.textAccent : colors.textMain, fontFamily: tStyles.fontFamily }}>
                      {NATIVE_THEMES[key].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    flex: 1,
    minWidth: '30%',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
