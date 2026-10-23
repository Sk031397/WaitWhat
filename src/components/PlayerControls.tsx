import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import {theme} from '@sidekick/theme';
import {formatTime as fmt} from '@sidekick/util/formatTime';
import {AskMarker} from '@sidekick/data/types';

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
  /** Select a marker to jump to that moment + re-surface its answer. */
  onSelectMarker?: (markerId: string) => void;
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
  onSelectMarker,
}) => {
  if (!visible) {
    return null;
  }
  const pct = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      {/* Seek bar */}
      <View style={styles.seekRow}>
        <Text style={styles.time}>{fmt(currentTime)}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, {width: `${pct * 100}%`}]} />
          {/* Ask markers — where the user asked SideKick (timeline-anchored) */}
          {duration > 0 &&
            markers.map((mk, i) => (
              <TimelineMarker
                key={mk.id}
                left={Math.min(
                  100,
                  Math.max(0, (mk.positionSeconds / duration) * 100),
                )}
                color={
                  mk.mode === 'sports'
                    ? theme.colors.sports
                    : theme.colors.primary
                }
                latest={i === markers.length - 1}
              />
            ))}
          <View style={[styles.knob, {left: `${pct * 100}%`}]} />
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

      {/* Navigable Q&A timeline — jump back to any question you asked */}
      {markers.length > 0 ? (
        <View style={styles.markerRow}>
          <Text style={styles.markerRowLabel}>Your questions:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {markers.map((mk) => (
              <MarkerChip
                key={mk.id}
                mk={mk}
                onPress={() => onSelectMarker?.(mk.id)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
};

const TimelineMarker: React.FC<{
  left: number;
  color: string;
  latest: boolean;
}> = ({left, color, latest}) => {
  const pulse = useRef(new Animated.Value(latest ? 0 : 1)).current;
  useEffect(() => {
    if (!latest) {
      pulse.setValue(1);
      return;
    }
    // A brief attention pulse when this becomes the latest marker, then settle.
    const loop = Animated.sequence([
      Animated.timing(pulse, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(pulse, {
        toValue: 0.45,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(pulse, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(pulse, {
        toValue: 0.6,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(pulse, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);
    loop.start();
    return () => loop.stop();
  }, [latest, pulse]);

  const scale = pulse.interpolate({
    inputRange: [0.45, 1],
    outputRange: [1, 1.6],
  });

  return (
    <>
      {latest ? (
        // Soft halo behind the latest marker
        <Animated.View
          pointerEvents="none"
          style={[
            styles.markerHalo,
            {
              left: `${left}%`,
              backgroundColor: color,
              opacity: pulse,
              transform: [{scale}],
            },
          ]}
        />
      ) : null}
      <View
        style={[styles.marker, {left: `${left}%`, backgroundColor: color}]}
      />
    </>
  );
};

const MarkerChip: React.FC<{mk: AskMarker; onPress: () => void}> = ({
  mk,
  onPress,
}) => {
  const [focused, setFocused] = React.useState(false);
  const accent =
    mk.mode === 'sports' ? theme.colors.sports : theme.colors.primary;
  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      accessibilityLabel={`Jump to ${fmt(mk.positionSeconds)}${
        mk.answer?.question ? `, ${mk.answer.question}` : ''
      }`}
      style={[
        styles.chip,
        {borderColor: accent},
        focused && styles.chipFocused,
      ]}>
      <View style={[styles.chipDot, {backgroundColor: accent}]} />
      <Text style={styles.chipText}>{fmt(mk.positionSeconds)}</Text>
    </Pressable>
  );
};

const ControlButton: React.FC<{
  label: string;
  onPress: () => void;
  primary?: boolean;
  hasTVPreferredFocus?: boolean;
}> = ({label, onPress, primary, hasTVPreferredFocus}) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <Pressable
      hasTVPreferredFocus={hasTVPreferredFocus}
      accessibilityRole="button"
      accessibilityLabel={label.replace(/[«»►❚]/g, '').trim()}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.btn,
        primary && styles.btnPrimary,
        focused && styles.btnFocused,
      ]}>
      <Text style={[styles.btnText, primary && styles.btnTextPrimary]}>
        {label}
      </Text>
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
  seekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
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
  markerHalo: {
    position: 'absolute',
    top: -(theme.spacing.sm / 2),
    width: theme.spacing.sm,
    height: theme.spacing.sm,
    borderRadius: theme.spacing.sm / 2,
    marginLeft: -(theme.spacing.sm / 2),
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    marginHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    borderColor: theme.colors.textSecondary,
    backgroundColor: theme.colors.surface,
  },
  btnPrimary: {borderColor: theme.colors.primary},
  btnFocused: {
    borderColor: theme.colors.focusBorder,
    borderWidth: 4,
    transform: [{scale: 1.08}],
  },
  btnText: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.body,
    fontWeight: '600',
  },
  btnTextPrimary: {color: theme.colors.primary, fontWeight: '800'},

  markerRow: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  markerRowLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.caption,
    marginEnd: theme.spacing.sm,
    letterSpacing: theme.tracking.wide,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    marginEnd: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  chipFocused: {
    borderColor: theme.colors.focusBorder,
    borderWidth: 4,
    transform: [{scale: 1.08}],
  },
  chipDot: {
    width: theme.spacing.xs,
    height: theme.spacing.xs,
    borderRadius: theme.spacing.xs / 2,
    marginEnd: theme.spacing.xs,
  },
  chipText: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.caption,
    fontWeight: '700',
  },
});
