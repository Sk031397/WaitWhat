import React, { useRef, useState } from 'react';
import { Pressable, View, Text, Image, StyleSheet, Animated } from 'react-native';
import { CatalogItem } from '@sidekick/data/types';
import { theme } from '@sidekick/theme';

/**
 * FocusableCard — a thumbnail tile for the home grid.
 *
 * Focus is animated: the card eases up in scale with a soft spring and a
 * brightening border, instead of snapping. This is the single biggest "modern
 * feel" upgrade for a 10-foot grid. Focus still uses a physical change
 * (border + scale), not color alone, per Vega accessibility guidance.
 */
interface FocusableCardProps {
  item: CatalogItem;
  onPress: () => void;
  onFocus?: () => void;
  hasTVPreferredFocus?: boolean;
}

export const FocusableCard: React.FC<FocusableCardProps> = ({
  item,
  onPress,
  onFocus,
  hasTVPreferredFocus,
}) => {
  const [focused, setFocused] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const isSports = item.contentType === 'sports';

  const animateTo = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        hasTVPreferredFocus={hasTVPreferredFocus}
        onPress={onPress}
        onFocus={() => {
          setFocused(true);
          animateTo(1.1);
          onFocus?.();
        }}
        onBlur={() => {
          setFocused(false);
          animateTo(1);
        }}
        style={[styles.card, focused && styles.cardFocused]}
      >
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.image} />
        ) : (
          <View style={styles.placeholder} />
        )}

        {/* Rating / LIVE pill */}
        {item.rating ? (
          <View style={[styles.pill, isSports && styles.pillSports]}>
            <Text style={styles.pillText}>{item.rating}</Text>
          </View>
        ) : null}

        {/* Bottom scrim with the title */}
        <View style={styles.scrim}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: theme.card.width,
    height: theme.card.height,
    marginEnd: theme.card.gap,
    borderRadius: theme.card.radius,
    borderWidth: 5,
    borderColor: 'transparent',
    backgroundColor: theme.colors.card,
    overflow: 'hidden',
  },
  cardFocused: {
    borderColor: theme.colors.focusBorder,
    borderWidth: 6,
    shadowColor: theme.colors.focus,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 15,
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.cardElevated,
  },
  pill: {
    position: 'absolute',
    top: theme.spacing.xs,
    end: theme.spacing.xs,
    backgroundColor: theme.colors.scrimDark,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs / 2,
  },
  pillSports: { backgroundColor: theme.colors.sports },
  pillText: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.caption,
    fontWeight: '700',
  },
  scrim: {
    position: 'absolute',
    bottom: 0,
    start: 0,
    end: 0,
    backgroundColor: theme.colors.scrimDark,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.caption,
    fontWeight: '600',
  },
});
