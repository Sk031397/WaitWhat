# Wait, What? — 3-minute demo recording plan

**The one line:** *"Wait, What? turns the timeline into something you talk to."*
Say it near the top and let the demo prove it.

Judges don't have to watch past 3:00, so **lead with the wow**. Target ~2:40.

Panel to play to: Fire TV **Voice & AI** leads, the **NBA / sports** PM, and
**AWS Bedrock** people. The script hits all three and showcases its
headline moments:
1. **Talk to your timeline** — ask, then navigate by natural language, then
   revisit any question on the scrubber (Idea — your signature).
2. **Live Bedrock answer** (real model answer, never canned) — Tech.
3. **Context-aware sports mode** — open a game and Wait, What? re-themes and
   answers "catch me up" / "break down this play" grounded on the game (Idea + sports).
4. **It sees the screen** — "what's happening right now?" answered from the real frames (Idea + multi-modal).
5. **It anticipates** — a ✨ scene-insight card surfaces on its own at a new scene (Idea).
6. **Accessible by design** — answers spoken via VoiceView for low-vision
   viewers; non-blocking, platform-correct (Design/Impact).

> NOTE: Wait, What? has two modes from one gesture. **Companion mode** (films)
> answers anything, grounded on the real frames. **Sports mode** (a "Sports"
> row of 9 games) re-themes and grounds its live Bedrock answers on the game
> context and the real frames. Titles describe what each clip actually shows; there
> are no real teams or leagues, just **real, license-clear amateur footage** hosted
> on S3: basketball, football, hockey, soccer, tennis, boxing, wrestling, baseball,
> and rowing.

---

## Before you hit record (checklist)

- [ ] **Poster art**: the films' thumbnails/hero images are still `picsum.photos`
      placeholders in `src/data/catalog.ts` → `MEDIA`. Swap in real art (biggest
      visual-quality lever). If you change any video, rerun
      `scripts/extract-frames.sh` and `cd backend && npm run insights`, then rebuild.
- [ ] Live backend confirmed: `curl` the endpoint and verify it returns `{"text": ...}`
      (with the `x-ww-key` header from `src/secrets.ts`).
      (Live on Amazon Bedrock Nova Lite via API Gateway + Lambda; `ASK_ENDPOINT`
      is already wired in `src/config.ts`.)
- [ ] `npm run build:debug` then `vega run-app build/x86_64-debug/sidekick_x86_64.vpkg`
- [ ] Virtual device started **with GUI**: `vega virtual-device start --gui`
      (the VD stops on idle — restart if needed).
- [ ] Screen-record the VD window at 1080p. Know the remote/keyboard mapping.
- [ ] Rehearse the ask flow: **hold Menu (☰)** → panel opens with the field
      focused (keyboard/mic comes up) → type/dictate → Ask. Confirm on screen that
      the hold works on your remote/keyboard mapping; the tab is the fallback.
      Have your exact phrases ready so takes are clean.

---

## The script (shot by shot)

### 0:00–0:18 — The hook
Home screen; slowly move focus across cards (hero cross-fade + spring-glow focus,
cinematic vignette all show here).
> "Every time you watch something, you reach for your phone — who's that actor,
>  what did I miss, what's this scene. Wait, What? answers all of it **on the TV,
>  without pausing**, because it knows what you're watching and exactly where you
>  are in it."

### 0:18–1:00 — Scene insight, then live AI + timeline anchor (the core)
Open **Tears of Steel** and let it play. At **0:10** a **✨ SCENE INSIGHT** card
appears on its own.
> "I didn't ask anything — it noticed the new scene and told me what's on screen."
Now **hold Menu (☰)**: the panel slides out with the field focused (keyboard/mic
comes up). Ask: **"What's happening right now?"**
> "I'm not pausing — the film keeps playing."
When the answer lands, point to the **"asked at 0:XX"** line + the seek-bar marker.
> "That's a live **Amazon Bedrock** call, looking at the actual frames up to this
>  moment — and it pinned the answer right there on the timeline."

### 1:00–1:40 — Natural-language navigation (the "it really gets me" beat)
Open the panel again and type/say navigation phrases, letting the playhead jump:
- **"Take me to 0:10 and tell me what's happening"** → video jumps to 0:10, a
  **⤷ Jumped to 0:10** pill shows, and the answer describes that moment.
- **"Go to the middle"** → jumps to the midpoint. Then **"go to the end"**.
> "I can just *tell* it where to go — a timestamp, or 'the middle', 'a quarter of
>  the way', 'the end'. It understands and takes me there — and it never
>  apologizes about rewinding, because it actually controls playback."

### Sports mode (context-aware — for the sports judge)
Back out, open a **Sports** game (e.g. Blacktop 1-on-1 — basketball, or
Five-a-Side — soccer). The UI re-themes (green
accent, SPORTS MODE). Ask **"Catch me up"** or **"Break down this play"** → a live
Bedrock answer grounded on what's actually on screen.
> "On a game, Wait, What? knows it's sports — it re-themes and answers in the
>  moment, grounded on the game, so I can jump in late and catch up."
(No real teams or leagues; the footage is license-clear amateur sports clips —
nine sports total: basketball, football, hockey, soccer, tennis, boxing, wrestling,
baseball, and rowing.)

(That beat already shows **it sees the screen**: it describes the real frames up
to your position, so it can't spoil what's ahead.)

### 2:00–2:20 — Revisit the timeline (navigable Q&A)
Open the controls; focus the **"Your questions:"** chips. Select an earlier one.
> "Every question I asked is saved on the timeline — select one and Wait, What?
>  jumps back to that moment and brings the answer with it."

### 2:20–2:40 — Under the hood (for the AWS judges)
Voiceover over the UI:
> "Every answer is a live **Amazon Bedrock** call, grounded on the content and
>  timestamp, behind **API Gateway + Lambda** with least-privilege IAM — no
>  credentials ever ship in the TV app. Built on Vega's native **W3C media**
>  stack, not react-native-video. Answers are announced through **VoiceView**
>  so low-vision viewers hear what's on screen."

### 2:40–2:50 — Close
Home, one clean focus sweep.
> "Wait, What? — the companion that understands what you're watching, and how *you*
>  watch. One button, zero pauses."

---

## Lines that score points
- "without pausing" — say it twice; it's the design thesis.
- "live Amazon Bedrock call" — you earned it; it's real (no canned answers).
- "it understands and takes me there" — the navigation beat.
- "jumps back to that moment and brings the answer with it" — the navigable timeline.
- "announced through VoiceView for low-vision viewers" — the accessibility impact.
- "I didn't ask anything" — the scene-insight beat (it anticipates).
- "any streaming app could embed this" — beyond-hackathon scale (good for the close
  or the written description).

## Don't
- Don't over-explain the voice limitation. Use the text/mic box naturally. In the
  written feedback, be honest: Vega has no app-level STT, so Wait, What? uses the
  platform's system-keyboard mic — the correct, supported path.
- Don't imply the sports teams/leagues are real — there are none. If asked, say
  the footage is license-clear amateur clips and no score is shown in them.
  Sports mode re-themes and grounds its live Bedrock answers on the game context.
- Don't show console logs or simulator chrome; crop them out.
- Don't exceed 3:00. If tight, trim the under-the-hood voiceover first.

## Fallback if something misbehaves on the day
- **Video black?** Almost always the clip/codec, not the app — point that item's
  `video` in `MEDIA` at the known-good Sintel URL and rebuild.
- **Answer says "Couldn't reach Wait, What?"?** The backend/network hiccuped.
  Re-try; if persistent, check the key in `src/secrets.ts` matches the Lambda.
- **Hold Menu didn't open the panel?** Select the **Ask Wait, What?** tab instead
  (it says "or hold ☰"); the rest of the flow is identical.
- **No insight card?** It only fires during normal playback (not after a seek past
  it) and not while the panel is open — restart the title and keep the panel
  closed until 0:10.
- **Navigation didn't jump?** Fractional phrases ("the middle/end/quarter") need
  the clip's duration to be loaded — give it a second after opening the player,
  then ask. Explicit times ("0:10") work immediately.
- **Marker chip missing?** You must have asked at least one question that session.
- **VD stopped?** `vega virtual-device start --gui`, then reinstall + launch.
