// src/context/TargetContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';

const TargetContext = createContext();

export const useTargets = () => {
  const context = useContext(TargetContext);
  if (!context) {
    throw new Error('useTargets must be used within a TargetProvider');
  }
  return context;
};

export const TargetProvider = ({ children }) => {
  const [targets, setTargets] = useState([]);

  // 从AsyncStorage加载targets
  useEffect(() => {
    loadTargets();
  }, []);

  const loadTargets = async () => {
    try {
      const savedTargets = await AsyncStorage.getItem('targets');
      if (savedTargets) {
        const parsedTargets = JSON.parse(savedTargets);
        setTargets(parsedTargets);
        
        // 重新安排所有通知
        parsedTargets.forEach(target => {
          if (target.type === 'event' && target.reminderEnabled) {
            NotificationService.scheduleNotification(target);
          } else if (target.type === 'countdown') {
            NotificationService.scheduleDailyNotification(target);
          }
        });
      }
    } catch (error) {
      console.error('Error loading targets:', error);
    }
  };

  const saveTargets = async (newTargets) => {
    try {
      await AsyncStorage.setItem('targets', JSON.stringify(newTargets));
      setTargets(newTargets);
    } catch (error) {
      console.error('Error saving targets:', error);
    }
  };

  const addTarget = (newTarget) => {
    const targetWithId = {
      ...newTarget,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedTargets = [...targets, targetWithId];
    saveTargets(updatedTargets);
    
    // 根据类型安排不同的通知
    if (targetWithId.type === 'event' && targetWithId.reminderEnabled) {
      NotificationService.scheduleNotification(targetWithId);
    } else if (targetWithId.type === 'countdown') {
      NotificationService.scheduleDailyNotification(targetWithId);
    }
  };

  const deleteTarget = (targetId) => {
    const updatedTargets = targets.filter(t => t.id !== targetId);
    saveTargets(updatedTargets);
    
    // 取消所有相关通知（事件通知和每日通知）
    NotificationService.cancelAllNotificationsForTarget(targetId);
  };

  const updateTarget = (targetId, updates) => {
    const updatedTargets = targets.map(t => 
      t.id === targetId ? { ...t, ...updates, id: targetId } : t
    );
    saveTargets(updatedTargets);
    
    // 先取消所有旧通知
    NotificationService.cancelAllNotificationsForTarget(targetId);
    
    // 根据更新后的类型重新安排通知
    const updatedTarget = updatedTargets.find(t => t.id === targetId);
    if (updatedTarget) {
      if (updatedTarget.type === 'event' && updatedTarget.reminderEnabled) {
        NotificationService.scheduleNotification(updatedTarget);
      } else if (updatedTarget.type === 'countdown') {
        NotificationService.scheduleDailyNotification(updatedTarget);
      }
    }
  };

  return (
    <TargetContext.Provider value={{
      targets,
      addTarget,
      deleteTarget,
      updateTarget,
      loadTargets,
    }}>
      {children}
    </TargetContext.Provider>
  );
};