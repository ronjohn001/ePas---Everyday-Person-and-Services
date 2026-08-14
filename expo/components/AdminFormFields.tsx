import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
}

/** Glass-surface text input with floating label. */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  style,
}: TextFieldProps) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textTertiary}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChangeNumber: (num: number) => void;
  prefix?: string;
  suffix?: string;
  style?: ViewStyle;
}

/** Glass-surface numeric input with optional prefix/suffix (e.g. NLe). */
export function NumberField({
  label,
  value,
  onChangeNumber,
  prefix,
  suffix,
  style,
}: NumberFieldProps) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.numberRow}>
        {prefix && <Text style={styles.affix}>{prefix}</Text>}
        <TextInput
          style={styles.numberInput}
          value={String(value)}
          onChangeText={(t) => {
            const num = parseFloat(t);
            if (!isNaN(num)) onChangeNumber(num);
            else if (t === '') onChangeNumber(0);
          }}
          keyboardType="numeric"
          placeholderTextColor={COLORS.textTertiary}
        />
        {suffix && <Text style={styles.affix}>{suffix}</Text>}
      </View>
    </View>
  );
}

const PALETTE = [
  '#00D9A3', '#4FC3F7', '#A78BFA', '#FF6B6B',
  '#FFB547', '#2ECC71', '#E91E8C', '#9B59B6',
  '#F39C12', '#E74C3C', '#3498DB', '#16A085',
  '#1A3C6E', '#D35400', '#F1C40F', '#D4AF37',
];

interface ColorPickerProps {
  label: string;
  value: string;
  onChangeColor: (color: string) => void;
  style?: ViewStyle;
}

/** Color swatch picker — select from preset palette + custom hex. */
export function ColorPicker({ label, value, onChangeColor, style }: ColorPickerProps) {
  const [customHex, setCustomHex] = useState(
    PALETTE.includes(value.toUpperCase()) ? '' : value,
  );

  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.swatchGrid}>
        {PALETTE.map((color) => {
          const selected = value.toUpperCase() === color.toUpperCase();
          return (
            <TouchableOpacity
              key={color}
              style={[
                styles.swatch,
                { backgroundColor: color },
                selected && styles.swatchSelected,
              ]}
              onPress={() => {
                onChangeColor(color);
                setCustomHex('');
              }}
            >
              {selected && (
                <Ionicons name="checkmark" size={14} color={COLORS.white} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.customColorRow}>
        <Text style={styles.customLabel}>Custom hex:</Text>
        <TextInput
          style={styles.customInput}
          value={customHex}
          onChangeText={(t) => {
            setCustomHex(t);
            if (/^#[0-9A-Fa-f]{6}$/.test(t)) {
              onChangeColor(t);
            }
          }}
          placeholder="#RRGGBB"
          placeholderTextColor={COLORS.textTertiary}
        />
        <View style={[styles.preview, { backgroundColor: value }]} />
      </View>
    </View>
  );
}

const ICON_OPTIONS = [
  'home', 'construct', 'car', 'flash', 'water', 'airplane',
  'heart', 'cut', 'medkit', 'brush', 'sunny', 'sparkles',
  'hammer', 'key', 'flame', 'cube', 'grid', 'build',
  'bicycle', 'settings', 'snow', 'refresh', 'notifications',
  'hand-right', 'person', 'star', 'ribbon', 'shield-checkmark',
  'leaf', 'restaurant', 'cafe', 'cart', 'paw', 'globe',
];

interface IconPickerProps {
  label: string;
  value: string;
  onChangeIcon: (icon: string) => void;
}

/** Icon picker — scrollable grid of Ionicons names. */
export function IconPicker({ label, value, onChangeIcon }: IconPickerProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.iconGrid}>
        {ICON_OPTIONS.map((icon) => {
          const selected = value === icon;
          return (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconCell,
                selected && styles.iconCellSelected,
              ]}
              onPress={() => onChangeIcon(icon)}
            >
              <Ionicons
                name={icon as any}
                size={20}
                color={selected ? COLORS.accent : COLORS.textSecondary}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: SPACING.sm,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  numberInput: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  affix: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: COLORS.white,
  },
  customColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  customLabel: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  customInput: {
    flex: 1,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
  },
  preview: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  iconCell: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCellSelected: {
    backgroundColor: 'rgba(0,217,163,0.15)',
    borderColor: COLORS.accent,
  },
});
