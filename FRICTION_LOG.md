# Wait, What? — Friction Log & Product Feedback

Submitted for the optional friction-log bonus. Every entry below is a real issue
hit while building Wait, What? on Vega OS + AWS during the hackathon window. Format
per entry: **Task → Steps → Expected vs. Actual → Severity → Workaround →
Suggestion.**

Severity scale: **Critical** (blocks shipping) · **High** (major detour) ·
**Medium** (slows you down) · **Low** (polish/papercut).

---

## Vega OS / React Native for Vega

### 1. `react-native-video` is not supported — easy to start down the wrong path
- **Task:** Add a video player to the app.
- **Steps:** Reached for `react-native-video` (the RN default, and what the
  `react-native-multi-tv-app-sample` uses on its non-Vega targets).
- **Expected:** It would work, or the error would say what to use instead.
- **Actual:** It doesn't work on Vega (no ExoPlayer/AVPlayer). The correct path
  is `@amazon-devices/react-native-w3cmedia` (W3C MSE/EME). Nothing in the
  install error points you there.
- **Severity:** High.
- **Workaround:** Wrapped `VideoPlayer` + `KeplerVideoSurfaceView` in a thin
  component exposing a `react-native-video`-style API.
- **Suggestion:** Have the tooling detect a `react-native-video` dependency and
  emit a one-line "On Vega use `@amazon-devices/react-native-w3cmedia`" hint.

### 2. Assigning `src` doesn't start playback — must call `load()`
- **Task:** Play an MP4 in URL mode.
- **Steps:** Set `videoPlayer.src = url; videoPlayer.autoplay = true;`.
- **Expected:** Playback starts (react-native-video mental model).
- **Actual:** Black surface, no error. You must call `videoPlayer.load()` after
  setting `src`.
- **Severity:** Medium.
- **Workaround:** Call `load()` after `src`; drive `play()` on `loadedmetadata`.
- **Suggestion:** Document the `src → load()` requirement prominently in the URL
  mode sample, or warn when `src` is set but `load()` is never called.

### 3. Surface-view lifecycle churn silently crashes the media stack
- **Task:** Keep playback stable across re-renders.
- **Steps:** Let the surface callbacks tear down/recreate on prop changes.
- **Expected:** Resilient to normal React re-render.
- **Actual:** Rapid surface create/destroy mid-load aborted the pipeline and the
  JS runtime crashed (SIGABRT / `stem exited 255`) with no JS-level stack.
- **Severity:** High.
- **Workaround:** Stable (empty-dep) surface callbacks reading latest props via
  refs; load-once guard; `deinitializeSync` on unmount only.
- **Suggestion:** Surface a JS-level error when the pipeline is torn down
  mid-load, rather than a native abort with no actionable message.

### 4. No app-level speech-to-text API
- **Task:** "Hold to talk" voice input.
- **Steps:** Looked for a `SpeechRecognizer` equivalent.
- **Expected:** An app-controlled STT API like Android TV.
- **Actual:** None exists (confirmed by Amazon staff in the community forum). The
  only supported path is a focused `TextInput` → system keyboard mic → hold
  Alexa to dictate (requires `com.amazon.inputmethod.service` in the manifest).
- **Severity:** High (reshaped a core feature).
- **Workaround:** Built the "ask" box as a real `TextInput` using the keyboard
  mic path.
- **Suggestion:** This is the #1 gap for voice-first TV apps. An app-scoped,
  push-to-talk STT API (even gated behind a privilege) would unlock a whole
  class of experiences. At minimum, document the keyboard-mic path as *the*
  voice-input story up front.

### 5. No app-level text-to-speech (only VoiceView)
- **Task:** Speak answers aloud.
- **Steps:** Tried `speechSynthesis` / an Android-TTS-style API.
- **Expected:** App-controlled TTS without requiring system settings.
- **Actual:** Not available; `speechSynthesis` is absent, no native bridge. Only
  VoiceView (the system screen reader, user-enabled) does speech output.
- **Severity:** Medium.
- **Workaround:** `AccessibilityInfo.announceForAccessibility` + a polite
  live-region, so VoiceView narrates answers when enabled.
- **Suggestion:** An app-level "speak this string" API (even accessibility-gated)
  would make self-voicing experiences possible without full VoiceView.

### 6. No video-frame-capture / pixel-readback API
- **Task:** Explore computer-vision on the current frame.
- **Steps:** Looked for a snapshot/`captureFrame` on the surface view.
- **Expected:** Some way to grab the current frame (canvas-style).
- **Actual:** None — the surface is a native hardware sink. Rules out
  "analyze what's literally on screen now."
- **Severity:** Medium (feature-limiting).
- **Workaround:** Explored CV on the content's poster/scene image instead — ran
  **Amazon Rekognition** (`DetectLabels` + `DetectText`) on the S3 image and
  chained the result into Bedrock Nova for a natural description; ultimately
  scoped the feature out of the final demo.
- **Suggestion:** A frame-grab API would enable on-device CV viewing features.

### 7. Useful packages missing from the OS 1.2 profile
- **Task:** Add gradients, the EPG component, and `react-native-screens`.
- **Steps:** `vega project install @amazon-devices/react-native-linear-gradient`
  (and `kepler-ui-components`, `react-native-screens`).
- **Expected:** Install, since they're documented `@amazon-devices` packages.
- **Actual:** "not in OS version 1.2 profile, skipping" for all three.
- **Severity:** Medium.
- **Workaround:** Built a dependency-free faux-gradient (stacked stepped-opacity
  Views) + vignette; skipped EPG; guarded `enableScreens`/`enableFreeze`.
- **Suggestion:** Make the profile/version compatibility of each package obvious
  in the docs (a support matrix), so you don't discover it at install time.

### 8. Simulator stops on idle; MP4 codec support is inconsistent
- **Task:** Iterate on the Vega Virtual Device.
- **Steps:** Build/launch repeatedly; try various sample MP4s.
- **Expected:** VD stays up; standard MP4s play.
- **Actual:** The VD stops after idle periods (device "not connected"), and some
  H.264 MP4s sit black at 0:00 (`KeplerMediaSink: Invalid configuration`) while
  others play fine.
- **Severity:** Medium.
- **Workaround:** Restart the VD when it drops; verify each clip plays before
  relying on it (H.264/AAC `+faststart` MP4s were most reliable).
- **Suggestion:** Document which codecs/profiles the VD decoder supports, and
  make the "invalid configuration" error name the unsupported codec.

### 9. `[os.version]` and module-ladder requirements aren't obvious
- **Task:** First successful build.
- **Steps:** Hand-wrote a manifest; build failed on OS-version/module entries.
- **Expected:** A clear "add this" message.
- **Actual:** Errors about OS-prefixed module entries without the obvious fix.
- **Severity:** Low (the template + `vega project update-manifest` solve it).
- **Workaround:** Scaffolded from the official RN 0.72 template and let the
  tooling manage the module ladder.
- **Suggestion:** Point first-time hand-authored manifests at
  `vega project update-manifest` in the error text.

---

## AWS (Bedrock / Lambda / API Gateway / IAM)

### 10. Public Lambda Function URLs blocked on the account
- **Task:** Expose the `/ask` Lambda over HTTPS via a Function URL.
- **Steps:** Created the Function URL (`AuthType: NONE`), added the public
  `InvokeFunctionUrl` permission; policy + auth type were correct.
- **Expected:** Public 200.
- **Actual:** Persistent `403 Forbidden`, even after a clean recreate, with no
  org SCP present.
- **Severity:** High.
- **Workaround:** Fronted the Lambda with an **API Gateway HTTP API** instead —
  worked immediately.
- **Suggestion:** When a Function URL is blocked by an account-level control,
  return an error that *names* the control rather than a generic 403.

### 11. Anthropic (Claude) access gated by Marketplace billing
- **Task:** Use Claude Haiku 4.5 via Bedrock.
- **Steps:** Pointed the Lambda at the Claude inference profile.
- **Expected:** Works once model access is "enabled."
- **Actual:** `AccessDeniedException: INVALID_PAYMENT_INSTRUMENT ... AWS
  Marketplace subscription cannot be completed`, then a role-permission error for
  `aws-marketplace:Subscribe/ViewSubscriptions`.
- **Severity:** High (blocked live Claude).
- **Workaround:** Switched to Amazon's first-party **Nova Micro**, which has no
  Marketplace subscription step and worked instantly (later moved to Nova Lite
  so the model can see video frames); also added the Marketplace
  actions to the Lambda role.
- **Suggestion:** In the Bedrock Model Access UI, surface the billing/Marketplace
  prerequisite for third-party models *before* the user thinks access is granted.

### 12. Lambda IAM role needs Marketplace actions for third-party model access
- **Task:** Invoke a Marketplace-backed model from Lambda.
- **Steps:** Scoped the role to `bedrock:InvokeModel*` only.
- **Expected:** Enough to invoke.
- **Actual:** `AccessDenied` for `aws-marketplace:ViewSubscriptions`/`Subscribe`.
- **Severity:** Medium.
- **Workaround:** Added the Marketplace actions to the execution role.
- **Suggestion:** Document that invoking Marketplace-backed Bedrock models from a
  role requires the Marketplace actions, with a ready-to-paste policy snippet.

### 13. CLI session expiry mid-workflow
- **Task:** Deploy/update the Lambda across a long build session.
- **Severity:** Low.
- **Workaround:** Re-authenticated and re-ran; verified via a public `curl` that
  doesn't need creds.
- **Suggestion:** N/A (environment), noted for completeness.

---

## What worked well (credit where due)

- **`vega project install` / `update-manifest`** resolving OS-compatible package
  versions and the module ladder is excellent — it fixed version mismatches we'd
  never have guessed by hand.
- **`vega project doctor`** gave clear, actionable manifest/OS validation.
- **The W3C media stack**, once wired correctly, is solid — stable playback,
  clear `TIME_UPDATE`/`loadedmetadata` events.
- **Amazon Nova via Bedrock Converse** was the smoothest part of the whole
  build: first-party access with no Marketplace step, instant, and the Converse
  API is clean. The `maxTokens`/adaptive-retry guidance mattered.
- **Amazon Rekognition** was equally easy: `DetectLabels` + `DetectText` worked
  **first-party and instantly** — no AWS Marketplace subscription gate (the exact
  thing that blocked Claude), just an IAM action and go. We explored chaining its
  output into Bedrock Nova (vision → natural description), which worked cleanly.
  One caveat noted: generic `DetectLabels` sometimes mislabels stylized sports
  stills (basketball → "baseball"), so any production use should anchor on the
  known title/sport from the catalog and treat labels as supporting detail.
- **The RN 0.72 template** scaffolds a correct, buildable project immediately.

## Would we build on Vega again?

Yes. The platform is young and the gaps above are real, but the core (W3C media,
RN 0.72, the CLI tooling, Nova on Bedrock) is coherent and productive once you
learn its shape. The biggest unlocks for the next wave of apps: an **app-level
STT/push-to-talk API** and **app-level TTS** — those two alone would open up
voice-first TV experiences that today require workarounds.
