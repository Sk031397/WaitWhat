# Wait, What? — Devpost submission (copy-paste into the form fields)

Each `##` heading below maps to a field on the Devpost "Enter a Submission" page.
Paste the body of each section into the matching field. Fill the bracketed
`[…]` placeholders before submitting.

---

## Project name
Wait, What? — talk to your timeline

## Elevator pitch (one sentence, ~200 char field)
Ask about anything you're watching — without pausing. Wait, What? answers on the TV
via live Amazon Bedrock, lets you navigate by natural language, and anchors every
answer to the moment on your timeline.

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
("take me to the middle"), and proactively surfaces what matters.

### What it does
While a show plays full-screen (playback never stops):
- **Ask about anything on screen** — a live **Amazon Bedrock** answer, grounded
  on the title, synopsis, cast, and your exact playback position, in a
  non-blocking side panel.
- **Talk to your timeline** — say where to go in plain language ("take me to
  0:10 and tell me what's happening," "go to the middle," "a quarter of the way,"
  "go to the end"); Wait, What? seeks there **and** explains the moment. It controls
  playback — it never refuses to rewind.
- **Every question lives on the scrubber** — each ask drops a marker; a "Your
  questions" row lets you jump back to any moment and re-surface its answer.
- **Sports mode** — open a game and the same gesture re-themes and grounds live
  Bedrock answers on the game context (teams, venue, situation) so "catch me up"
  / "what's the score" answer in the moment. Teams/players are fictional over our
  own license-clear footage.
- **It anticipates** — proactive scene insights surface without being asked.
- **It's accessible** — answers are announced through **VoiceView** for
  low-vision viewers.

### How we built it
- **Fire TV / Vega OS, React Native.** Correct Vega media stack:
  `@amazon-devices/react-native-w3cmedia` (W3C MSE/EME), *not*
  `react-native-video` (unsupported on Vega), wrapped behind a familiar player
  API over `VideoPlayer` + `KeplerVideoSurfaceView`. Vega-native navigation,
  accessible 10-foot focus (border + scale, never color alone), dependency-free
  gradient/vignette. Voice input via the supported system-keyboard mic path.
- **Backend (AWS Builder).** **Amazon Bedrock Nova Micro** via the Converse API
  behind **API Gateway (HTTP API) + Lambda** with **least-privilege IAM**;
  context-grounded prompt, live (`fromFallback:false`). No AWS credentials ship
  in the TV app; a mirrored seeded fallback keeps it answering offline.

### Challenges we ran into
Vega is a young platform (full detail in our friction log): no app-level STT (we
use the system-keyboard mic) and no app-level TTS (we use VoiceView); no
video-frame-capture API; several packages absent from the OS 1.2 profile; public
Lambda Function URLs blocked on the account (we used API Gateway); and Claude
gated by AWS Marketplace billing (we used first-party Nova, which worked
instantly).

### Accomplishments we're proud of
A working, platform-correct Vega app verified on the Vega Virtual Device; a live,
deployed Bedrock integration (not mocked) with graceful fallback; and a genuinely
new interaction — talking to the timeline (ask, navigate, revisit) — plus
proactive insights and a real accessibility story.

### What we learned
How to build *with* Vega's constraints rather than against them (W3C media, the
system-keyboard voice path, VoiceView), and how to keep an on-device AI
experience resilient (grounded prompts, explicit `maxTokens`, adaptive retry,
mirrored fallback).

### What's next
Real detected scene boundaries for proactivity; a first-class "Describe this
scene" accessibility mode; and packaging Wait, What? as a drop-in companion layer
any streaming app can embed — the pipeline is content-agnostic.

---

## Built with  (tags field — comma-separated)
fire-tv, vega-os, react-native, amazon-bedrock, amazon-nova,
aws-lambda, amazon-api-gateway, aws-iam, w3c-media, voiceview, typescript

---

## Primary track
Fire TV (Vega OS)

## Priority categories (select/mention)
AI-enhanced viewing · sports · multi-modal UX · accessibility

## Mini challenge(s) entered
AWS Builder

---

## "Try it out" / links
- GitHub repo: [ PASTE REPO URL ]
- Demo video (YouTube/Vimeo, public, <3:00): [ PASTE VIDEO URL ]

---

## PRODUCT FEEDBACK  (required field — this is what earns the ≤10% bonus; answer all 5)

**1) Which developer tools, APIs, and SDKs did you use, and for what?**
- `@amazon-devices/react-native-w3cmedia` — video playback (W3C MSE/EME) on Vega.
- `@amazon-devices/react-navigation__*` — Vega-native stack navigation.
- Vega CLI (`vega project install` / `update-manifest` / `doctor`, `vega
  run-app`) + the RN 0.72 template — scaffold, manifest/module management, build,
  and deploy to the Vega Virtual Device.
- Vega manifest services — media, audio, network, and the system IME
  (`com.amazon.inputmethod.service`) for the keyboard-mic voice path.
- **Amazon Bedrock (Nova Micro)** via `@aws-sdk/client-bedrock-runtime` Converse
  API — the grounded Q&A answers.
- **AWS Lambda + API Gateway (HTTP API) + IAM** — the serverless `/ask` endpoint
  with least-privilege permissions.
- **VoiceView** (via `AccessibilityInfo.announceForAccessibility`) — spoken
  answers for low-vision viewers.

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
- **No video-frame-capture API** on Vega — noted and worked around.
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
## field — 13 structured entries, Task → Steps → Expected vs Actual → Severity →
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
- [ ] Demo video public on YouTube/Vimeo, **< 3:00**, shows it running on the
      Vega simulator, **no third-party trademarks or unlicensed music**.
- [ ] Repo is **public + OSS license visible** OR **private + shared** with:
      chris-trag, knmeiss, giolaq, anishamalde, mosesroth, emersonsklar.
- [ ] Repo has clear setup/run instructions (README covers this).
- [ ] Product Feedback field filled (all 5 answers above).
- [ ] Friction log pasted into its field (the ≤10% bonus).
- [ ] Primary track = Fire TV; Mini challenge = AWS Builder (both selected).
- [ ] Links filled: repo URL + video URL.
