import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SideKickMode } from '@sidekick/data/types';
import { theme } from '@sidekick/theme';

/**
 * QuestionInput — SideKick's voice/text entry.
 *
 * IMPORTANT (Vega platform reality): VegaOS does NOT expose an app-level
 * speech-to-text API (confirmed by Amazon: no equivalent of Android's
 * SpeechRecognizer). The ONLY supported voice path is the system keyboard:
 * when a TextInput is focused, the built-in virtual keyboard shows a
 * microphone icon and the user can press-and-hold the Alexa button to dictate.
 * The recognized text lands in the field.
 *
 * So SideKick's "ask" box is a real TextInput. Focusing it + the on-screen
 * "Speak" affordance makes the voice path discoverable; the user can also just
 * type. On submit (keyboard "return"/"done" or the Ask button) we hand the
 * recognized text to the AI pipeline. This is genuine, platform-correct voice
 * input — not a simulated transcript.
 */
interface QuestionInputProps {
  mode: SideKickMode;
  onSubmit: (question: string) => void;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({ mode, onSubmit }) => {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [askFocused, setAskFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const accent = mode === 'sports' ? theme.colors.sports : theme.colors.primary;

  const submit = () => {
    const q = value.trim();
    if (!q) return;
    onSubmit(q);
    setValue('');
  };

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.inputRow,
          { borderColor: accent },
          focused && styles.inputRowFocused,
        ]}
      >
        <View style={[styles.dot, { backgroundColor: accent }]} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={setValue}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={submit}
          returnKeyType="search"
          placeholder="Ask SideKick…  (focus, then hold Alexa to speak)"
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>

      <Pressable
        onPress={submit}
        onFocus={() => setAskFocused(true)}
        onBlur={() => setAskFocused(false)}
        style={[styles.askBtn, { backgroundColor: accent }, askFocused && styles.askBtnFocused]}
      >
        <Text style={styles.askBtnText}>Ask</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center' },
  inputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surfaceSolid,
    marginEnd: theme.spacing.sm,
  },
  inputRowFocused: { borderWidth: 4 },
  dot: {
    width: theme.spacing.sm,
    height: theme.spacing.sm,
    borderRadius: theme.spacing.sm / 2,
    marginEnd: theme.spacing.sm,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.font.body,
    paddingVertical: theme.spacing.sm,
  },
  askBtn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  askBtnFocused: {
    borderColor: theme.colors.focusBorder,
    transform: [{ scale: 1.06 }],
  },
  askBtnText: { color: '#000000', fontSize: theme.font.body, fontWeight: '700' },
});
