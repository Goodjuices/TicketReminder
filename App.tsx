// App.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, PermissionsAndroid, Alert } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import CreateTargetScreen from './src/screens/CreateTargetScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import notifee from '@notifee/react-native';
import { TargetProvider } from './src/context/TargetContext';
// Target 类型定义
type Target = {
  id: string;
  type: 'event' | 'countdown';
  title: string;
  date: string;
  time?: string | null;
  reminderEnabled?: boolean;
  reminderMinutes?: number | null;
  notes?: string;
  createdAt?: string;
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);

  // 初始化通知服务
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // 请求Android通知权限
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message: 'Target app needs notification permission to send you reminders about your targets.',
              buttonPositive: 'Allow',
              buttonNegative: 'Deny',
            }
          );
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('✅ Notification permission granted');
          } else {
            Alert.alert(
              'Permission Required',
              'Please enable notifications in settings to receive target reminders',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'OK', 
                  onPress: () => console.log('User acknowledged permission denial')
                }
              ]
            );
          }
        }

        // iOS和Android都请求notifee权限
        const settings = await notifee.requestPermission();
        
        if (settings.authorizationStatus >= 1) {
          console.log('✅ Notifee permission granted');
        } else {
          console.log('❌ Notifee permission denied');
        }

        // 创建Android通知渠道
        if (Platform.OS === 'android') {
          await notifee.createChannel({
            id: 'target-reminders',
            name: 'Target Reminders',
            importance: 4, // HIGH
            sound: 'default',
            vibration: true,
          });
          console.log('✅ Android notification channel created');
        }
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
      }
    };

    initializeNotifications();

    // 监听通知事件
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      console.log('Foreground notification event:', type, detail);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const navigateToCreate = () => {
    setEditingTarget(null);  // 清空编辑数据
    setCurrentScreen('create');
  };
  
  const navigateToEdit = (target: Target) => {
    setEditingTarget(target);  // 设置要编辑的数据
    setCurrentScreen('create');  // 使用同一个页面
  };
  
  const navigateToHome = () => {
    setEditingTarget(null);  // 清空编辑数据
    setCurrentScreen('home');
  };
  
  const navigateToSettings = () => {
    setCurrentScreen('settings');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen 
            onNavigateToCreate={navigateToCreate}
            onNavigateToSettings={navigateToSettings}
            onNavigateToEdit={navigateToEdit}
          />
        );
      case 'create':
        return (
          <CreateTargetScreen 
            onNavigateBack={navigateToHome}
            editingTarget={editingTarget}
          />
        );
      case 'settings':
        return (
          <SettingsScreen 
            onNavigateBack={navigateToHome} 
          />
        );
      default:
        return (
          <HomeScreen 
            onNavigateToCreate={navigateToCreate}
            onNavigateToSettings={navigateToSettings}
            onNavigateToEdit={navigateToEdit}
          />
        );
    }
  };

  return (
    <TargetProvider>
      <View style={styles.container}>
        {renderScreen()}
      </View>
    </TargetProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});