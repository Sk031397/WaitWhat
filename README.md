# SideKick — talk to your timeline

> Hold one button and ask about anything you're watching. SideKick answers in a
> non-blocking overlay **without pausing playback**, anchors every answer to the
> moment you asked, lets you **navigate by natural language**, and **proactively
> surfaces** what's happening — and it announces answers through **VoiceView**
> for low-vision viewers.

Built for the **Build, Ship, Shape: Amazon Developer Hackathon** — Fire TV track
(priority categories: *AI-enhanced viewing*, *sports*, *multi-modal UX*,
*accessibility*) with the **AWS Builder** mini challenge (Amazon Bedrock).

---

## The idea

Everyone reaches for their phone while watching — *who's that actor, what did I
miss, what's this scene, what are his stats?* SideKick answers on the TV,
**without pausing**, grounded on what's playing and where you are in it.

The deeper idea: **the timeline becomes something you talk to.** SideKick is one
companion pipeline that:

- **answers** questions about the current title/scene via a live Amazon Bedrock
  call, grounded on the content and your exact playback position;
- **navigates** on command — "take me to 0:10 and tell me what's happening", "go
  to the middle", "go a quarter of the way", "go to the end" — seeking there and
  explaining the moment (it controls playback; it never refuses to rewind);
- **remembers** — every question drops a marker on the scrubber, and a
  "Your questions" row lets you jump back to any moment and re-surface its answer;
- **adapts to sports** — open a game and the same gesture enters **sports mode**:
  a StatCard answer and a **proactive big-play** that surfaces before you ask
  (teams/players are fictional; footage is our own license-clear clips);
- **anticipates** — on shows too, at key scene moments it proactively surfaces a
  scene insight without being asked;
- **narrates** — answers are announced through VoiceView, so a low-vision viewer
  hears what's on screen.

It's not a chat window bolted onto a video — it's a companion that understands
the content *and where you are in it*.

---

## Architecture

```
Ask (focus field → system keyboard mic / type)      Natural-language nav
        │                                             "go to the middle"
        ▼                                                    │
VideoContext.snapshot()  { title, synopsis, positionSeconds, context }
 (what's on screen, where)                                   │
        │                                            parseTimePhrase /
        ▼                                            parseSeekIntent → seek
buildAskRequest()  ──►  POST /ask  ──►  API Gateway ──► Lambda ──► Bedrock Nova
        │                   (6s timeout)                   │        (Converse,
        │                                                  ▼         grounded)
        │                                           { text }  →  seeded fallback
        ▼                                                         if unavailable
SideKickOverlay (right-edge panel)  ──►  answer + timeline marker + VoiceView
        │                                proactive scene insights (unprompted)
        ▼
VideoPlayer (W3C media) keeps playing — never paused
```

### Why not `react-native-video`?

Vega OS does **not** support `react-native-video` (it wraps ExoPlayer/AVPlayer,
which Vega doesn't use). Vega uses the **W3C MSE/EME** standard via
`@amazon-devices/react-native-w3cmedia`. Even Amazon's own
`react-native-multi-tv-app-sample` swaps to W3C media on its Vega target.

`src/player/VideoPlayer.tsx` is a thin wrapper that exposes a familiar
`react-native-video`-style API (`source`, `paused`, `onLoad`, `onProgress`,
`onEnd`, `onError`) while driving `VideoPlayer` + `KeplerVideoSurfaceView`
underneath. App code stays idiomatic; the platform-native player does the work.

---

## Project layout

```
.
├── manifest.toml              # Vega manifest: media services, audio, deep links, os.version
├── babel.config.js            # automatic JSX runtime (required by react-native-w3cmedia)
├── package.json               # react-native-w3cmedia — NOT react-native-video
├── src/
│   ├── App.tsx                # stack navigator: Home → Player (no drawer)
│   ├── index.js               # AppRegistry.registerComponent('SideKick', …)
│   ├── config.ts              # ASK_ENDPOINT (deployed backend URL)
│   ├── screens/
│   │   ├── HomeScreen.tsx      # hero header + horizontal content rows
│   │   └── PlayerScreen.tsx    # full-screen video + controls + overlay + proactive
│   ├── components/
│   │   ├── FocusableCard.tsx   # grid tile w/ animated focus bloom
│   │   ├── PlayerControls.tsx  # play/pause, ±10s, seek bar + "Your questions" chips
│   │   ├── GradientScrim.tsx   # dependency-free faux gradient
│   │   └── Vignette.tsx        # cinematic edge darkening
│   ├── player/
│   │   ├── VideoPlayer.tsx     # W3C media wrapped in a react-native-video-like API
│   │   └── useVideoContext.tsx # context capture + navigable timeline (markers, seek)
│   ├── sidekick/              # THE DIFFERENTIATOR
│   │   ├── SideKickOverlay.tsx # non-blocking slide-out answer panel
│   │   ├── QuestionInput.tsx   # TextInput → system-keyboard mic (Vega voice path)
│   │   ├── ModeRouter.ts       # builds the grounded AskRequest
│   │   ├── InterestTracker.ts  # learns repeated interests (adaptive)
│   │   ├── StatCard.tsx        # structured sports stat card
│   │   └── bedrockClient.ts    # calls /ask; seeded fallback if offline
│   ├── util/
│   │   ├── parseTimePhrase.ts  # natural-language seek: "0:10", "the middle", "a quarter"
│   │   └── formatTime.ts
│   ├── data/                  # catalog (shows/movies) + shared types
│   └── theme/                 # 10-foot scaling + colors + motion tokens
└── backend/                   # the AWS Builder piece
    ├── handler.ts             # Lambda: Bedrock Nova (Converse) + seeded fallback
    ├── template.yaml          # SAM reference (deployed via API Gateway + Lambda)
    ├── devServer.ts           # local http wrapper for the handler
    └── test.ts                # 14 assertions over the fallback path (no AWS needed)
```

---

## Run it

### Prerequisites
- Vega SDK installed (`vega` / `kepler` CLI on PATH) — https://developer.amazon.com/vega
- Node 18+
- A Fire TV (Vega OS) device **or** the Vega simulator

### 1. App (on device / simulator)

```bash
# Load the Vega SDK into your shell (every new terminal)
source $HOME/vega/env

npm install

# Build the app (bundles RN, runs kmmb, packages the .vpkg)
npm run build:debug
#   → produces build/<arch>-debug/sidekick_<arch>.vpkg

# Install + launch on a connected Vega device / simulator
vega run-app build/x86_64-debug/sidekick_x86_64.vpkg
```

For live development with Fast Refresh (two terminals):

```bash
# Terminal A — Metro bundler
source $HOME/vega/env && npm start

# Terminal B — build + launch
source $HOME/vega/env && npm run build:debug
```

> Verified with Vega SDK 0.24, CLI 1.4.4, RN 0.72: `tsc --noEmit` clean,
> `vega project doctor` all-pass, `npm run build:debug` exits 0 and emits
> `.vpkg` for armv7 / aarch64 / x86_64.
>
> The demo browses shows/movies on the home grid; open any title to watch.
> Open the **Ask SideKick** panel, then type or (on a device) hold the Alexa
> button to dictate a question. Try a navigation phrase like *"go to the middle"*
> or *"take me to 0:10 and tell me what's happening."* A scene insight surfaces
> on its own a few seconds in. Open a **Live Sports** game to see sports mode:
> a StatCard answer and a proactive big-play (fictional teams over our own
> license-clear footage).

### 2. Backend (the Bedrock endpoint)

```bash
cd backend
npm install
npm test        # 14/14 — exercises the seeded fallback with no AWS creds

# Option A — run locally
npm run dev     # http://localhost:3000/ask  (uses your shell AWS creds for Bedrock)

# Option B — deploy with SAM
npm run build
sam deploy --guided --template-file template.yaml
# Copy the AskEndpoint output URL
```

Then point the app at the endpoint — in `src/config.ts` set `ASK_ENDPOINT`, or
call `setAskEndpoint('https://…/ask')` at startup. (A live API Gateway endpoint
is already wired in `src/config.ts` for this submission.)

### Bedrock access
Enable model access for an **Amazon Nova** model in your region
(`aws bedrock list-inference-profiles --region us-east-1` to confirm the id).
The deployed handler uses the cross-region inference profile
`us.amazon.nova-micro-v1:0`; override with the `BEDROCK_MODEL_ID` env var.
(First-party Nova models need no AWS Marketplace subscription; third-party
models like Claude do.)

---

## Resilience: it always answers

If the backend is unreachable (no deploy, offline demo, throttling), both the
client (`bedrockClient.seededFallback`) and the server (`handler.seededFallback`)
return a deterministic seeded answer from `seededSports` / catalog context. This
keeps the on-camera demo bulletproof while still being a real Bedrock call when
connected. The two fallbacks are intentionally mirrored.

---

## How this maps to the judging criteria

| Criterion | Where it shows up |
|---|---|
| **Tech Implementation** | Correct Vega W3C media stack (not react-native-video), manifest media services, deployed Amazon Bedrock backend behind API Gateway + Lambda with least-privilege IAM, untrusted-input validation, graceful seeded fallback |
| **Design** | One hold-to-ask gesture, non-blocking slide-out panel, **animated focus bloom**, cinematic vignette, timeline-anchored answers with a **navigable Q&A history**, context-themed **sports mode** (accent + StatCard), 10-foot scaling, accessible focus (border + scale, not color alone) |
| **Potential Impact** | Near-universal behaviors (ask about what you're watching, catch up on a game) solved without leaving the screen — **plus an accessibility layer** (answers spoken via VoiceView for low-vision viewers) and a **content-agnostic pipeline any streaming app could embed** |
| **Quality of the Idea** | **Talk to your timeline** — ask, navigate by natural language, revisit any question on the scrubber, get proactive insights, and an adaptive **sports mode** with stat cards + pre-emptive big-plays. One companion that understands what you're watching *and where you are in it*. |

---

## Who this is for (potential impact)

SideKick solves behaviors that are near-universal, and it reaches audiences a
plain companion app would miss:

- **Everyone who reaches for their phone mid-show** — "who is that actor?",
  "what happened last episode?" — answered on the TV without pausing.
- **Anyone who wants to move around the content hands-free** — "take me to the
  middle", "go back to 0:10 and tell me what's happening" — natural-language
  navigation that seeks *and* explains, instead of blind scrubbing.
- **Sports fans who join late or want the numbers** — open a game and SideKick
  surfaces a stat card and flags the big play before you ask (fictional
  teams/players over our own license-clear footage).
- **Low-vision viewers (accessibility).** SideKick's answers are announced
  through **VoiceView**, so a viewer who can't read the panel still hears what's
  on screen and what's happening. On VegaOS, VoiceView is the supported
  speech-output path; SideKick is built to use it.
- **Any streaming app, not just this one.** The pipeline is content-agnostic —
  it takes "what's playing + where you are + a question" and returns a grounded
  answer. It's designed to drop into an existing catalog app as a companion
  layer, which is the path beyond this hackathon.

---

## AWS Builder mini challenge — write-up

**Services used**

- **Amazon Bedrock (Nova Micro) via the Converse API** (`@aws-sdk/client-bedrock-runtime`).
  `backend/handler.ts` builds a system prompt that grounds the model on the
  current title, synopsis, cast, and the viewer's exact playback position, then
  calls `ConverseCommand` with `maxTokens: 256` and `temperature: 0.3`.
  Deployed and live — the app receives real model-generated answers
  (`fromFallback: false`), with the seeded fallback reserved for offline/outage.
- **Amazon API Gateway (HTTP API) + AWS Lambda** — public HTTPS `/ask` endpoint
  with CORS; the Lambda holds the Bedrock integration. (A Function URL was tried
  first; this account blocks public Function URLs, so an HTTP API fronts the
  Lambda instead — documented in the build history.)
- **IAM** — least-privilege role scoped to `bedrock:InvokeModel*` on foundation
  models + inference profiles, plus the AWS Marketplace subscription actions
  required for model access.

**Practices applied from AWS guidance**

- `maxTokens` set explicitly (avoids the silent 43× quota reservation that causes
  ThrottlingException).
- Cross-region inference profile id (`us.` prefix) for availability.
- Adaptive retry (`maxAttempts: 5`, `retryMode: 'adaptive'`).
- Request body treated as untrusted: validated shape + clamped to 300 chars
  before entering the prompt.
- No AWS credentials ever ship in the TV app — Bedrock is only ever called
  server-side.
- Graceful degradation: a deterministic seeded fallback (mirrored client + server)
  keeps the app answering if the model or network is unavailable.

---

## License

MIT-0 — see [LICENSE](LICENSE).
# WaitWhat
