# SideKick — an AI viewing companion for Fire TV (Vega OS)

> Hold one button and ask about anything you're watching. SideKick answers in a
> non-blocking overlay **without pausing playback** — and when it detects live
> sports, the same gesture unlocks a stat-aware mode with live scorecards.

Built for the **Build, Ship, Shape: Amazon Developer Hackathon** — Fire TV track
(priority categories: *AI-enhanced viewing*, *sports*, *multi-modal UX*) with the
**AWS Builder** mini challenge (Amazon Bedrock / Nova).

---

## The idea

Two universal living-room behaviors, one coherent product:

1. **"Who is that actor?" / "What happened last episode?"** — you reach for your
   phone and Google it, missing the show.
2. **"What are his stats?" / "Catch me up"** — you check your phone mid-game.

SideKick folds both into a single **hold-to-talk** gesture layered over the video.
It captures *what's on screen and where you are in it*, routes that context by
**mode**, and renders a short answer (plus a sports **StatCard** when relevant) in
a side panel. Playback never stops.

The headline is **context-awareness**: the companion knows what you're watching
and changes what it can do. General mode and sports mode are not two apps — they
are one pipeline with a mode-selected prompt and renderer.

---

## Architecture

```
Hold-to-talk (Fire TV remote Select button)
        │  onPressIn → listening, onPressOut → submit
        ▼
VideoContext.snapshot()  ──►  { title, contentType, positionSeconds, mode, context }
 (what's on screen, where)
        │
        ▼
ModeRouter.buildAskRequest()  ──►  general ─┐
                                            ├─►  POST /ask  ──►  Lambda ──► Bedrock Nova (Converse)
                                   sports ──┘      (6s timeout)        │     grounded on content/game
        │                                                             ▼
        │                                                    { text, statCard? }
        ▼
SideKickOverlay (right-edge panel)  ──►  text answer | StatCard
        │
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
│   ├── App.tsx                # full-screen video + overlay + content switch
│   ├── index.js               # AppRegistry.registerComponent('SideKick', …)
│   ├── player/
│   │   ├── VideoPlayer.tsx     # W3C media wrapped in a react-native-video-like API
│   │   └── useVideoContext.tsx # context capture: what's playing + position + mode
│   ├── sidekick/              # THE DIFFERENTIATOR
│   │   ├── ModeRouter.ts       # builds the grounded AskRequest; general vs sports
│   │   ├── VoiceButton.tsx     # hold-to-talk, mode-aware, accessible focus ring
│   │   ├── SideKickOverlay.tsx # non-blocking right-edge answer panel
│   │   ├── StatCard.tsx        # 10-foot sports stat card
│   │   └── bedrockClient.ts    # calls /ask; seeded fallback if offline
│   ├── data/                  # catalog + seeded sports + shared types
│   └── theme/                 # 10-foot scaling + colors
└── backend/                   # the AWS Builder piece
    ├── handler.ts             # Lambda: Bedrock Nova (Converse) + seeded fallback
    ├── template.yaml          # SAM: Lambda + Function URL + least-privilege IAM
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
> The demo loads a general-mode show first. Use the on-screen **Switch content**
> button to flip to the sports clip and watch the overlay change to **SPORTS
> MODE**. Hold the remote **Select** button to ask.

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

Then point the app at the endpoint — in `src/sidekick/bedrockClient.ts` set
`DEFAULT_ENDPOINT`, or call `setAskEndpoint('https://…/ask')` at startup.

### Bedrock access
Enable model access for **Amazon Nova Lite** in your region
(`aws bedrock list-inference-profiles --region us-east-1` to confirm the id).
The handler uses the cross-region inference profile `us.amazon.nova-lite-v1:0`
by default; override with the `BEDROCK_MODEL_ID` env var.

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
| **Design** | One hold-to-ask gesture, non-blocking overlay, **animated mode switch** (accent sweeps + badge morphs when context changes), animated focus bloom, cinematic vignette, timeline-anchored answers, 10-foot scaling, accessible focus (border + scale, not color alone) |
| **Potential Impact** | Two near-universal behaviors (actor/plot lookups, mid-game catch-up) solved without leaving the screen — **plus an accessibility layer** (spoken answers via VoiceView) and a **content-agnostic pipeline any streaming app could embed** |
| **Quality of the Idea** | "The companion that understands what you're watching **and where you are in it**" — one adaptive pipeline with proactive, timeline-aware moments, not two bolted-together features |

---

## Who this is for (potential impact)

SideKick solves behaviors that are near-universal, and it reaches audiences a
plain companion app would miss:

- **Everyone who reaches for their phone mid-show** — "who is that actor?",
  "what happened last episode?" — answered on the TV without pausing.
- **Sports viewers who join late or lose track** — "catch me up", "what are his
  stats?" — with live-style stat cards and proactive big-play surfacing.
- **Low-vision viewers (accessibility).** SideKick's answers are announced
  through **VoiceView**, so a viewer who can't read the panel still hears what's
  on screen and what's happening in the game. On VegaOS, VoiceView is the
  supported speech-output path; SideKick is built to use it.
- **Any streaming app, not just this one.** The pipeline is content-agnostic —
  it takes "what's playing + where you are + a question" and returns a grounded
  answer. It's designed to drop into an existing catalog app as a companion
  layer, which is the path beyond this hackathon.

---

## AWS Builder mini challenge — write-up

**Services used**

- **Amazon Bedrock (Nova Micro) via the Converse API** (`@aws-sdk/client-bedrock-runtime`).
  `backend/handler.ts` builds a mode-specific system prompt that grounds the model
  on the current title/synopsis (general mode) or the live game snapshot (sports
  mode), then calls `ConverseCommand` with `maxTokens: 256` and `temperature: 0.3`.
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
