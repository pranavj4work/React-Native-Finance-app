import { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/theme/ThemeContext';
import { PressableScale } from '@/components/PressableScale';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function DatePickerField({ label, value, onChange }: Props) {
  const { colors, isDark } = useAppTheme();
  const [open, setOpen] = useState(false);

  const onPick = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setOpen(false);
    }
    if (event.type === 'dismissed') {
      setOpen(false);
      return;
    }
    if (date) {
      onChange(dayjs(date).format('YYYY-MM-DD'));
    }
  };

  return (
    <View>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <PressableScale
        onPress={() => setOpen(true)}
        style={[styles.field, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Ionicons name="calendar-outline" size={18} color={colors.primary} />
        <Text style={[styles.value, { color: colors.text }]}>
          {dayjs(value).format('ddd, D MMM YYYY')}
        </Text>
      </PressableScale>

      {Platform.OS === 'android' && open ? (
        <DateTimePicker
          value={dayjs(value).toDate()}
          mode="date"
          display="default"
          onChange={onPick}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="fade">
          <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
            <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
              <DateTimePicker
                value={dayjs(value).toDate()}
                mode="date"
                display="spinner"
                onChange={onPick}
                themeVariant={isDark ? 'dark' : 'light'}
              />
              <PressableScale
                onPress={() => setOpen(false)}
                style={[styles.done, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.doneText, { color: colors.onPrimary }]}>Done</Text>
              </PressableScale>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  value: { fontSize: 15, fontWeight: '600' },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, paddingBottom: 28 },
  done: { marginTop: 8, borderRadius: 14, alignItems: 'center', paddingVertical: 14 },
  doneText: { fontWeight: '700', fontSize: 16 },
});
