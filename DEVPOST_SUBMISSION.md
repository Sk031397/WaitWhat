# Wait, What? — Devpost submission (copy-paste into the form fields)

Each `##` heading below maps to a field on the Devpost "Enter a Submission" page.
Paste the body of each section into the matching field. Fill the bracketed
`[…]` placeholders before submitting.

---

## Project name
Wait, What? — talk to your timeline

## Elevator pitch (one sentence, ~200 char field)
Ask about anything you're watching — without pausing. Wait, What? sees the real
frames, answers on the TV via Amazon Bedrock, navigates by plain language, and pins
every answer to your timeline.

---

## About the project  (main "Project description" field — paste all of this)

### Inspiration
Everyone does the same thing while watching TV: something happens on screen and
you reach for your phone — *who's that actor? what did I miss? what's this scene?*
You pause, you Google, you lose the moment. Wait, What? fixes that on the **biggest
screen in the house**: you ask, and it answers **without pausing**, grounded on
exactly what's playing and where you are in it.

The bigger idea: **the timeline should be something you can talk to** — not a
chat window bolted onto a video, but a companion that understands the content,
anchors every answer to the moment you asked, lets you navigate by plain language
("take me to the middle"), and sees the actual frames on screen.

### What it does
While a film or game plays full-screen (playback never stops):
- **Ask about anything on screen** — hold Menu (☰) and the panel opens with the
  keyboard mic ready; a live **Amazon Bedrock** answer comes back, grounded
  on the title, synopsis, cast, and your exact playback position, in a
  non-blocking side panel.
- **Talk to your timeline** — say where to go in plain language ("take me to
  0:10 and tell me what's happening," "go to the middle," "a quarter of the way,"
  "go to the end"); Wait, What? seeks there **and** explains the moment. It controls
  playback — it never refuses to rewind.
- **Every question lives on the scrubber** — each ask drops a marker; a "Your
  questions" row lets you jump back to any moment and re-surface its answer.
- **Sports mode** — open a game and the same gesture re-themes and grounds live
  Bedrock answers on the game context and the real frames, so "catch me up"
  / "break down this play" answer in the moment. No real teams or leagues: the footage is
  license-clear amateur sports clips.
- **It sees the screen** — every question carries real frames from the video up
  to your position, so "what's happening right now?" is answered from the
  footage itself (and it can't spoil what's ahead).
- **It anticipates** — when a new scene starts, a ✨ scene insight surfaces what's
  on screen unprompted (pre-generated from the real frames, so it's free at
  playback time).
- **It's accessible** — answers are announced through **VoiceView** for
  low-vision viewers.

### How we built it
- **Fire TV / Vega OS, React Native.** Correct Vega media stack:
  `@amazon-devices/react-native-w3cmedia` (W3C MSE/EME), *not*
  `react-native-video` (unsupported on Vega), wrapped behind a familiar player
  API over `VideoPlayer` + `KeplerVideoSurfaceView`. Vega-native navigation,
  accessible 10-foot focus (border + scale, never color alone), dependency-free
  gradient/vignette. Voice input via the supported system-keyboard mic path;
  holding Menu (timed from key-down/key-up) opens the panel with the field
  focused.
- **Backend (AWS Builder).** **Amazon Bedrock Nova Lite** (multimodal) via the Converse API
  behind **API Gateway (HTTP API) + Lambda** with **least-privilege IAM**;
  context-grounded prompt plus the last real frames (from S3) up to the playback
  position. No AWS credentials ship in the TV app; if the model is unreachable
  the app says so instead of showing a canned answer. A warm-up ping when the
  player opens avoids cold starts.
- **Frames + insights.** ffmpeg extracts a 768px frame every 2s of every video to
  **Amazon S3**. An offline script finds scene changes in those frames and asks
  Nova Lite for one-line scene insights, which ship with the app.

### Challenges we ran into
Vega is a young platform (full detail in our friction log): no app-level STT (we
use the system-keyboard mic) and no app-level TTS (we use VoiceView); no
video-frame-capture API (we extract frames server-side ahead of time); no
long-press event outside a focused control (we time the Menu key ourselves);
several packages absent from the OS 1.2 profile; public
Lambda Function URLs blocked on the account (we used API Gateway); and Claude
gated by AWS Marketplace billing (we used first-party Nova, which worked
instantly).

### Accomplishments we're proud of
A working, platform-correct Vega app verified on the Vega Virtual Device; a live,
deployed Bedrock integration (not mocked) that fails honestly instead of inventing answers; and a genuinely
new interaction — talking to the timeline (ask, navigate, revisit) — plus
answers grounded in the real frames, scene insights that surface on their own,
and a real accessibility story.

### What we learned
How to build *with* Vega's constraints rather than against them (W3C media, the
system-keyboard voice path, VoiceView), and how to keep an on-device AI
experience resilient (grounded prompts, explicit `maxTokens`, adaptive retry,
hard timeouts, honest errors).

### What's next
Longer sports footage with a visible scoreboard, so score questions are read
straight off the screen; a first-class "Describe this scene" accessibility mode; and packaging Wait, What? as a drop-in companion layer
any streaming app can embed — the pipeline is content-agnostic.

---

## Built with  (tags field — comma-separated)
fire-tv, vega-os, react-native, amazon-bedrock, amazon-nova, amazon-s3,
aws-lambda, amazon-api-gateway, aws-iam, w3c-media, voiceview, ffmpeg, typescript

---

## Primary track
Fire TV (Vega OS)

## Priority categories (select/mention)
AI-enhanced viewing · sports · multi-modal UX · accessibility

## Mini challenge(s) entered
AWS Builder

---

## "Try it out" / links
- GitHub repo: https://github.com/Sk031397/WaitWhat
- Demo video (YouTube/Vimeo, public, <3:00): [ PASTE VIDEO URL ]

## Testing instructions (judges only — NOT in the public repo)
Build per the README. To use the live backend, create `src/secrets.ts` with:
`export const ASK_API_KEY = '[ PASTE KEY FROM YOUR LOCAL src/secrets.ts ]';`
then rebuild. Endpoint: the `ASK_ENDPOINT` in `src/config.ts`.

## New or existing project?
New: created during the submission window (first commit Oct 9, 2026).

---

## PRODUCT FEEDBACK  (required field — this is what earns the ≤10% bonus; answer all 5)

**1) Which developer tools, APIs, and SDKs did you use, and for what?**

*Fire TV / Vega OS*
- **Vega SDK 0.24 + Vega CLI** (`vega project install` / `update-manifest` /
  `doctor`, `npm run build:debug` → `react-native build-vega`, `vega run-app`,
  `vega device install-app` / `launch-app`) — scaffolding from the RN 0.72
  template, manifest and module management, building the `.vpkg` for armv7 /
  aarch64 / x86_64, and installing on the device.
- **Vega Virtual Device** (`vega virtual-device start`) — running and testing the
  app; `inputd-cli` to inject remote key presses and `loggingctl` to read app
  logs while testing.
- **React Native for Vega** (`@amazon-devices/react-native-kepler`, RN 0.72) —
  the app UI, 10-foot focus handling, and `useTVEventHandler` for remote key
  events (detecting a held Menu button to open the ask panel).
- **`@amazon-devices/react-native-w3cmedia`** (W3C MSE/EME `VideoPlayer` +
  `KeplerVideoSurfaceView`) — video playback, seeking and progress events, wrapped
  in a react-native-video-style component.
- **`@amazon-devices/react-navigation__native` / `__stack`** — Home → Player
  navigation.
- **Vega manifest services** — media server/buffer/transform services and media
  controls for playback; audio services; the system IME
  (`com.amazon.inputmethod.service`) for the keyboard-mic voice path.
- **System keyboard mic** (focused `TextInput` + hold the Alexa button) — voice
  input, since Vega has no app-level speech-to-text API.
- **VoiceView** via `AccessibilityInfo.announceForAccessibility` and live regions —
  reading answers and scene insights aloud for low-vision viewers.

*AWS (AWS Builder)*
- **Amazon Bedrock — Nova Lite via the Converse API**
  (`@aws-sdk/client-bedrock-runtime`, cross-region profile
  `us.amazon.nova-lite-v1:0`) — live answers grounded on the title, synopsis,
  playback position, recent exchanges, and the last 4 real video frames sent as
  image blocks; also used offline to write the one-line scene insights.
- **Amazon S3** (`@aws-sdk/client-s3`) — hosts the sports clips and posters, and a
  768px frame every 2s of every video, which the Lambda reads at question time.
- **AWS Lambda** (Node.js) — the `/ask` handler: validates the request, checks the
  shared key, loads frames, calls Bedrock, answers a warm-up ping.
- **Amazon API Gateway (HTTP API)** — the public HTTPS `/ask` endpoint with CORS
  and stage throttling (5 req/s, burst 10) as the cost cap.
- **AWS IAM** — least-privilege role: `bedrock:InvokeModel*` on Nova models and
  inference profiles, `s3:GetObject` on `frames/*` only.
- **AWS CLI** — deploying code and environment, throttling, and smoke tests
  (`backend/deploy.sh`); **AWS SAM** template as the reproducible definition.

*Build and quality tools*
- **TypeScript**, **Jest + ts-jest** (app unit tests), a small ts-node test
  harness (backend validation, auth, warm-up and error paths), **ESLint +
  Prettier**.
- **ffmpeg** — extracting frames from every video and detecting scene changes for
  the insights.
- **Mermaid** — the architecture diagram in the README.
- **Claude Code** — AI coding assistant used during development.

**2) What worked well?**
- The W3C media stack is solid once wired correctly — stable playback and clear
  `TIME_UPDATE` / `loadedmetadata` events.
- `vega project install` / `update-manifest` resolving OS-compatible versions and
  the module ladder saved us from mismatches we'd never have guessed by hand;
  `vega project doctor` gave clear, actionable validation.
- **Amazon Nova via Bedrock Converse** was the smoothest part of the build:
  first-party access, no Marketplace step, instant, clean API.
- The RN 0.72 template scaffolds a correct, buildable project immediately.

**3) What needs work?** (summary — full detail in the friction log below)
- **No app-level speech-to-text** and **no app-level TTS** — the two biggest gaps
  for voice-first TV apps; we used the system-keyboard mic and VoiceView.
- **No video-frame-capture API** on Vega — we extract frames server-side instead.
- No long-press event for remote keys unless a control is focused — we time
  Menu's key-down/key-up ourselves.
- `react-native-video` fails on Vega with no hint toward W3C media; setting `src`
  without `load()` black-screens silently; surface-view lifecycle churn can crash
  the media stack with only a native abort.
- `linear-gradient`, `kepler-ui-components`, `react-native-screens` aren't in the
  OS 1.2 profile; the VD stops on idle and some H.264 MP4s won't decode.
- Public Lambda Function URLs returned 403 with no named control (used API
  Gateway); Claude required an AWS Marketplace subscription that wasn't surfaced
  before access looked "granted" (used Nova).

**4) How was onboarding (zero to hello world)?**
Good once we used the official RN 0.72 template + `vega project` tooling — that
path gets you to a running app on the Virtual Device quickly and manages the
manifest module ladder for you. The friction was less about getting to hello
world and more about discovering platform edges afterward (the player stack,
voice, missing packages) — mostly surfaced only at the point of failure.

**5) Would you build with these devices/services again? (Yes/No + why)**
**Yes.** The core — W3C media, RN 0.72, the Vega CLI, and Nova on Bedrock — is
coherent and productive once you learn its shape, and first-party Bedrock access
was frictionless. The biggest unlocks for the next wave of apps would be an
**app-level push-to-talk STT API** and **app-level TTS**; those two alone would
open up voice-first TV experiences that today require workarounds.

---

## FRICTION LOG  (paste the full contents of FRICTION_LOG.md into the friction-log
## field — 16 structured entries, Task → Steps → Expected vs Actual → Severity →
## Workaround → Suggestion. Participants who submit friction logs score higher,
## up to a 10% bonus.)

See FRICTION_LOG.md in the repo — paste it verbatim here.

---

## OPEN SOURCE mini challenge (optional — only if you choose to enter it)
If you make the repo public with an OSS license (you already have MIT-0), you can
also enter Open Source. Required fields: contribution URL (the repo), repo URL,
your GitHub username, and a short "what/how/why." Note: the rules describe Open
Source as a *new, additional* open-source project or a contribution made during
the window — confirm your repo satisfies that framing before claiming it.

---

## Pre-submit checklist
- [ ] Demo video public on YouTube/Vimeo, **< 3:00**, in English, shows it
      running on the Vega simulator, **no third-party trademarks or unlicensed
      music**. Avoid showing the wrestling clip (arena sponsor logos) and the
      soccer clip (brand logos on the fence); credit the Blender films in the
      video description.
- [x] Repo is **public + OSS license visible** (MIT-0, detected by GitHub).
      (Only if you make it private: share with knmeiss, giolaq, anishamalde,
      mosesroth, emersonsklar.)
- [ ] Repo has clear setup/run instructions (README covers this).
- [ ] Product Feedback field filled (all 5 answers above).
- [ ] Friction log pasted into its field (the ≤10% bonus).
- [ ] Primary track = Fire TV; Mini challenge = AWS Builder (both selected).
- [ ] Links filled: repo URL + video URL.
