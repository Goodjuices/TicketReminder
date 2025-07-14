// src/services/NotificationService.js
import notifee, { AndroidImportance, TriggerType, RepeatFrequency } from '@notifee/react-native';
import { Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.setupNotifications();
  }

  setupNotifications = async () => {
    // 请求权限
    if (Platform.OS === 'ios') {
      await notifee.requestPermission();
    }

    // 创建通知渠道（Android）
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'target-reminder-channel',
        name: 'Target Reminders',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
    }
  };

  // 安排事件提醒通知
  scheduleNotification = async (target) => {
    if (!target.reminderEnabled || target.type !== 'event') return;

    const targetDateTime = new Date(`${target.date}T${target.time}`);
    const reminderTime = new Date(targetDateTime.getTime() - (target.reminderMinutes * 60 * 1000));

    if (reminderTime <= new Date()) {
      console.log('Reminder time has passed');
      return;
    }

    await notifee.createTriggerNotification(
      {
        id: target.id,
        title: '🎯 Target Reminder',
        body: `${target.title} - in ${target.reminderMinutes} minutes!`,
        android: {
          channelId: 'target-reminder-channel',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: reminderTime.getTime(),
      }
    );
  };

  // 安排每日提醒
  scheduleDailyNotification = async (target) => {
    if (target.type !== 'countdown') return;
    
    const targetDate = new Date(target.date);
    const today = new Date();
    
    if (targetDate <= today) {
      console.log('Target date has passed');
      return;
    }
    
    // 设置每天早上9点
    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: new Date().setHours(9, 0, 0, 0),
      repeatFrequency: RepeatFrequency.DAILY,
    };
    
    const daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    
    await notifee.createTriggerNotification(
      {
        id: `${target.id}-daily`,
        title: '📅 Goal Countdown',
        body: `${target.title} - ${daysRemaining} days remaining!`,
        android: {
          channelId: 'target-reminder-channel',
          importance: AndroidImportance.HIGH,
        },
      },
      trigger
    );
  };

  cancelNotification = async (targetId) => {
    await notifee.cancelNotification(targetId);
  };

  cancelDailyNotification = async (targetId) => {
    await notifee.cancelNotification(`${targetId}-daily`);
  };

  cancelAllNotificationsForTarget = async (targetId) => {
    await this.cancelNotification(targetId);
    await this.cancelDailyNotification(targetId);
  };

  cancelAllNotifications = async () => {
    await notifee.cancelAllNotifications();
  };

  checkPermission = async () => {
    const settings = await notifee.getNotificationSettings();
    return settings.authorizationStatus >= 1;
  };

  requestPermissions = async () => {
    await notifee.requestPermission();
  };
}

export default new NotificationService();