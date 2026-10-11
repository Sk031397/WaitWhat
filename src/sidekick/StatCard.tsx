import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatCard as StatCardData } from '@sidekick/data/types';
import { theme } from '@sidekick/theme';

/**
 * StatCard — a structured sports answer tuned for 10-foot viewing.
 *
 * Craft details: an accent header strip, big glanceable numbers, and the
 * standout (highlighted) stat gets a chip + a subtle fill bar so the eye lands
 * on it instantly.
 */
export const StatCard: React.FC<{ data: StatCardData }> = ({ data }) => (
  <View style={styles.card}>
    {/* Accent header strip */}
    <View style={styles.headerStrip}>
      <View style={styles.accentBar} />
      <View style={styles.headerText}>
        <Text style={styles.heading} numberOfLines={2}>
          {data.heading}
        </Text>
        {data.subheading ? <Text style={styles.subheading}>{data.subheading}</Text> : null}
      </View>
    </View>

    <View style={styles.rows}>
      {data.rows.map((row, i) => (
        <View key={`${row.label}-${i}`} style={styles.row}>
          <Text style={styles.rowLabel} numberOfLines={1}>
            {row.label}
          </Text>
          <View style={styles.valueWrap}>
            {row.highlight ? (
              <View style={styles.standoutChip}>
                <Text style={styles.standoutChipText}>▲ season high</Text>
              </View>
            ) : null}
            <Text style={[styles.rowValue, row.highlight && styles.rowValueHighlight]}>
              {row.value}
            </Text>
          </View>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceSolid,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    overflow: 'hidden',
  },
  headerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  accentBar: {
    width: theme.spacing.xs / 1.5,
    alignSelf: 'stretch',
    minHeight: theme.spacing.lg,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.sports,
    marginEnd: theme.spacing.sm,
  },
  headerText: { flex: 1 },
  heading: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.title,
    fontWeight: theme.weight.bold,
    letterSpacing: theme.tracking.tight,
  },
  subheading: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.caption,
    marginTop: theme.spacing.xs / 2,
    letterSpacing: theme.tracking.wide,
  },
  rows: { marginTop: theme.spacing.xs },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  rowLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.body,
    flexShrink: 1,
    marginEnd: theme.spacing.sm,
  },
  valueWrap: { flexDirection: 'row', alignItems: 'center' },
  standoutChip: {
    backgroundColor: 'rgba(124,230,91,0.16)',
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    marginEnd: theme.spacing.sm,
  },
  standoutChipText: {
    color: theme.colors.sports,
    fontSize: theme.font.caption,
    fontWeight: theme.weight.bold,
  },
  rowValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.body,
    fontWeight: theme.weight.bold,
    minWidth: theme.spacing.xl,
    textAlign: 'right',
  },
  rowValueHighlight: { color: theme.colors.sports },
});
