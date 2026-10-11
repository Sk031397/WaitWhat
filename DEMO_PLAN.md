# SideKick — 3-minute demo recording plan

Judges don't have to watch past 3:00, so **lead with the wow**. Target ~2:50.

Panel to play to: Fire TV **Voice & AI** leads, an **NBA** product manager, and
**AWS Bedrock** people. The script hits all three, and showcases the four
headline moments:
1. **Live Bedrock answer** (real, `fromFallback:false`) — Tech
2. **Mode sweep** general→sports re-theme — Design + context-awareness
3. **Proactive ⚡ BIG PLAY** (surfaces before you ask) — Idea + NBA
4. **📌 Adaptive learning** (SideKick pins what you keep asking about) — Idea

---

## Before you hit record (checklist)

- [ ] **Real content** swapped into `src/data/catalog.ts` → `MEDIA` (poster art +
      a real show clip + a real sports clip). Test each plays on the sim. This is
      the single biggest visual-quality lever left.
- [ ] Live backend confirmed: `curl` the endpoint and verify `"fromFallback":false`.
      (It is live on Amazon Bedrock Nova Micro via API Gateway + Lambda; the app's
      `ASK_ENDPOINT` is already wired.)
- [ ] `npm run build:debug` then `vega run-app build/x86_64-debug/sidekick_x86_64.vpkg`
- [ ] Virtual device started **with GUI**: `vega virtual-device start --gui`
      (the VD stops on idle — restart if needed).
- [ ] Screen-record the VD window at 1080p. Know the remote/keyboard mapping.
- [ ] Rehearse timing: the **mode sweep** plays for ~2s when the player opens, and
      the **⚡ BIG PLAY** auto-fires ~8s into the sports clip. Let both land.
- [ ] To show **adaptive learning**, plan to ask about the same player **twice** —
      the second ask triggers the 📌 Pinned banner.

---

## The script (shot by shot)

### 0:00–0:18 — The hook
Home screen; slowly move focus across cards (hero cross-fade + spring-glow focus,
cinematic vignette all show here).
> "Every time you watch, you reach for your phone — who's that actor, what are his
>  stats, what did I miss. SideKick answers all of it **on the TV, without
>  pausing** — and it changes what it can do based on what you're watching."

### 0:18–0:55 — General mode + live AI + timeline anchor
Open a show. Playback runs 2–3s (obviously live). Open **Ask SideKick** (panel
slides out). Ask: **"Who is in this scene?"**
> "I'm not pausing — the show keeps playing."
When the answer lands, point to the **"asked at 0:41"** line + the seek-bar marker.
> "That's a live **Amazon Bedrock** call, grounded on the title, the episode, and
>  the exact moment — and it pinned the answer to that spot on the timeline."

### 0:55–1:50 — Sports mode: the mode sweep + proactive + the money shot
Back out, open the **sports** clip. **Let the mode sweep play** — the banner
sweeps in: *SPORTS MODE · stats unlocked*, accent shifts green.
> "Same one gesture — but it recognized live sports and re-themed itself. Stats
>  unlocked."
Ask: **"What are Okafor's stats?"** → refined StatCard (season-high chip on PTS).
Then let playback hit ~8s and the **⚡ BIG PLAY** card auto-surfaces:
> "And it doesn't wait to be asked — it flagged the season-high **the moment it
>  happened**."  ← the memorable beat; pause so it lands.

### 1:50–2:20 — Adaptive learning (the "it learns you" beat)
Ask about Okafor a **second** time (e.g., "How many rebounds does Okafor have?").
The **📌 Pinned · A. Okafor** banner appears with his stats pre-surfaced.
> "I keep asking about Okafor — so SideKick learned it, and pinned him. It adapts
>  to how *I* watch. That's not scripted; it's tracking what I care about."

### 2:20–2:40 — Under the hood (for the AWS judges)
Voiceover over the UI:
> "Every answer is **Amazon Bedrock Nova**, grounded on the content and timestamp,
>  behind **API Gateway + Lambda** with least-privilege IAM — no credentials ever
>  ship in the TV app. Built on Vega's native **W3C media** stack, not
>  react-native-video, and the answers are read aloud through **VoiceView** for
>  low-vision viewers."

### 2:40–2:50 — Close
Home, one clean focus sweep.
> "SideKick — the companion that understands what you're watching, and how *you*
>  watch. One button, two modes, zero pauses."

---

## Lines that score points
- "without pausing" — say it twice; it's the design thesis.
- "live Amazon Bedrock call" — you earned this; it's real (`fromFallback:false`).
- "the moment it happened" — the proactive beat.
- "it learned it, and pinned him" — the adaptive beat (your most novel moment).
- "read aloud through VoiceView for low-vision viewers" — the accessibility impact.
- "any streaming app could embed this" — beyond-hackathon scale.

## Don't
- Don't over-explain the voice limitation. Use the text/mic box naturally. In the
  written feedback, be honest: Vega has no app-level STT, so SideKick uses the
  platform's system-keyboard mic — the correct, supported path.
- Don't show console logs or simulator chrome; crop them out.
- Don't exceed 3:00. If tight, trim the under-the-hood voiceover first.

## Fallback if something misbehaves on the day
- **Video black?** Almost always the clip/codec, not the app — point that item's
  `video` in `MEDIA` at the known-good Sintel URL and rebuild.
- **Answer shows "offline answer"?** The backend/network hiccuped; the seeded
  fallback answered. Re-try; if persistent, don't claim "live" for that take.
- **Proactive card didn't fire?** Fires once per session at ~8s — relaunch and let
  the sports clip play from the start.
- **Pinned banner didn't appear?** It needs the **same player** asked about twice
  in one session — ask about Okafor a second time.
- **VD stopped?** `vega virtual-device start --gui`, then reinstall + launch.
