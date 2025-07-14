// src/screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee from '@notifee/react-native';

const SettingsScreen = ({ onNavigateBack }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  // 加载设置
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setNotifications(settings.notifications ?? true);
        setDarkMode(settings.darkMode ?? false);
        setSoundEnabled(settings.soundEnabled ?? true);
        setVibrationEnabled(settings.vibrationEnabled ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (key, value) => {
    try {
      const currentSettings = await AsyncStorage.getItem('appSettings');
      const settings = currentSettings ? JSON.parse(currentSettings) : {};
      settings[key] = value;
      await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleNotifications = (value) => {
    setNotifications(value);
    saveSettings('notifications', value);
    if (!value) {
      Alert.alert(
        'Notifications Disabled',
        'You will not receive any reminders for your targets.',
        [{ text: 'OK' }]
      );
    }
  };

  const toggleDarkMode = (value) => {
    setDarkMode(value);
    saveSettings('darkMode', value);
    // 这里可以添加主题切换逻辑
  };

  const toggleSound = (value) => {
    setSoundEnabled(value);
    saveSettings('soundEnabled', value);
  };

  const toggleVibration = (value) => {
    setVibrationEnabled(value);
    saveSettings('vibrationEnabled', value);
  };

  // 清除所有数据
  const clearAllData = () => {
    Alert.alert(
      'Clear All Data?',
      'This will delete all your targets and settings. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // 清除存储的数据
              await AsyncStorage.multiRemove(['targets', 'appSettings']);
              // 取消所有通知（使用 notifee）
              await notifee.cancelAllNotifications();
              
              Alert.alert('Success', 'All data has been cleared.');
              
              // 重置设置到默认值
              setNotifications(true);
              setDarkMode(false);
              setSoundEnabled(true);
              setVibrationEnabled(true);
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 通知设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive reminders for your targets
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#e5e7eb', true: '#a5b4fc' }}
              thumbColor={notifications ? '#4f46e5' : '#9ca3af'}
            />
          </View>

          {notifications && (
            <>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Sound</Text>
                  <Text style={styles.settingDescription}>
                    Play sound with notifications
                  </Text>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={toggleSound}
                  trackColor={{ false: '#e5e7eb', true: '#a5b4fc' }}
                  thumbColor={soundEnabled ? '#4f46e5' : '#9ca3af'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Vibration</Text>
                  <Text style={styles.settingDescription}>
                    Vibrate with notifications
                  </Text>
                </View>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={toggleVibration}
                  trackColor={{ false: '#e5e7eb', true: '#a5b4fc' }}
                  thumbColor={vibrationEnabled ? '#4f46e5' : '#9ca3af'}
                />
              </View>
            </>
          )}
        </View>

        {/* 外观设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Use dark theme (Coming soon)
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#e5e7eb', true: '#a5b4fc' }}
              thumbColor={darkMode ? '#4f46e5' : '#9ca3af'}
              disabled={true} // 暂时禁用
            />
          </View>
        </View>

        {/* 数据管理 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]}
            onPress={clearAllData}
          >
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
              Clear All Data
            </Text>
          </TouchableOpacity>
        </View>

        {/* 关于 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Developer</Text>
            <Text style={styles.aboutValue}>TargetAction Team</Text>
          </View>
        </View>

        {/* 底部留白 */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 56, // 与返回按钮相同的宽度，保持标题居中
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  dangerButtonText: {
    color: 'white',
  },
  aboutItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  aboutLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  aboutValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
});

export default SettingsScreen;