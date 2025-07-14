// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { useTargets } from '../context/TargetContext';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
const calculateDaysRemaining = (dateString) => {
  // 解析日期字符串，确保使用本地时区
  const [year, month, day] = dateString.split('-').map(num => parseInt(num));
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(year, month - 1, day); // month - 1 因为月份从0开始
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate - today;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); // 使用 round 而不是 ceil
  
  return diffDays;
};
const HomeScreen = ({ onNavigateToCreate, onNavigateToSettings, onNavigateToEdit }) => {
  const { targets, loadTargets, deleteTarget } = useTargets();
  const [isLoading, setIsLoading] = useState(true);
    const activeTargetsCount = targets.filter(target => {
    const daysRemaining = calculateDaysRemaining(target.date);
    return daysRemaining >= 0; // 今天及未来的目标算作活跃
    }).length;
  // 加载targets
  useEffect(() => {
    loadTargets();
  }, []);

  // 删除模拟数据，使用真实的targets


  // 格式化日期显示
const formatDate = (dateString) => {
  // 解析日期字符串，避免时区问题
  const [year, month, day] = dateString.split('-').map(num => parseInt(num));
  const date = new Date(year, month - 1, day);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

  // 处理删除
  const handleDeleteTarget = (targetId, targetTitle) => {
    Alert.alert(
      'Delete Target?',
      `Are you sure you want to delete "${targetTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteTarget(targetId);
          }
        },
      ]
    );
  };

  // 渲染单个Target卡片（前端可见部分）
  const renderTargetCard = ({item}) => {
    const target = item;
    const isEvent = target.type === 'event';
    const daysRemaining = calculateDaysRemaining(target.date);
    
    return (
      <TouchableOpacity 
        style={[
          styles.targetCard,
          isEvent ? styles.eventCard : styles.countdownCard
        ]}
        onPress={() => onNavigateToEdit(target)}
        onLongPress={() => handleDeleteTarget(target.id, target.title)}
        delayLongPress={500}
        activeOpacity={1}
      >
        {/* Target类型图标 */}
        <View style={styles.targetHeader}>
          <Text style={styles.targetIcon}>
            {isEvent ? '⚡' : '📅'}
          </Text>
          <View style={styles.targetInfo}>
            <Text style={styles.targetTitle}>{target.title}</Text>
            <Text style={styles.targetDate}>
              {formatDate(target.date)}
              {isEvent && target.time && ` at ${target.time.substring(0, 5)}`}
            </Text>
          </View>
        </View>

        {/* 天数显示 */}
        <View style={styles.daysContainer}>
          {daysRemaining === 0 ? (
            <Text style={styles.todayText}>Today!</Text>
          ) : daysRemaining > 0 ? (
            <>
              <Text style={styles.daysNumber}>{daysRemaining}</Text>
              <Text style={styles.daysLabel}>
                day{daysRemaining !== 1 ? 's' : ''} remaining
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.daysNumber}>{Math.abs(daysRemaining)}</Text>
              <Text style={styles.daysLabel}>
                day{Math.abs(daysRemaining) !== 1 ? 's' : ''} ago
              </Text>
            </>
          )}
        </View>

        {/* 提醒状态（仅Event类型） */}
        {isEvent && (
          <View style={styles.reminderBadge}>
            <Text style={styles.reminderText}>
              {target.reminderEnabled ? '🔔 Reminder On' : '🔕 Reminder Off'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // 渲染隐藏的删除按钮
  const renderHiddenItem = ({item}) => (
  <View style={styles.rowBack}>
    <View style={styles.deleteContainer}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => handleDeleteTarget(item.id, item.title)}
      >
        <Text style={styles.deleteIcon}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* 顶部栏 */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.logo}>🎯</Text>
          <Text style={styles.appName}>Target</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{activeTargetsCount} Active</Text>
        </View>
      </View>

      {/* Targets列表或空状态 */}
      {targets.length > 0 ? (
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Your Targets</Text>
          <SwipeListView
            data={targets}
            renderItem={renderTargetCard}
            renderHiddenItem={renderHiddenItem}
            rightOpenValue={-60}
            disableRightSwipe
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            closeOnTap={true}           // 点击时关闭已打开的行
            closeOnScroll={true}         // 滚动时关闭已打开的行
            closeOnRowPress={true}       // 点击行时关闭
            closeOnRowBeginSwipe={true}  // 开始滑动新行时关闭其他行
            recalculateHiddenLayout={false}  // 防止重新计算布局
            tension={40}                 // 调整滑动张力
            friction={8}                 // 调整滑动摩擦力
          />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No Targets Yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first reminder to get started
            </Text>
          </View>
        </ScrollView>
      )}

      {/* 底部操作栏 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.createButton} onPress={onNavigateToCreate}>
          <Text style={styles.createButtonText}>+ Create New Target</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomTabs}>
          <TouchableOpacity style={styles.tabButton}>
            <Text style={styles.tabIcon}>📋</Text>
            <Text style={styles.tabLabel}>All Targets</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton} onPress={onNavigateToSettings}>
            <Text style={styles.tabIcon}>⚙️</Text>
            <Text style={styles.tabLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // 顶部栏
  header: {
    backgroundColor: '#1a1a2e',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    marginRight: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  badge: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 0,
    marginBottom: 16,
    overflow: 'hidden',
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 60,
  },
  backRightBtnRight: {
    backgroundColor: '#ef4444',
    right: 0,
    borderRadius: 12,
    marginTop: 13,    // 添加上边距
    marginBottom: 8, // 添加下边距
    height: '90%',
  },
  backTextWhite: {
    color: '#FFF',
    fontWeight: '600',
  },
  badgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteContainer: {
  alignItems: 'center',
  bottom: 0,
  justifyContent: 'center',
  position: 'absolute',
  top: 0,
  width: 60,
  right: 0,
  overflow: 'hidden',  // 确保内容不溢出
},

backRightBtn: {
  alignItems: 'center',
  justifyContent: 'center',
  width: '90%',
  height: '90%',
},

backRightBtnRight: {
  backgroundColor: '#ef4444',
  borderTopRightRadius: 12,     // 👈 右上角圆角
  borderBottomRightRadius: 12,  // 👈 右下角圆角
  marginRight: 10,              // 👈 右边距，让按钮不贴边
},
  // 内容区域
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  },

  // Target卡片
  targetCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    opacity: 1,           // 确保完全不透明
    zIndex: 1,           // 提高层级
    position: 'relative', // 确保层级生效
  },
  eventCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  countdownCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  targetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  targetIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  targetInfo: {
    flex: 1,
  },
  targetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  targetDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  daysContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 12,
  },
  daysNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  daysLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  todayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  reminderBadge: {
    alignSelf: 'flex-start',
  },
  reminderText: {
    fontSize: 12,
    color: '#6b7280',
  },

  // 空状态
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },

  // 底部栏
  bottomBar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  createButton: {
    backgroundColor: '#4f46e5',
    margin: 16,
    marginBottom: 12,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default HomeScreen;