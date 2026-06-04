import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Animated } from 'react-native';
import { Circle, CheckCircle, Trash2, Edit2, Copy, FileText, Check, X, Clock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NATIVE_THEMES } from '../constants/nativeThemeConfig';

export default function TaskItem({
  task,
  currentTheme,
  toggleTask,
  deleteTask,
  duplicateTask,
  saveTaskEdit
}) {
  const themeConfig = NATIVE_THEMES[currentTheme] || NATIVE_THEMES['developer'];
  const colors = themeConfig.colors;
  const tStyles = themeConfig.styles;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit States
  const [editTitle, setEditTitle] = useState(task.text);
  const [editMemo, setEditMemo] = useState(task.memo || '');
  const [editDate, setEditDate] = useState(task.dueDate ? new Date(task.dueDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    saveTaskEdit(task.id, {
      text: editTitle,
      memo: editMemo,
      dueDate: editDate.toISOString(),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.text);
    setEditMemo(task.memo || '');
    setIsEditing(false);
  };

  const firstLineOfMemo = task.memo ? task.memo.split('\n')[0] : '';

  return (
    <View style={[
      styles.card, 
      tStyles.taskItem, 
      { backgroundColor: colors.taskBg, borderColor: colors.borderColor, borderRadius: tStyles.borderRadius }
    ]}>
      {/* Normal / Expanded View Mode */}
      {!isEditing ? (
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.mainRow}
        >
          {/* Checkbox */}
          <TouchableOpacity onPress={() => toggleTask(task.id)} style={styles.checkBtn}>
            {task.completed ? (
              <CheckCircle size={22} color={colors.checkboxDone} />
            ) : (
              <Circle size={22} color={colors.checkboxDefault} />
            )}
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text 
              style={[
                styles.taskText, 
                { color: task.completed ? colors.checkboxDefault : colors.textMain, fontFamily: tStyles.fontFamily },
                task.completed && { textDecorationLine: 'line-through', opacity: 0.6 }
              ]}
            >
              {task.text}
            </Text>

            {/* Faint single-line memo preview when NOT expanded */}
            {!isExpanded && firstLineOfMemo !== '' && (
              <View style={styles.memoPreview}>
                <FileText size={10} color={colors.textMain} style={{ opacity: 0.4 }} />
                <Text style={[styles.memoPreviewText, { color: colors.textMain, fontFamily: tStyles.fontFamily }]} numberOfLines={1}>
                  {firstLineOfMemo}
                </Text>
              </View>
            )}

            {/* Accordion Expanded Details */}
            {isExpanded && (
              <View style={styles.expandedContent}>
                {task.memo && task.memo.trim() !== '' && (
                  <View style={[styles.fullMemoBox, { backgroundColor: colors.rootBg, borderColor: colors.borderColor, borderRadius: tStyles.borderRadius > 0 ? 8 : 0 }]}>
                    <Text style={[styles.fullMemoText, { color: colors.textMain, fontFamily: tStyles.fontFamily }]}>
                      {task.memo}
                    </Text>
                  </View>
                )}
                
                {task.dueDate && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <Clock size={12} color={colors.textAccent} />
                    <Text style={{ fontSize: 11, color: colors.textAccent, marginLeft: 4, fontFamily: tStyles.fontFamily }}>
                      {new Date(task.dueDate).toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Action Buttons (Visible only when expanded) */}
          {isExpanded && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity onPress={(e) => { e.stopPropagation(); duplicateTask(task); }} style={styles.iconBtn}>
                <Copy size={16} color={colors.textMain} style={{ opacity: 0.6 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={(e) => { e.stopPropagation(); setIsEditing(true); }} style={styles.iconBtn}>
                <Edit2 size={16} color={colors.textAccent} />
              </TouchableOpacity>
              <TouchableOpacity onPress={(e) => { e.stopPropagation(); deleteTask(task.id); }} style={styles.iconBtn}>
                <Trash2 size={16} color={colors.deleteBtn} />
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      ) : (
        /* Edit Mode */
        <View style={styles.editContainer}>
          <TextInput
            style={[styles.editTitleInput, { color: colors.textMain, borderColor: colors.textAccent, backgroundColor: colors.rootBg, borderRadius: tStyles.borderRadius > 0 ? 8 : 0, fontFamily: tStyles.fontFamily }]}
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="할 일을 입력하세요..."
            placeholderTextColor={colors.textMain + '80'}
          />
          <TextInput
            style={[styles.editMemoInput, { color: colors.textMain, borderColor: colors.borderColor, backgroundColor: colors.rootBg, borderRadius: tStyles.borderRadius > 0 ? 8 : 0, fontFamily: tStyles.fontFamily }]}
            value={editMemo}
            onChangeText={setEditMemo}
            placeholder="상세 메모를 입력하세요..."
            placeholderTextColor={colors.textMain + '80'}
            multiline
          />
          
          <View style={styles.datePickerRow}>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.dateBtn, { borderColor: colors.borderColor }]}>
              <Clock size={14} color={colors.textAccent} />
              <Text style={{ color: colors.textAccent, fontSize: 12, marginLeft: 4, fontFamily: tStyles.fontFamily }}>
                {editDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={[styles.dateBtn, { borderColor: colors.borderColor }]}>
              <Text style={{ color: colors.textAccent, fontSize: 12, fontFamily: tStyles.fontFamily }}>
                {editDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={editDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setEditDate(selectedDate);
                }}
              />
            )}
            
            {showTimePicker && (
              <DateTimePicker
                value={editDate}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowTimePicker(false);
                  if (selectedDate) setEditDate(selectedDate);
                }}
              />
            )}
          </View>

          <View style={styles.editActions}>
            <TouchableOpacity onPress={handleCancel} style={[styles.actionBtn, { backgroundColor: colors.headerBg, borderRadius: tStyles.borderRadius > 0 ? 8 : 0 }]}>
              <X size={16} color={colors.textMain} />
              <Text style={{ color: colors.textMain, marginLeft: 4, fontFamily: tStyles.fontFamily }}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[styles.actionBtn, { backgroundColor: colors.textAccent, borderRadius: tStyles.borderRadius > 0 ? 8 : 0 }]}>
              <Check size={16} color={currentTheme === 'developer' ? '#1E1E1E' : '#FFF'} />
              <Text style={{ color: currentTheme === 'developer' ? '#1E1E1E' : '#FFF', marginLeft: 4, fontFamily: tStyles.fontFamily }}>저장</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  checkBtn: {
    paddingTop: 2,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  taskText: {
    fontSize: 16,
    marginBottom: 2,
  },
  memoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  memoPreviewText: {
    fontSize: 11,
    opacity: 0.5,
    marginLeft: 4,
  },
  expandedContent: {
    marginTop: 8,
  },
  fullMemoBox: {
    borderWidth: 1,
    padding: 10,
    marginTop: 4,
  },
  fullMemoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    gap: 4,
    paddingTop: 2,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(128,128,128,0.05)',
  },
  editContainer: {
    width: '100%',
  },
  editTitleInput: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
    fontSize: 15,
  },
  editMemoInput: {
    borderWidth: 1,
    padding: 10,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  datePickerRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  }
});
