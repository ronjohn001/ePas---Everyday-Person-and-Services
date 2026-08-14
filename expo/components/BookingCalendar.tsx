import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { StatusBadge } from '@/components/StatusBadge';
import type { Booking } from '@/types';

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
const ACTIVE_STATUSES: Booking['status'][] = ['REQUESTED', 'ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS'];

export interface BookingCalendarProps {
  bookings: Booking[];
  accent: string;
  /** Which side of the booking the viewer is on — decides which counterpart name to show. */
  viewerRole: 'CUSTOMER' | 'PROVIDER';
}

interface DayCell {
  key: string;
  day: number;
  inMonth: boolean;
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dotColorFor(status: Booking['status'], accent: string): string {
  if (ACTIVE_STATUSES.includes(status)) return accent;
  if (status === 'COMPLETED') return COLORS.textTertiary;
  return COLORS.error;
}

/**
 * Personal month calendar of bookings. Days with bookings show status dots;
 * selecting a day lists each booking's time, service, counterpart and note.
 */
export function BookingCalendar({ bookings, accent, viewerRole }: BookingCalendarProps) {
  const todayKey = dayKey(new Date());
  const [cursor, setCursor] = useState<{ year: number; month: number }>(() => {
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() };
  });
  const [selectedKey, setSelectedKey] = useState<string>(todayKey);

  const byDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const d = new Date(b.scheduledDate);
      if (Number.isNaN(d.getTime())) continue;
      const k = dayKey(d);
      const list = map.get(k);
      if (list) {
        list.push(b);
      } else {
        map.set(k, [b]);
      }
    }
    return map;
  }, [bookings]);

  const cells = useMemo<DayCell[]>(() => {
    const { year, month } = cursor;
    const mondayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    const start = new Date(year, month, 1 - mondayOffset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      return { key: dayKey(d), day: d.getDate(), inMonth: d.getMonth() === month };
    });
  }, [cursor]);

  const monthCount = useMemo(
    () => cells.reduce((sum, c) => (c.inMonth ? sum + (byDay.get(c.key)?.length ?? 0) : sum), 0),
    [cells, byDay],
  );

  const selectedBookings = useMemo(
    () =>
      (byDay.get(selectedKey) ?? [])
        .slice()
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()),
    [byDay, selectedKey],
  );

  const selectedDate = useMemo(() => {
    const [y, m, d] = selectedKey.split('-').map(Number);
    return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  }, [selectedKey]);

  const shiftMonth = (delta: number) => {
    setCursor((c) => {
      const next = new Date(c.year, c.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  const jumpToday = () => {
    const n = new Date();
    setCursor({ year: n.getFullYear(), month: n.getMonth() });
    setSelectedKey(dayKey(n));
  };

  const monthTitle = new Date(cursor.year, cursor.month, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.card}>
      {/* Month navigation */}
      <View style={styles.monthRow}>
        <TouchableOpacity style={styles.navBtn} onPress={() => shiftMonth(-1)} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.monthTitleWrap} onPress={jumpToday} activeOpacity={0.7}>
          <Text style={styles.monthTitle}>{monthTitle}</Text>
          {monthCount > 0 && (
            <Text style={[styles.monthCount, { color: accent }]}>
              {monthCount} booking{monthCount === 1 ? '' : 's'}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => shiftMonth(1)} activeOpacity={0.7}>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Weekday header */}
      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((w, i) => (
          <Text key={`${w}-${i}`} style={styles.weekLabel}>
            {w}
          </Text>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.grid}>
        {cells.map((cell) => {
          const dayBookings = byDay.get(cell.key);
          const isSelected = cell.key === selectedKey;
          const isToday = cell.key === todayKey;
          return (
            <TouchableOpacity
              key={cell.key}
              style={styles.dayCell}
              onPress={() => setSelectedKey(cell.key)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.dayInner,
                  isSelected && { backgroundColor: accent, borderColor: accent },
                  !isSelected && isToday && { borderColor: `${accent}80` },
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    !cell.inMonth && styles.dayNumberMuted,
                    isToday && !isSelected && { color: accent },
                    isSelected && styles.dayNumberSelected,
                  ]}
                >
                  {cell.day}
                </Text>
                <View style={styles.dotsRow}>
                  {(dayBookings ?? []).slice(0, 3).map((b) => (
                    <View
                      key={b.id}
                      style={[
                        styles.dot,
                        { backgroundColor: isSelected ? COLORS.textInverse : dotColorFor(b.status, accent) },
                      ]}
                    />
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected day detail */}
      <View style={styles.dayHeader}>
        <Text style={styles.dayHeaderTitle}>
          {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        {selectedBookings.length > 0 && (
          <View style={[styles.dayCountPill, { backgroundColor: `${accent}18`, borderColor: `${accent}35` }]}>
            <Text style={[styles.dayCountText, { color: accent }]}>{selectedBookings.length}</Text>
          </View>
        )}
      </View>

      {selectedBookings.length === 0 ? (
        <View style={styles.emptyDay}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.textTertiary} />
          <Text style={styles.emptyDayText}>No bookings on this day</Text>
        </View>
      ) : (
        <View style={styles.dayList}>
          {selectedBookings.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={styles.entryCard}
              activeOpacity={0.75}
              onPress={() => router.push(`/booking/${b.id}`)}
            >
              <View style={[styles.timeChip, { backgroundColor: `${accent}12`, borderColor: `${accent}30` }]}>
                <Ionicons name="time-outline" size={11} color={accent} />
                <Text style={[styles.timeText, { color: accent }]}>
                  {new Date(b.scheduledDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.entryBody}>
                <View style={styles.entryTop}>
                  <View
                    style={[
                      styles.entryIcon,
                      { backgroundColor: `${b.serviceJobColor}20`, borderColor: `${b.serviceJobColor}40` },
                    ]}
                  >
                    <Ionicons name={b.serviceJobIcon as never} size={14} color={b.serviceJobColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.entryService} numberOfLines={1}>
                      {b.serviceJobName}
                    </Text>
                    <Text style={styles.entryPerson} numberOfLines={1}>
                      {viewerRole === 'PROVIDER' ? b.customerName : b.providerName}
                    </Text>
                  </View>
                  <StatusBadge status={b.status} />
                </View>
                {!!b.notes && (
                  <View style={styles.noteRow}>
                    <Ionicons name="document-text-outline" size={12} color={COLORS.textTertiary} />
                    <Text style={styles.noteText} numberOfLines={2}>
                      {b.notes}
                    </Text>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={14} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.md,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  monthTitleWrap: { alignItems: 'center' },
  monthTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  monthCount: { fontSize: 10, fontWeight: '700', marginTop: 1 },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekLabel: {
    width: '14.2857%' as const,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%' as const,
    padding: 1.5,
  },
  dayInner: {
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayNumber: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  dayNumberMuted: { color: COLORS.textTertiary, opacity: 0.45 },
  dayNumberSelected: { color: COLORS.textInverse, fontWeight: '800' },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    height: 5,
    marginTop: 2,
    alignItems: 'center',
  },
  dot: { width: 4, height: 4, borderRadius: 2 },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  dayHeaderTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  dayCountPill: {
    minWidth: 22,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  dayCountText: { fontSize: 10, fontWeight: '800' },
  emptyDay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  emptyDayText: { fontSize: 12, color: COLORS.textTertiary },
  dayList: { marginTop: SPACING.sm, gap: SPACING.sm },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.sm,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeText: { fontSize: 11, fontWeight: '800' },
  entryBody: { flex: 1, gap: 6 },
  entryTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  entryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  entryService: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  entryPerson: { fontSize: 11, color: COLORS.textTertiary, marginTop: 1 },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    paddingLeft: 2,
  },
  noteText: { flex: 1, fontSize: 11, color: COLORS.textSecondary, lineHeight: 15 },
});
