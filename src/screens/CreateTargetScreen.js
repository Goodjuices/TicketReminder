// src/screens/CreateTargetScreen.js
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,          
  ScrollView,
  Alert,
  Switch,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { useTargets } from '../context/TargetContext';


const { width } = Dimensions.get('window');

// 日历组件
const CalendarPicker = ({ selectedDate, onDateSelect, visible, onClose, disablePastDates = false }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const isPastDate = (date) => {
    if (!disablePastDates) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  
  // 获取当前月份的日期数组
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // 添加上个月的空白日期
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, 0 - (startingDayOfWeek - 1 - i));
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // 添加当前月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // 添加下个月的日期以填满6行
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const formatMonth = (date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const isDateSelected = (date) => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    return date.toDateString() === selected.toDateString();
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

const handleDateSelect = (dateObj) => {
  if (!dateObj.isCurrentMonth) return;
  if (isPastDate(dateObj.date)) return;
  
  // 使用本地日期而不是 UTC
  const year = dateObj.date.getFullYear();
  const month = String(dateObj.date.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.date.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  onDateSelect(dateString);
  onClose();
};

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={calendarStyles.calendarOverlay}>
        <View style={calendarStyles.calendarContainer}>
          {/* 日历头部 */}
          <View style={calendarStyles.calendarHeader}>
            <TouchableOpacity onPress={goToPreviousMonth} style={calendarStyles.monthNavButton}>
              <Text style={calendarStyles.monthNavText}>◀</Text>
            </TouchableOpacity>
            <Text style={calendarStyles.monthTitle}>{formatMonth(currentMonth)}</Text>
            <TouchableOpacity onPress={goToNextMonth} style={calendarStyles.monthNavButton}>
              <Text style={calendarStyles.monthNavText}>▶</Text>
            </TouchableOpacity>
          </View>

          {/* 星期标题 */}
          <View style={calendarStyles.weekDaysRow}>
            {weekDays.map(day => (
              <View key={day} style={calendarStyles.weekDayCell}>
                <Text style={calendarStyles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* 日期网格 */}
          <View style={calendarStyles.daysGrid}>
            {days.map((dayObj, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  calendarStyles.dayCell,
                  !dayObj.isCurrentMonth && calendarStyles.dayCellInactive,
                  isDateSelected(dayObj.date) && calendarStyles.dayCellSelected,
                  isPastDate(dayObj.date) && calendarStyles.dayCellDisabled
                ]}
                onPress={() => handleDateSelect(dayObj)}
                disabled={!dayObj.isCurrentMonth || isPastDate(dayObj.date)}
              >
                <Text style={[
                  calendarStyles.dayText,
                  !dayObj.isCurrentMonth && calendarStyles.dayTextInactive,
                  isDateSelected(dayObj.date) && calendarStyles.dayTextSelected,
                  isPastDate(dayObj.date) && calendarStyles.dayTextDisabled
                ]}>
                  {dayObj.date.getDate()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 底部按钮 */}
          <View style={calendarStyles.calendarActions}>
            <TouchableOpacity onPress={onClose} style={calendarStyles.calendarCancelButton}>
              <Text style={calendarStyles.calendarCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 时间选择器组件
const TimePicker = ({ time, onTimeChange, showSeconds = true, selectedDate }) => {
  const [hours, setHours] = useState(time?.split(':')[0] || '10');
  const [minutes, setMinutes] = useState(time?.split(':')[1] || '00');
  const [seconds, setSeconds] = useState(time?.split(':')[2] || '00');

  const isToday = () => {
    if (!selectedDate) return false;
    const today = new Date();
    const selected = new Date(selectedDate);
    return today.toDateString() === selected.toDateString();
  };

  const getCurrentTime = () => {
    const now = new Date();
    return {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds()
    };
  };

  const updateTime = (newHours, newMinutes, newSeconds) => {
    const timeString = showSeconds 
      ? `${newHours}:${newMinutes}:${newSeconds}`
      : `${newHours}:${newMinutes}:00`;
    onTimeChange(timeString);
  };

  const handleHoursChange = (value) => {
    if (value === '' || value.length < 2) {
      setHours(value);
      return;
    }
    
    const numValue = parseInt(value) || 0;
    const validHours = Math.max(0, Math.min(23, numValue)).toString().padStart(2, '0');
    
    if (isToday()) {
      const current = getCurrentTime();
      if (value.length === 2 && parseInt(validHours) < current.hours) {
        Alert.alert('Invalid Time', 'Cannot select past time for today');
        const currentHourStr = current.hours.toString().padStart(2, '0');
        setHours(currentHourStr);
        updateTime(currentHourStr, minutes, seconds);
        return;
      }
    }
    
    setHours(validHours);
    updateTime(validHours, minutes, seconds);
  };

  const handleMinutesChange = (value) => {
    if (value === '' || value.length < 2) {
      setMinutes(value);
      return;
    }
    
    const validMinutes = Math.max(0, Math.min(59, parseInt(value) || 0)).toString().padStart(2, '0');
    
    if (isToday()) {
      const current = getCurrentTime();
      const currentHours = parseInt(hours);
      
      if (value.length === 2 && currentHours === current.hours && parseInt(validMinutes) < current.minutes) {
        Alert.alert('Invalid Time', 'Cannot select past time for today');
        setMinutes(current.minutes.toString().padStart(2, '0'));
        updateTime(hours, current.minutes.toString().padStart(2, '0'), seconds);
        return;
      }
    }
    
    setMinutes(validMinutes);
    updateTime(hours, validMinutes, seconds);
  };

  const handleSecondsChange = (value) => {
    if (value === '' || value.length < 2) {
      setSeconds(value);
      return;
    }
    
    const validSeconds = Math.max(0, Math.min(59, parseInt(value) || 0)).toString().padStart(2, '0');
    
    if (isToday()) {
      const current = getCurrentTime();
      const currentHours = parseInt(hours);
      const currentMinutes = parseInt(minutes);
      
      if (value.length === 2 && 
          currentHours === current.hours && 
          currentMinutes === current.minutes && 
          parseInt(validSeconds) <= current.seconds) {
        Alert.alert('Invalid Time', 'Cannot select past time for today');
        setSeconds((current.seconds + 1).toString().padStart(2, '0'));
        updateTime(hours, minutes, (current.seconds + 1).toString().padStart(2, '0'));
        return;
      }
    }
    
    setSeconds(validSeconds);
    updateTime(hours, minutes, validSeconds);
  };

  return (
    <View style={timeStyles.timePickerContainer}>
      <Text style={timeStyles.timePickerLabel}>Exact time</Text>
      <View style={timeStyles.timeInputsRow}>
        <View style={timeStyles.timeInputGroup}>
          <TextInput
            style={timeStyles.timeInput}
            value={hours}
            onChangeText={handleHoursChange}
            keyboardType="numeric"
            maxLength={2}
            placeholder="10"
          />
          <Text style={timeStyles.timeInputLabel}>H</Text>
        </View>
        
        <Text style={timeStyles.timeSeparator}>:</Text>
        
        <View style={timeStyles.timeInputGroup}>
          <TextInput
            style={timeStyles.timeInput}
            value={minutes}
            onChangeText={handleMinutesChange}
            keyboardType="numeric"
            maxLength={2}
            placeholder="00"
          />
          <Text style={timeStyles.timeInputLabel}>M</Text>
        </View>
        
        {showSeconds && (
          <>
            <Text style={timeStyles.timeSeparator}>:</Text>
            <View style={timeStyles.timeInputGroup}>
              <TextInput
                style={timeStyles.timeInput}
                value={seconds}
                onChangeText={handleSecondsChange}
                keyboardType="numeric"
                maxLength={2}
                placeholder="00"
              />
              <Text style={timeStyles.timeInputLabel}>S</Text>
            </View>
          </>
        )}
      </View>
      
      <Text style={timeStyles.timeExample}>
        Preview: {hours}:{minutes}{showSeconds ? `:${seconds}` : ''} 
        {showSeconds && <Text style={timeStyles.precisionNote}> (Second precision)</Text>}
      </Text>
      {isToday() && (
        <Text style={timeStyles.timeWarning}>
          ⚠️ Only future times are available for today
        </Text>
      )}
    </View>
  );
};

// 主要的 CreateTargetScreen 组件
const CreateTargetScreen = ({ onNavigateBack, editingTarget }) => {
  const { addTarget, updateTarget } = useTargets();
  
  const isEditMode = !!editingTarget;
  
  const [targetType, setTargetType] = useState(editingTarget?.type || '');
  const [title, setTitle] = useState(editingTarget?.title || '');
  const [targetDate, setTargetDate] = useState(editingTarget?.date || '');
  const [targetTime, setTargetTime] = useState(editingTarget?.time || '10:00:00');
  const [reminderEnabled, setReminderEnabled] = useState(editingTarget?.reminderEnabled ?? true);
  const [reminderMinutes, setReminderMinutes] = useState(editingTarget?.reminderMinutes || 2);
  const [notes, setNotes] = useState(editingTarget?.notes || '');
  const [showCalendar, setShowCalendar] = useState(false);
  const [enableSeconds, setEnableSeconds] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return 'Select Date';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };


  const handleTimeChange = (newTime) => {
    setTargetTime(newTime);
  };

  const handleSave = () => {
    if (!targetType || !title || !targetDate) {
      Alert.alert('Required fields', 'Please fill in all required fields');
      return;
    }
    
    if (targetType === 'event' && !targetTime) {
      Alert.alert('Required fields', 'Event reminders need to be set for specific times');
      return;
    }
    
    const targetData = {
      type: targetType,
      title,
      date: targetDate,
      time: targetType === 'event' ? targetTime : null,
      reminderEnabled: targetType === 'event' ? reminderEnabled : false,
      reminderMinutes: targetType === 'event' ? reminderMinutes : null,
      notes,
    };
    
    if (isEditMode) {
      updateTarget(editingTarget.id, targetData);
      Alert.alert(
        'Updated successfully', 
        `Target "${title}" has been updated!`, 
        [{ text: 'OK', onPress: () => onNavigateBack() }]
      );
    } else {
      addTarget(targetData);
      Alert.alert(
        'Created successfully', 
        `Target "${title}" Created!`, 
        [{ text: 'Confirm', onPress: () => onNavigateBack() }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Target' : 'Create Target'}
        </Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {isEditMode ? 'Update' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEditMode ? 'Target Type' : 'Step 1: Choose Target Type'}
          </Text>
          {!isEditMode && (
            <Text style={styles.sectionSubtitle}>
              What kind of target do you want to create?
            </Text>
          )}
          
          <View style={styles.typeContainer}>
            <TouchableOpacity 
              style={[
                styles.typeCard, 
                targetType === 'event' && styles.typeCardSelected,
                isEditMode && styles.typeCardDisabled
              ]}
              onPress={() => !isEditMode && setTargetType('event')}
              disabled={isEditMode}
            >
              <Text style={styles.typeIcon}>⚡</Text>
              <Text style={styles.typeTitle}>Event Reminder</Text>
              <Text style={styles.typeDescription}>
                Get notified before important events
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.typeCard, 
                targetType === 'countdown' && styles.typeCardSelected,
                isEditMode && styles.typeCardDisabled
              ]}
              onPress={() => !isEditMode && setTargetType('countdown')}
              disabled={isEditMode}
            >
              <Text style={styles.typeIcon}>📅</Text>
              <Text style={styles.typeTitle}>Goal Countdown</Text>
              <Text style={styles.typeDescription}>
                Daily reminders of remaining days (9 AM)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {targetType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isEditMode ? 'Target Details' : 'Step 2: Target Details'}
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Title *</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter your target title..."
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Date *</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowCalendar(true)}
              >
                <Text style={[
                  styles.dateButtonText,
                  !targetDate && styles.dateButtonPlaceholder
                ]}>
                  {formatDate(targetDate)}
                </Text>
                <Text style={styles.dateButtonIcon}>📅</Text>
              </TouchableOpacity>
            </View>

            {targetType === 'event' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Target Time *</Text>
                  <View style={styles.timeContainer}>
                    <TimePicker
                      time={targetTime}
                      onTimeChange={handleTimeChange}
                      showSeconds={enableSeconds}
                      selectedDate={targetDate}
                    />
                    
                    <View style={styles.switchContainer}>
                      <Text style={styles.switchLabel}>Accurate to the second</Text>
                      <Switch
                        value={enableSeconds}
                        onValueChange={setEnableSeconds}
                        trackColor={{ false: '#e5e7eb', true: '#a5b4fc' }}
                        thumbColor={enableSeconds ? '#4f46e5' : '#9ca3af'}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Reminder Settings</Text>
                  
                  <View style={styles.reminderContainer}>
                    <View style={styles.reminderHeader}>
                      <Text style={styles.reminderTitle}>Enable Reminder</Text>
                      <Switch
                        value={reminderEnabled}
                        onValueChange={setReminderEnabled}
                        trackColor={{ false: '#e5e7eb', true: '#a5b4fc' }}
                        thumbColor={reminderEnabled ? '#4f46e5' : '#9ca3af'}
                      />
                    </View>

                    {reminderEnabled && (
                      <View style={styles.reminderOptions}>
                        <Text style={styles.reminderSubtitle}>Remind me before:</Text>
                        <View style={styles.reminderButtonsContainer}>
                          {[1, 2, 5, 10, 30, 60].map(minutes => (
                            <TouchableOpacity
                              key={minutes}
                              style={[
                                styles.reminderButton,
                                reminderMinutes === minutes && styles.reminderButtonSelected
                              ]}
                              onPress={() => setReminderMinutes(minutes)}
                            >
                              <Text style={[
                                styles.reminderButtonText,
                                reminderMinutes === minutes && styles.reminderButtonTextSelected
                              ]}>
                                {minutes} min{minutes !== 1 ? 's' : ''}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </>
            )}

            {targetType === 'countdown' && (
              <View style={styles.countdownInfo}>
                <Text style={styles.countdownTitle}>📱 Daily Reminder</Text>
                <Text style={styles.countdownDescription}>
                  You'll receive a daily notification at 9:00 AM showing how many days remain until your target date.
                </Text>
                <Text style={styles.countdownNote}>
                  • Reminders stop automatically when the date passes
                  • No reminder on the target date itself
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes..."
                placeholderTextColor="#9ca3af"
                multiline={true}
                numberOfLines={3}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {targetType && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.createButton} onPress={handleSave}>
            <Text style={styles.createButtonText}>
              {isEditMode ? 'Update Target' : 'Create Target'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 使用自定义的 CalendarPicker 替代 DatePicker */}
      <CalendarPicker
        selectedDate={targetDate}
        onDateSelect={(dateString) => {
          setTargetDate(dateString);
          setShowCalendar(false);
        }}
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        disablePastDates={true}
      />
    </SafeAreaView>
  );
};

// 所有样式
const calendarStyles = StyleSheet.create({
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    padding: 20,
    width: width - 40,
    maxHeight: '80%',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthNavText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: (width - 120) / 7,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  dayCellInactive: {
    opacity: 0.3,
  },
  dayCellSelected: {
    backgroundColor: '#4f46e5',
  },
  dayCellDisabled: {
    backgroundColor: '#f3f4f6',
    opacity: 0.5,
  },
  dayText: {
    fontSize: 16,
    color: '#1f2937',
  },
  dayTextInactive: {
    color: '#9ca3af',
  },
  dayTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  dayTextDisabled: {
    color: '#d1d5db',
  },
  calendarActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  calendarCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  calendarCancelText: {
    color: '#6b7280',
    fontWeight: '600',
  },
});

const timeStyles = StyleSheet.create({
  timePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  timeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  timeInputGroup: {
    alignItems: 'center',
  },
  timeInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timeInputLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b7280',
    marginHorizontal: 8,
  },
  timeExample: {
    fontSize: 14,
    color: '#4f46e5',
    textAlign: 'center',
    fontWeight: '500',
  },
  precisionNote: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  timeWarning: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#4f46e5',
    borderRadius: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  typeContainer: {
    marginBottom: 20,
  },
  typeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  typeCardSelected: {
    borderColor: '#4f46e5',
    backgroundColor: '#faf5ff',
  },
  typeCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#f9fafb',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  typeDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#1f2937',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  dateButtonPlaceholder: {
    color: '#9ca3af',
  },
  dateButtonIcon: {
    fontSize: 18,
  },
  timeContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  switchLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  reminderContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  reminderOptions: {
    marginTop: 16,
  },
  reminderSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  reminderButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reminderButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  reminderButtonSelected: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  reminderButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  reminderButtonTextSelected: {
    color: 'white',
  },
  countdownInfo: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  countdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  countdownDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  countdownNote: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  createButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateTargetScreen;