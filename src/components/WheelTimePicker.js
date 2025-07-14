// src/components/WheelTimePicker.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

const WheelTimePicker = ({ time, onTimeChange, showSeconds = true }) => {
  // 解析初始时间
  const parseTime = (timeString) => {
    if (!timeString) return { hours: '10', minutes: '00', seconds: '00' };
    const parts = timeString.split(':');
    return {
      hours: parts[0] || '10',
      minutes: parts[1] || '00',
      seconds: parts[2] || '00'
    };
  };

  const { hours: initialHours, minutes: initialMinutes, seconds: initialSeconds } = parseTime(time);
  
  const [selectedHours, setSelectedHours] = useState(initialHours);
  const [selectedMinutes, setSelectedMinutes] = useState(initialMinutes);
  const [selectedSeconds, setSelectedSeconds] = useState(initialSeconds);

  // 生成选项数组
  const generateOptions = (max) => {
    return Array.from({ length: max }, (_, i) => 
      i.toString().padStart(2, '0')
    );
  };

  const hourOptions = generateOptions(24); // 0-23
  const minuteOptions = generateOptions(60); // 0-59
  const secondOptions = generateOptions(60); // 0-59

  // 更新时间
  useEffect(() => {
    const timeString = showSeconds 
      ? `${selectedHours}:${selectedMinutes}:${selectedSeconds}`
      : `${selectedHours}:${selectedMinutes}:00`;
    onTimeChange(timeString);
  }, [selectedHours, selectedMinutes, selectedSeconds, showSeconds]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Time</Text>
      
      <View style={styles.pickerContainer}>
        {/* 小时选择器 */}
        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Hour</Text>
          <Picker
            selectedValue={selectedHours}
            onValueChange={setSelectedHours}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {hourOptions.map(hour => (
              <Picker.Item key={hour} label={hour} value={hour} />
            ))}
          </Picker>
        </View>

        {/* 分钟选择器 */}
        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Minute</Text>
          <Picker
            selectedValue={selectedMinutes}
            onValueChange={setSelectedMinutes}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {minuteOptions.map(minute => (
              <Picker.Item key={minute} label={minute} value={minute} />
            ))}
          </Picker>
        </View>

        {/* 秒选择器 */}
        {showSeconds && (
          <View style={styles.pickerWrapper}>
            <Text style={styles.pickerLabel}>Second</Text>
            <Picker
              selectedValue={selectedSeconds}
              onValueChange={setSelectedSeconds}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {secondOptions.map(second => (
                <Picker.Item key={second} label={second} value={second} />
              ))}
            </Picker>
          </View>
        )}
      </View>

      {/* 预览 */}
      <View style={styles.previewContainer}>
        <Text style={styles.previewLabel}>Preview:</Text>
        <Text style={styles.previewTime}>
          {selectedHours}:{selectedMinutes}{showSeconds ? `:${selectedSeconds}` : ''}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 5,
  },
  picker: {
    height: 120,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  pickerItem: {
    fontSize: 18,
    height: 120,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 10,
  },
  previewTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4f46e5',
    fontFamily: 'monospace',
  },
});

export default WheelTimePicker;