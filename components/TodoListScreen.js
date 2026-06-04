import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { db, collection, query, getDocs, doc, setDoc, deleteDoc } from '../firebase/firebaseConfig';
import { LogOut, Plus, ChevronDown, Calendar, Briefcase, Coffee, Star, Settings } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NATIVE_THEMES } from '../constants/nativeThemeConfig';
import TaskItem from './TaskItem';
import SettingsModal from './SettingsModal';

export default function TodoListScreen({ user, onLogout, currentTheme, onThemeChange }) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  const themeConfig = NATIVE_THEMES[currentTheme] || NATIVE_THEMES['developer'];
  const colors = themeConfig.colors;
  const tStyles = themeConfig.styles;

  // Strict PC categories
  const pcCategories = [
    { id: 'cat_1', label: 'Important', icon: 'Star', colorTheme: 'red' },
    { id: 'cat_2', label: 'Work', icon: 'Briefcase', colorTheme: 'cyan' },
    { id: 'cat_3', label: 'Personal', icon: 'Coffee', colorTheme: 'emerald' },
  ];

  const defaultTasks = [
    { id: 1, text: '직권 취소 요청드리기', categoryId: 'cat_2', completed: false, dueTime: '' },
    { id: 2, text: '이력서들 모두 업데이트', categoryId: 'cat_3', completed: false, dueTime: '' },
    { id: 3, text: '코드 티아라 모바일 버전 만들기', categoryId: 'cat_3', completed: false, dueTime: '' },
    { id: 4, text: '청바지 아래 부분 정리하기', categoryId: 'cat_3', completed: false, dueDate: '2026-06-04T21:00:00Z', memo: '기장 줄이기, 허리 수선 포함\n반드시 오늘 저녁까지 맡기기!' },
    { id: 5, text: '상담 수업 듣기', categoryId: 'cat_3', completed: false, dueDate: '2026-06-04T19:00:00Z' },
  ];

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        if (user.uid === 'guest_user') {
          const saved = await AsyncStorage.getItem('lumora_tasks');
          if (saved) {
            setTasks(JSON.parse(saved));
          } else {
            setTasks(defaultTasks);
          }
        } else {
          const taskQuery = query(collection(db, 'users', user.uid, 'tasks'));
          const snapshot = await getDocs(taskQuery);
          if (snapshot.empty) {
            setTasks(defaultTasks);
          } else {
            const loaded = [];
            snapshot.forEach(doc => loaded.push(doc.data()));
            setTasks(loaded);
          }
        }
      } catch (err) {
        console.error(err);
        setTasks(defaultTasks);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, [user]);

  const saveToStorage = async (newTasks) => {
    setTasks(newTasks);
    if (user.uid === 'guest_user') {
      await AsyncStorage.setItem('lumora_tasks', JSON.stringify(newTasks));
    }
  };

  const toggleTask = async (id) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    await saveToStorage(newTasks);
    if (user.uid !== 'guest_user') {
      const task = newTasks.find(t => t.id === id);
      try { await setDoc(doc(db, 'users', user.uid, 'tasks', String(task.id)), { ...task, userId: user.uid }); } catch(e) {}
    }
  };

  const deleteTask = async (id) => {
    const newTasks = tasks.filter(t => t.id !== id);
    await saveToStorage(newTasks);
    if (user.uid !== 'guest_user') {
      try { await deleteDoc(doc(db, 'users', user.uid, 'tasks', String(id))); } catch(e) {}
    }
  };

  const saveTaskEdit = async (id, updatedData) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, ...updatedData } : t);
    await saveToStorage(newTasks);
    if (user.uid !== 'guest_user') {
      const task = newTasks.find(t => t.id === id);
      try { await setDoc(doc(db, 'users', user.uid, 'tasks', String(task.id)), { ...task, userId: user.uid }); } catch(e) {}
    }
  };

  const duplicateTask = async (taskToDuplicate) => {
    const newTask = { ...taskToDuplicate, id: Date.now(), completed: false };
    const newTasks = [...tasks, newTask];
    await saveToStorage(newTasks);
    if (user.uid !== 'guest_user') {
      try { await setDoc(doc(db, 'users', user.uid, 'tasks', String(newTask.id)), { ...newTask, userId: user.uid }); } catch(e) {}
    }
  };

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskText,
      categoryId: 'cat_3',
      completed: false,
      memo: ''
    };
    const newTasks = [...tasks, newTask];
    await saveToStorage(newTasks);
    setNewTaskText('');
    if (user.uid !== 'guest_user') {
      try { await setDoc(doc(db, 'users', user.uid, 'tasks', String(newTask.id)), { ...newTask, userId: user.uid }); } catch(e) {}
    }
  };

  const getIcon = (iconName, color) => {
    switch (iconName) {
      case 'Briefcase': return <Briefcase size={16} color={color} />;
      case 'Coffee': return <Coffee size={16} color={color} />;
      case 'Star': return <Star size={16} color={color} />;
      default: return <Briefcase size={16} color={color} />;
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.rootBg }]}>
        <ActivityIndicator size="large" color={colors.textAccent} />
      </View>
    );
  }

  // Filter out categories that have no tasks (or keep them if you want PC's exact empty states)
  // For PC match, we map over all categories explicitly
  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.rootBg }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header - Fixed Height and Layout */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderColor, borderBottomWidth: tStyles.borderWidth }]}>
        <View style={styles.headerTopRow}>
          <Text style={[styles.headerTitle, { color: colors.textAccent, fontFamily: tStyles.titleFontFamily || tStyles.fontFamily }]}>
            MY BOARD
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setIsSettingsOpen(true)} style={styles.iconBtn}>
              <Settings size={22} color={colors.textAccent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onLogout} style={styles.iconBtn}>
              <LogOut size={22} color={colors.textAccent} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.filterRow}>
          <TouchableOpacity style={[styles.themeSelectorBtn, { borderColor: colors.borderColor, backgroundColor: colors.cardBg, borderRadius: tStyles.borderRadius > 0 ? 8 : 0 }]}>
            <Calendar size={14} color={colors.textMain} />
            <Text style={[styles.themeSelectorText, { color: colors.textMain, fontFamily: tStyles.fontFamily }]}>전체 날짜</Text>
            <ChevronDown size={14} color={colors.textMain} />
          </TouchableOpacity>
          <View style={styles.taskCountWrapper}>
            <Text style={[styles.taskCountText, { color: colors.textMain, fontFamily: tStyles.fontFamily }]}>
              {tasks.filter(t=>t.completed).length}/{tasks.length}
            </Text>
          </View>
        </View>

        {/* Categories rendering */}
        {pcCategories.map(category => {
          const catTasks = tasks.filter(t => t.categoryId === category.id);
          if (catTasks.length === 0 && category.id === 'cat_1') return null; // Hide Important if empty for cleanliness
          const catCompleted = catTasks.filter(t => t.completed).length;

          return (
            <View key={category.id} style={styles.categoryWrapper}>
              {/* Category Header */}
              <View style={[
                styles.categoryHeader, 
                currentTheme === 'excel' && { backgroundColor: '#F3F2F1', borderBottomWidth: 1, borderColor: colors.borderColor, paddingHorizontal: 8 },
                currentTheme === 'princess' && { borderBottomWidth: 2, borderColor: colors.borderColor, borderStyle: 'dashed', paddingBottom: 8, marginBottom: 12 }
              ]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {getIcon(category.icon, colors.textAccent)}
                  <Text style={[styles.categoryTitle, { color: colors.textAccent, fontFamily: tStyles.titleFontFamily || tStyles.fontFamily }]}>
                    {currentTheme === 'developer' ? `>_ ${category.label}` : category.label}
                  </Text>
                </View>
                
                <View style={{flexDirection:'row', alignItems:'center'}}>
                  <TouchableOpacity style={[styles.catIconBtn, { borderColor: colors.borderColor, borderRadius: tStyles.borderRadius > 0 ? 6 : 0 }]}>
                    <Plus size={14} color={colors.textAccent} />
                  </TouchableOpacity>
                  <View style={[styles.catCountBadge, { borderColor: colors.borderColor, borderRadius: tStyles.borderRadius > 0 ? 12 : 0 }]}>
                    <Text style={[styles.catCountText, { color: colors.textAccent, fontFamily: tStyles.fontFamily }]}>
                      {catCompleted} / {catTasks.length}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Task List under Category */}
              <View style={styles.taskList}>
                {catTasks.map(item => (
                  <TaskItem
                    key={item.id}
                    task={item}
                    currentTheme={currentTheme}
                    toggleTask={toggleTask}
                    deleteTask={deleteTask}
                    duplicateTask={duplicateTask}
                    saveTaskEdit={saveTaskEdit}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Add Task Input */}
      <View style={[
        styles.bottomInputContainer, 
        { 
          backgroundColor: colors.headerBg, 
          borderTopColor: colors.borderColor, 
          borderTopWidth: tStyles.borderWidth || 1 
        }
      ]}>
        <TextInput
          style={[
            styles.bottomInput, 
            { 
              color: colors.textMain, 
              backgroundColor: colors.cardBg, 
              borderColor: colors.borderColor, 
              fontFamily: tStyles.fontFamily,
              borderRadius: tStyles.borderRadius > 0 ? 8 : 0,
              borderWidth: tStyles.borderWidth || 1
            }
          ]}
          placeholder="새로운 할 일을 입력하세요... (Enter)"
          placeholderTextColor={colors.textMain + '80'}
          value={newTaskText}
          onChangeText={setNewTaskText}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
        />
        <TouchableOpacity 
          onPress={handleAddTask} 
          style={[
            styles.addBtn, 
            { 
              backgroundColor: colors.textAccent,
              borderRadius: tStyles.borderRadius > 0 ? 8 : 0
            }
          ]}
        >
          <Plus size={20} color={currentTheme === 'developer' ? '#1E1E1E' : '#FFF'} />
        </TouchableOpacity>
      </View>

      <SettingsModal
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={currentTheme}
        onThemeChange={onThemeChange}
        colors={colors}
        tStyles={tStyles}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    padding: 16, 
    paddingTop: 56, // For safe area / notch
    paddingBottom: 16,
  },
  headerTopRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBtn: { padding: 4 },
  scrollContent: { padding: 16, paddingBottom: 120 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  themeSelectorBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, gap: 6 },
  themeSelectorText: { fontSize: 13, fontWeight: 'bold' },
  taskCountWrapper: { paddingHorizontal: 8 },
  taskCountText: { fontSize: 13, fontWeight: 'bold', opacity: 0.6 },
  categoryWrapper: { marginBottom: 32 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  categoryTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  catIconBtn: { borderWidth: 1, padding: 6, marginRight: 8 },
  catCountBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  catCountText: { fontSize: 11, fontWeight: 'bold' },
  taskList: { flexDirection: 'column', gap: 0 },
  bottomInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  bottomInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 15,
  },
  addBtn: {
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
