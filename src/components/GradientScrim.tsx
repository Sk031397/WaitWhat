import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

/**
 * GradientScrim — a smooth gradient fake, built from a stack of stepped-opacity
 * Views.
 *
 * Vega OS 1.2 has no linear-gradient package (verified: the
 * @amazon-devices/react-native-linear-gradient package is out of profile), so
 * we approximate one. Enough bands (default 12) read as a smooth gradient on a
 * 10-foot screen while using only plain Views — zero dependencies, no native
 * shadow/blur reliance.
 *
 * Opacity eases with easeInQuad so the dark end feels soft, not banded.
 */
type Direction = 'to-top' | 'to-bottom' | 'to-left' | 'to-right';

interface GradientScrimProps {
  /** Base color of the scrim (usually a near-black). */
  color?: string;
  /** Peak opacity at the solid end (0..1). */
  intensity?: number;
  /** Direction the scrim darkens toward. */
  direction?: Direction;
  /** Number of bands; more = smoother. */
  bands?: number;
  style?: StyleProp<ViewStyle>;
}

const toRgba = (hex: string, a: number): string => {
  // Accept #RRGGBB; fall back to black.
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return `rgba(8,9,13,${a})`;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
};

export const GradientScrim: React.FC<GradientScrimProps> = ({
  color = '#08090D',
  intensity = 0.92,
  direction = 'to-bottom',
  bands = 12,
  style,
}) => {
  const horizontal = direction === 'to-left' || direction === 'to-right';
  const reverse = direction === 'to-top' || direction === 'to-left';

  const segments = useMemo(() => {
    const arr: { a: number }[] = [];
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1); // 0..1 across bands
      // easeInQuad for a soft ramp into the solid end
      const eased = t * t;
      arr.push({ a: eased * intensity });
    }
    return reverse ? arr.reverse() : arr;
  }, [bands, intensity, reverse]);

  return (
    <View style={[styles.fill, style]} pointerEvents="none">
      <View style={horizontal ? styles.row : styles.col}>
        {segments.map((seg, i) => (
          <View
            key={i}
            style={[styles.band, { backgroundColor: toRgba(color, seg.a) }]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
  col: { flex: 1, flexDirection: 'column' },
  row: { flex: 1, flexDirection: 'row' },
  band: { flex: 1 },
});
