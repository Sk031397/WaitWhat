import React from 'react';
import {View, StyleSheet} from 'react-native';
import {GradientScrim} from './GradientScrim';

/**
 * Vignette — subtle cinematic edge-darkening laid over the whole screen.
 *
 * Darkens the top, bottom, and sides slightly so bright content doesn't bleed
 * to the bezel and the UI feels composed/filmic. Pure Views (reuses
 * GradientScrim), no dependencies, non-interactive.
 */
export const Vignette: React.FC = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <GradientScrim
      color="#05060A"
      direction="to-top"
      intensity={0.5}
      bands={8}
      style={styles.bottom}
    />
    <GradientScrim
      color="#05060A"
      direction="to-bottom"
      intensity={0.35}
      bands={6}
      style={styles.top}
    />
    <GradientScrim
      color="#05060A"
      direction="to-right"
      intensity={0.3}
      bands={6}
      style={styles.left}
    />
    <GradientScrim
      color="#05060A"
      direction="to-left"
      intensity={0.3}
      bands={6}
      style={styles.right}
    />
  </View>
);

const styles = StyleSheet.create({
  top: {bottom: undefined, height: '22%'},
  bottom: {top: undefined, height: '26%'},
  left: {end: undefined, width: '14%'},
  right: {start: undefined, width: '14%'},
});
