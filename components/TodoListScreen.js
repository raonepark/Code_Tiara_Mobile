import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { db, collection, query, getDocs, doc, setDoc } from '../firebase/firebaseConfig';
import { Circle, CheckCircle, LogOut, Plus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TodoListScreen({ user, onLogout }) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultTasks = [
    { id: 1, text: '반가워요! 첫 할 일을 추가해 보세요.', completed: false },
    { id: 2, text: '길게 누르면(Long Press) 수정이나 삭제가 가능하도록 만들 예정이에요.', completed: false }
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
          // Firestore
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

  const toggleTask = async (id) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(newTasks);
    // save logic
    if (user.uid === 'guest_user') {
      await AsyncStorage.setItem('lumora_tasks', JSON.stringify(newTasks));
    } else {
      const task = newTasks.find(t => t.id === id);
      if (task) {
        try {
          await setDoc(doc(db, 'users', user.uid, 'tasks', String(task.id)), { ...task, userId: user.uid });
        } catch(e) {}
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Board</Text>
          <Text style={styles.headerSubtitle}>{user.uid === 'guest_user' ? 'Guest Mode' : user.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <LogOut size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.taskItem} 
            onPress={() => toggleTask(item.id)}
            activeOpacity={0.7}
          >
            {item.completed ? (
              <CheckCircle size={24} color="#9CA3AF" />
            ) : (
              <Circle size={24} color="#000" />
            )}
            <Text style={[styles.taskText, item.completed && styles.taskTextDone]}>
              {item.text}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab}>
        <Plus size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  listContent: {
    padding: 24,
    gap: 12
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500'
  },
  taskTextDone: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through'
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 64,
    height: 64,
    backgroundColor: '#000',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6
  }
});
