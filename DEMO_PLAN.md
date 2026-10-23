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
   answers "catch me up" / "what's the score" grounded on the game (Idea + sports).
4. **It sees the screen** — "what's happening right now?" answered from the real frames (Idea + multi-modal).
5. **Accessible by design** — answers spoken via VoiceView for low-vision
   viewers; non-blocking, platform-correct (Design/Impact).

> NOTE: Wait, What? has two modes from one gesture. **Companion mode** (shows/movies)
> answers anything, grounded on the real frames. **Sports mode** (a "Live Sports"
> row of 9 games) re-themes and grounds its live Bedrock answers on the game
> context (teams, venue, situation). All teams/players are **made-up** (no real
> leagues/trademarks) over **real, license-clear sports footage** the team hosts
> on S3: basketball, football, hockey, soccer, tennis, boxing, wrestling, baseball,
> and rowing.

---

## Before you hit record (checklist)

- [ ] **Real content** swapped into `src/data/catalog.ts` → `MEDIA` (poster art +
      your own clips). Test each plays on the sim. Biggest visual-quality lever.
- [ ] Live backend confirmed: `curl` the endpoint and verify it returns `{"text": ...}`
      (with the `x-ww-key` header from `src/secrets.ts`).
      (Live on Amazon Bedrock Nova Lite via API Gateway + Lambda; `ASK_ENDPOINT`
      is already wired in `src/config.ts`.)
- [ ] `npm run build:debug` then `vega run-app build/x86_64-debug/sidekick_x86_64.vpkg`
- [ ] Virtual device started **with GUI**: `vega virtual-device start --gui`
      (the VD stops on idle — restart if needed).
- [ ] Screen-record the VD window at 1080p. Know the remote/keyboard mapping.
- [ ] Rehearse the ask flow: open panel → focus the field (keyboard/mic comes
      up) → type/dictate → Ask. Have your exact phrases ready so takes are clean.

---

## The script (shot by shot)

### 0:00–0:18 — The hook
Home screen; slowly move focus across cards (hero cross-fade + spring-glow focus,
cinematic vignette all show here).
> "Every time you watch something, you reach for your phone — who's that actor,
>  what did I miss, what's this scene. Wait, What? answers all of it **on the TV,
>  without pausing**, because it knows what you're watching and exactly where you
>  are in it."

### 0:18–1:00 — Live AI + timeline anchor (the core)
Open a show. Let playback run 2–3s (obviously live). Open **Ask Wait, What?** — the
panel slides out. Focus the field (keyboard/mic comes up) and ask:
**"Who is in this scene?"**
> "I'm not pausing — the show keeps playing."
When the answer lands, point to the **"asked at 0:41"** line + the seek-bar marker.
> "That's a live **Amazon Bedrock** call, grounded on the title, the episode, and
>  the exact moment — and it pinned the answer right there on the timeline."

### 1:00–1:40 — Natural-language navigation (the "it really gets me" beat)
Open the panel again and type/say navigation phrases, letting the playhead jump:
- **"Take me to 0:10 and tell me what's happening"** → video jumps to 0:10, a
  **⤷ Jumped to 0:10** pill shows, and the answer describes that moment.
- **"Go to the middle"** → jumps to the midpoint. Then **"go to the end"**.
> "I can just *tell* it where to go — a timestamp, or 'the middle', 'a quarter of
>  the way', 'the end'. It understands and takes me there — and it never
>  apologizes about rewinding, because it actually controls playback."

### Sports mode (context-aware — for the sports judge)
Back out, open a **Live Sports** game (e.g. Coastal Kings vs. Summit City —
basketball, or Ironside vs. Crestfall — baseball). The UI re-themes (green
accent, SPORTS MODE). Ask **"Catch me up"** or **"What's the score?"** → a live
Bedrock answer grounded on the game context (teams, venue, situation).
> "On a game, Wait, What? knows it's sports — it re-themes and answers in the
>  moment, grounded on the game, so I can jump in late and catch up."
(Teams/players are fictional; the footage is our own license-clear sports clips —
nine sports total: basketball, football, hockey, soccer, tennis, boxing, wrestling,
baseball, and rowing.)

### It sees the screen
Open Tears of Steel, let it play a little, and ask "what's happening right now?".
> "It isn't guessing from a synopsis — it's looking at the actual frames up to
>  where I am, so it can't spoil what's ahead."

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
- "any streaming app could embed this" — beyond-hackathon scale (good for the close
  or the written description).

## Don't
- Don't over-explain the voice limitation. Use the text/mic box naturally. In the
  written feedback, be honest: Vega has no app-level STT, so Wait, What? uses the
  platform's system-keyboard mic — the correct, supported path.
- Don't imply the sports teams/leagues are real — they're invented. If asked,
  say the footage is your own license-clear clips and the teams are made up.
  Sports mode re-themes and grounds its live Bedrock answers on the game context.
- Don't show console logs or simulator chrome; crop them out.
- Don't exceed 3:00. If tight, trim the under-the-hood voiceover first.

## Fallback if something misbehaves on the day
- **Video black?** Almost always the clip/codec, not the app — point that item's
  `video` in `MEDIA` at the known-good Sintel URL and rebuild.
- **Answer says "Couldn't reach Wait, What?"?** The backend/network hiccuped.
  Re-try; if persistent, check the key in `src/secrets.ts` matches the Lambda.
- **Navigation didn't jump?** Fractional phrases ("the middle/end/quarter") need
  the clip's duration to be loaded — give it a second after opening the player,
  then ask. Explicit times ("0:10") work immediately.
- **Marker chip missing?** You must have asked at least one question that session.
- **VD stopped?** `vega virtual-device start --gui`, then reinstall + launch.
