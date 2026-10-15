# SideKick — talk to your timeline

**Track:** Fire TV (Vega OS) · **Mini challenge:** AWS Builder
**Priority categories:** AI-enhanced viewing, sports, computer vision, multi-modal UX, accessibility

---

## Inspiration

Everyone does the same thing while watching TV: something happens on screen and
you reach for your phone. *Who is that actor? What did I miss? What's this scene
about?* You pause, you Google, you lose the moment. SideKick fixes that on the
**biggest screen in the house** — you ask, and it answers **without pausing**,
grounded on exactly what's playing and where you are in it.

The bigger idea underneath: **the timeline should be something you can talk to.**
Not a chat window bolted onto a video — a companion that understands the content,
anchors every answer to the moment you asked, lets you *navigate by voice/words*
("take me to the middle"), and proactively surfaces what matters.

## What it does

While a show plays full-screen (playback never stops):

- **Ask about anything on screen.** Hold-to-ask → SideKick answers via a live
  **Amazon Bedrock** call, grounded on the title, synopsis, cast, and your exact
  playback position. The answer appears in a non-blocking side panel.
- **Talk to your timeline.** Say where you want to go in plain language —
  *"take me to 0:10 and tell me what's happening"*, *"go to the middle"*,
  *"go a quarter of the way"*, *"go to the end"* — and SideKick seeks there **and**
  explains the moment. It controls playback; it never says "I can't rewind."
- **Every question lives on the scrubber.** Each ask drops a marker at that
  timestamp; a "Your questions" row lets you **jump back to any moment and
  re-surface its answer** — a navigable Q&A history over the video.
- **It adapts to sports.** Open a game from the **Live Sports** row and the same
  gesture enters **sports mode**: SideKick re-themes and grounds its live Bedrock
  answers on the game context (teams, venue, situation), so "catch me up" or
  "what's the score" answer in the moment. Teams/players are fictional (no real
  leagues/trademarks) over our own license-clear sports footage.
- **It anticipates on shows too.** At key scene moments SideKick **proactively
  surfaces an insight** ("New scene — the crew finds the cache raided; the
  season's mystery begins") without being asked.
- **It can look at the scene.** "What's in this scene?" runs **Amazon
  Rekognition** on the content's image (labels + any on-screen text), then feeds
  that into Bedrock to describe the scene in a natural sentence — two AWS AI
  services chained. (CV runs on the poster/scene image; Vega has no live-frame
  capture.)
- **It's accessible.** Answers are announced through **VoiceView**, so a
  low-vision viewer hears what's on screen and what's happening — a viewing
  companion that *narrates*, not just displays.

## How we built it

**App (Fire TV / Vega OS, React Native)**
- Correct Vega media stack: **`@amazon-devices/react-native-w3cmedia`** (W3C
  MSE/EME), *not* `react-native-video` (unsupported on Vega). A thin wrapper
  exposes a familiar `react-native-video`-style API over `VideoPlayer` +
  `KeplerVideoSurfaceView`.
- Vega-native navigation (`@amazon-devices/react-navigation__*`), Cartesian
  focus with accessible focus states (border + scale, never color alone),
  10-foot scaling, and a dependency-free gradient/vignette layer (Vega 1.2 has
  no linear-gradient package).
- Voice input via the platform's only supported path: a focused `TextInput`
  brings up the system keyboard whose mic lets the user hold the Alexa button to
  dictate (`com.amazon.inputmethod.service`).

**Backend (the AWS Builder piece)**
- **Amazon Bedrock (Nova Micro) via the Converse API**, behind **Amazon API
  Gateway (HTTP API) + AWS Lambda** with **least-privilege IAM**. The Lambda
  builds a context-grounded system prompt and returns a short, 10-foot answer.
  Live in the demo — the app receives real model answers (`fromFallback:false`).
- **Amazon Rekognition** powers the "What's in this scene?" computer-vision
  action: the same Lambda runs `DetectLabels` + `DetectText` on the content's
  image (in S3), then **chains the result into Bedrock Nova** to produce a
  natural scene description — two AWS AI services working together.
- No AWS credentials ever ship in the TV app; Bedrock/Rekognition are only
  called server-side. A deterministic seeded fallback (mirrored client + server)
  keeps the app answering if the model or network is unavailable.

## Challenges we ran into

Vega is a young platform, and building correctly meant discovering its edges
(full detail in our friction log):
- **No app-level speech-to-text** and **no app-level TTS** — so voice input uses
  the system-keyboard mic, and spoken output uses VoiceView. Both are the
  *supported* paths; we built to them instead of fighting them.
- **No video-frame-capture API**, which shaped what "computer vision" could be.
- Several packages (**linear-gradient, kepler-ui-components, react-native-screens**)
  aren't in the OS 1.2 profile — we worked around each.
- Public **Lambda Function URLs were blocked** on the account → we fronted the
  Lambda with **API Gateway**.
- **Claude** access was gated by an AWS **Marketplace billing** requirement;
  Amazon's first-party **Nova** models worked immediately.
- Certain MP4 codecs don't decode on the Vega simulator — we verified every clip.

## Accomplishments we're proud of

- A **working, platform-correct** Vega app verified on the Vega Virtual Device.
- A **live, deployed** Bedrock integration (not mocked) with graceful fallback.
- A genuinely new interaction: **talking to the timeline** — ask, navigate,
  revisit — plus proactive insights and a real accessibility story.

## What we learned

How to build *with* Vega's constraints rather than against them — W3C media,
the system-keyboard voice path, VoiceView for output — and how to keep an
on-device AI experience resilient (grounded prompts, explicit `maxTokens`,
adaptive retry, mirrored fallback).

## What's next

- Real detected scene boundaries (vs. curated moments) for proactivity.
- A first-class **"Describe this scene"** accessibility mode.
- Package SideKick as a **drop-in companion layer any streaming app can embed** —
  the pipeline is content-agnostic: it takes *what's playing + where you are + a
  question* and returns a grounded, timeline-anchored answer.

## Built with

Fire TV / Vega OS · React Native · `@amazon-devices/react-native-w3cmedia` ·
Amazon Bedrock (Nova) · Amazon Rekognition · AWS Lambda · Amazon API Gateway · IAM · VoiceView
