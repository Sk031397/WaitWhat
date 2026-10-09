import React from 'react';
import { createStackNavigator } from '@amazon-devices/react-navigation__stack';
import { NavigationContainer } from '@amazon-devices/react-navigation__native';
import { HomeScreen } from '@sidekick/screens/HomeScreen';
import { PlayerScreen } from '@sidekick/screens/PlayerScreen';
import { RootStackParamList } from '@sidekick/navigation/types';

/**
 * SideKick app shell.
 *
 * A simple two-screen stack (NO drawer):
 *   Home   — landing page: hero header + horizontal thumbnail rows
 *   Player — full-screen video with the slide-out SideKick companion
 *
 * `enableScreens` / `enableFreeze` are performance optimizations from
 * react-native-screens. That package isn't in the OS 1.2 profile, so we load
 * it defensively — the app works without it.
 */
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const screens = require('@amazon-devices/react-native-screens');
  screens.enableScreens?.();
  screens.enableFreeze?.();
} catch {
  // react-native-screens not available on this OS profile — safe to skip.
}

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Player" component={PlayerScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export { App };
export default App;
