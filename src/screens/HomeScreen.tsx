import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { CATALOG, CATALOG_ROWS, itemsForRow, getCatalogItem } from '@sidekick/data/catalog';
import { CatalogItem } from '@sidekick/data/types';
import { FocusableCard } from '@sidekick/components/FocusableCard';
import { GradientScrim } from '@sidekick/components/GradientScrim';
import { theme } from '@sidekick/theme';

/**
 * HomeScreen — the landing page.
 *
 * Layout mirrors the AmazonAppDev multi-tv-app-sample (minus the drawer):
 *   • a tall hero header whose background + title update to the focused card
 *   • horizontal scrolling rows of thumbnail cards
 *
 * Selecting a card navigates to the Player, where the SideKick overlay lives.
 */
export const HomeScreen = ({ navigation }: { navigation: any }) => {
  const rows = useMemo(() => CATALOG_ROWS(), []);
  const [focusedId, setFocusedId] = useState<string>(CATALOG[0]?.id ?? '');
  const focused: CatalogItem | undefined = getCatalogItem(focusedId);

  // Hero cross-fade: fade the text block out/in when the focused item changes
  // so the hero doesn't hard-cut as you move across cards.
  const heroFade = useRef(new Animated.Value(1)).current;
  const prevId = useRef(focusedId);
  useEffect(() => {
    if (prevId.current === focusedId) return;
    prevId.current = focusedId;
    heroFade.setValue(0);
    Animated.timing(heroFade, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [focusedId, heroFade]);

  const openPlayer = useCallback(
    (item: CatalogItem) => navigation.navigate('Player', { itemId: item.id }),
    [navigation],
  );

  return (
    <View style={styles.container}>
      {/* ---- Hero header (driven by focused card) ---- */}
      <View style={styles.hero}>
        <Animated.View style={[styles.heroImageWrap, { opacity: heroFade }]}>
          {focused?.headerImage ? (
            <Image source={{ uri: focused.headerImage }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroFallback]} />
          )}
        </Animated.View>

        {/* Smooth left→right + bottom scrims (dependency-free gradient) */}
        <GradientScrim
          color="#0B0C10"
          direction="to-left"
          intensity={0.96}
          bands={14}
          style={styles.heroScrimH}
        />
        <GradientScrim
          color="#0B0C10"
          direction="to-top"
          intensity={0.9}
          bands={10}
        />

        <Animated.View style={[styles.heroText, { opacity: heroFade }]}>
          <Text style={styles.brand}>SIDEKICK</Text>
          {focused ? (
            <>
              <Text style={styles.heroTitle} numberOfLines={2}>
                {focused.title}
              </Text>
              <Text style={styles.heroMeta}>
                {[
                  focused.rating,
                  focused.releaseYear ? String(focused.releaseYear) : null,
                  focused.genres?.join('  ·  '),
                ]
                  .filter(Boolean)
                  .join('     ')}
              </Text>
              <Text style={styles.heroDesc} numberOfLines={3}>
                {focused.synopsis}
              </Text>
            </>
          ) : null}
        </Animated.View>
      </View>

      {/* ---- Content rows ---- */}
      <ScrollView
        style={styles.rowsScroll}
        contentContainerStyle={styles.rowsContent}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((rowTitle, rowIndex) => {
          const items = itemsForRow(rowTitle);
          return (
            <View key={rowTitle} style={styles.row}>
              <Text style={styles.rowTitle}>{rowTitle}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.rowList}
              >
                {items.map((item, i) => (
                  <FocusableCard
                    key={item.id}
                    item={item}
                    hasTVPreferredFocus={rowIndex === 0 && i === 0}
                    onFocus={() => setFocusedId(item.id)}
                    onPress={() => openPlayer(item)}
                  />
                ))}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  hero: { width: '100%', height: theme.heroHeight, position: 'relative' },
  heroImageWrap: { ...StyleSheet.absoluteFillObject },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroFallback: { backgroundColor: theme.colors.cardElevated },
  heroScrimH: { width: '75%' },
  heroText: {
    position: 'absolute',
    start: theme.safeZones.horizontal,
    top: theme.safeZones.vertical,
    bottom: theme.safeZones.vertical,
    width: '55%',
    justifyContent: 'center',
  },
  brand: {
    color: theme.colors.primary,
    fontSize: theme.font.caption,
    fontWeight: theme.weight.black,
    letterSpacing: theme.tracking.wider,
    marginBottom: theme.spacing.md,
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.hero,
    fontWeight: theme.weight.bold,
    letterSpacing: theme.tracking.tight,
    marginBottom: theme.spacing.md,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 16,
  },
  heroMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.caption,
    fontWeight: theme.weight.semibold,
    letterSpacing: theme.tracking.wide,
    marginBottom: theme.spacing.md,
  },
  heroDesc: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.body,
    fontWeight: theme.weight.regular,
    lineHeight: theme.font.body * 1.45,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 8,
  },

  rowsScroll: {
    flex: 1,
    marginTop: -theme.spacing.xl, // pull rows up over the hero bottom
  },
  rowsContent: { paddingBottom: theme.safeZones.vertical },
  row: { marginBottom: theme.spacing.md },
  rowTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.title,
    fontWeight: theme.weight.bold,
    letterSpacing: theme.tracking.tight,
    marginStart: theme.safeZones.horizontal,
    marginBottom: theme.spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowRadius: 8,
  },
  rowList: {
    paddingStart: theme.safeZones.horizontal,
    paddingEnd: theme.safeZones.horizontal,
    paddingVertical: theme.spacing.sm,
  },
});
