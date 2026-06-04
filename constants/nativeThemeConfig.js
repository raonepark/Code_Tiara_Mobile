export const NATIVE_THEMES = {
  developer: {
    label: 'Developer',
    icon: '💻',
    colors: {
      rootBg: '#1E1E1E',
      textMain: '#ABB2BF',
      textAccent: '#61AFEF',
      headerBg: '#21252B',
      cardBg: '#1E1E1E',
      borderColor: '#3E3E42',
      taskBg: '#2D2D2D',
      taskHoverBg: '#32363D',
      checkboxDefault: '#5C6370',
      checkboxDone: '#98C379',
      deleteBtn: '#E06C75'
    },
    styles: {
      fontFamily: 'monospace',
      borderRadius: 0,
      borderWidth: 1,
      headerStyle: { borderBottomWidth: 1, borderColor: '#3E3E42', backgroundColor: '#21252B' },
      taskItem: { 
        borderLeftWidth: 4, 
        borderLeftColor: '#61AFEF', 
        marginBottom: 4, 
        padding: 12,
        backgroundColor: '#2D2D2D',
        borderRadius: 0
      }
    }
  },
  princess: {
    label: 'Princess',
    icon: '👑',
    colors: {
      rootBg: '#FFFCFD',
      textMain: '#475569', // slate-700
      textAccent: '#FF6B81',
      headerBg: '#FFF0F5',
      cardBg: '#FFFCFD',
      borderColor: '#FFC0CB',
      taskBg: '#FFFFFF',
      taskHoverBg: '#FFF0F5',
      checkboxDefault: '#F472B6',
      checkboxDone: '#FFB6C1',
      deleteBtn: '#FF4757'
    },
    styles: {
      fontFamily: 'GamjaFlower_400Regular', // Will be loaded
      titleFontFamily: 'Gaegu_400Regular',
      borderRadius: 20,
      borderWidth: 2,
      headerStyle: { borderBottomWidth: 2, borderColor: '#FFC0CB', borderStyle: 'dashed', backgroundColor: '#FFF0F5' },
      taskItem: { 
        borderWidth: 1, 
        borderColor: '#FFC0CB', 
        marginBottom: 8, 
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#FFB6C1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
        marginHorizontal: 12
      }
    }
  },
  excel: {
    label: 'Excel',
    icon: '📊',
    colors: {
      rootBg: '#FFFFFF',
      textMain: '#333333',
      textAccent: '#217346',
      headerBg: '#217346',
      cardBg: '#FFFFFF',
      borderColor: '#E1E1E1',
      taskBg: '#FFFFFF',
      taskHoverBg: '#F3F2F1',
      checkboxDefault: '#9CA3AF',
      checkboxDone: '#107C41',
      deleteBtn: '#C00000'
    },
    styles: {
      fontFamily: 'sans-serif', // Windows segoe ui fallback
      borderRadius: 0,
      borderWidth: 1,
      headerStyle: { borderBottomWidth: 1, borderColor: '#1E6B41', backgroundColor: '#217346' },
      taskItem: { 
        borderBottomWidth: 1, 
        borderColor: '#E1E1E1', 
        marginBottom: 0, 
        padding: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        flexDirection: 'row',
        alignItems: 'center'
      }
    }
  }
};
