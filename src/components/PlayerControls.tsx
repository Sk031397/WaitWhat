import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '@sidekick/theme';
import { formatTime as fmt } from '@sidekick/util/formatTime';
import { AskMarker } from '@sidekick/data/types';

interface PlayerControlsProps {
  visible: boolean;
  paused: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeekBack: () => void;
  onSeekForward: () => void;
  /** Timeline markers where the user asked SideKick something. */
  markers?: AskMarker[];
}

/**
 * PlayerControls — a transport bar pinned to the bottom of the player.
 *
 * Scheme (Option A): the center Play/Pause button holds initial focus, so the
 * remote Select button toggles playback. Left/Right focusable buttons seek
 * ±10s. The bar auto-hides (parent controls `visible`) and reappears on key
 * press. Focus rings use border + scale (accessibility), not color alone.
 */
export const PlayerControls: React.FC<PlayerControlsProps> = ({
  visible,
  paused,
  currentTime,
  duration,
  onPlayPause,
  onSeekBack,
  onSeekForward,
  markers = [],
}) => {
  if (!visible) return null;
  const pct = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      {/* Seek bar */}
      <View style={styles.seekRow}>
        <Text style={styles.time}>{fmt(currentTime)}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct * 100}%` }]} />
          {/* Ask markers — where the user asked SideKick (timeline-anchored) */}
          {duration > 0 &&
            markers.map((mk) => {
              const left = Math.min(100, Math.max(0, (mk.positionSeconds / duration) * 100));
              return (
                <View
                  key={mk.id}
                  style={[
                    styles.marker,
                    {
                      left: `${left}%`,
                      backgroundColor:
                        mk.mode === 'sports' ? theme.colors.sports : theme.colors.primary,
                    },
                  ]}
                />
              );
            })}
          <View style={[styles.knob, { left: `${pct * 100}%` }]} />
        </View>
        <Text style={styles.time}>{fmt(duration)}</Text>
      </View>

      {/* Transport buttons */}
      <View style={styles.buttons}>
        <ControlButton label="« 10s" onPress={onSeekBack} />
        <ControlButton
          label={paused ? '► Play' : '❚❚ Pause'}
          onPress={onPlayPause}
          primary
          hasTVPreferredFocus
        />
        <ControlButton label="10s »" onPress={onSeekForward} />
      </View>
    </View>
  );
};

const ControlButton: React.FC<{
  label: string;
  onPress: () => void;
  primary?: boolean;
  hasTVPreferredFocus?: boolean;
}> = ({ label, onPress, primary, hasTVPreferredFocus }) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <Pressable
      hasTVPreferredFocus={hasTVPreferredFocus}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.btn,
        primary && styles.btnPrimary,
        focused && styles.btnFocused,
      ]}
    >
      <Text style={[styles.btnText, primary && styles.btnTextPrimary]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.safeZones.horizontal,
    paddingBottom: theme.safeZones.vertical,
    paddingTop: theme.spacing.xl,
    // dark gradient-ish scrim so controls read over bright video
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  seekRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
  time: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.caption,
    width: theme.spacing.xl * 1.4,
    textAlign: 'center',
  },
  track: {
    flex: 1,
    height: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: theme.spacing.sm,
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  knob: {
    position: 'absolute',
    width: theme.spacing.sm,
    height: theme.spacing.sm,
    borderRadius: theme.spacing.sm / 2,
    marginLeft: -(theme.spacing.sm / 2),
    backgroundColor: theme.colors.textPrimary,
  },
  marker: {
    position: 'absolute',
    top: -(theme.spacing.xs / 2),
    width: theme.spacing.xs / 1.5,
    height: theme.spacing.sm * 1.4,
    borderRadius: 2,
    marginLeft: -(theme.spacing.xs / 3),
  },
  buttons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    marginHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    borderColor: theme.colors.textSecondary,
    backgroundColor: theme.colors.surface,
  },
  btnPrimary: { borderColor: theme.colors.primary },
  btnFocused: {
    borderColor: theme.colors.focusBorder,
    borderWidth: 4,
    transform: [{ scale: 1.08 }],
  },
  btnText: { color: theme.colors.textPrimary, fontSize: theme.font.body, fontWeight: '600' },
  btnTextPrimary: { color: theme.colors.primary, fontWeight: '800' },
});
