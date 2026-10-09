import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatCard as StatCardData } from '@sidekick/data/types';
import { theme } from '@sidekick/theme';

/**
 * StatCard — renders a structured sports answer in the overlay. Big,
 * glanceable numbers tuned for 10-foot viewing.
 */
export const StatCard: React.FC<{ data: StatCardData }> = ({ data }) => (
  <View style={styles.card}>
    <Text style={styles.heading} numberOfLines={2}>
      {data.heading}
    </Text>
    {data.subheading ? <Text style={styles.subheading}>{data.subheading}</Text> : null}
    <View style={styles.rows}>
      {data.rows.map((row, i) => (
        <View key={`${row.label}-${i}`} style={styles.row}>
          <Text style={styles.rowLabel} numberOfLines={1}>
            {row.label}
          </Text>
          <Text style={[styles.rowValue, row.highlight && styles.rowValueHighlight]}>
            {row.value}
          </Text>
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
    borderLeftWidth: theme.spacing.xs / 2,
    borderLeftColor: theme.colors.sports,
    marginTop: theme.spacing.sm,
  },
  heading: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.title,
    fontWeight: '700',
  },
  subheading: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.caption,
    marginTop: theme.spacing.xs / 2,
    marginBottom: theme.spacing.sm,
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
    marginRight: theme.spacing.sm,
  },
  rowValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.body,
    fontWeight: '700',
  },
  rowValueHighlight: { color: theme.colors.sports },
});
