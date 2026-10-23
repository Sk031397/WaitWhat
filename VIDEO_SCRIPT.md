# Wait, What? — teleprompter script (read-on-camera, timed to ~2:45)

This is the word-for-word script to read while recording. Each block = one
on-screen action + the exact narration. Total target **2:45** (hard cap 3:00;
judges stop at 3:00). `[ACTION]` = what to do on screen; `"…"` = what you say.

Record at 1080p, VD with GUI. Keep each line tight — if you run long, cut the
**UNDER THE HOOD** block first (it's the only trimmable one).

---

## 0:00–0:15 · HOOK  (≈35 words)

`[ACTION]` Home screen. Slowly sweep focus across two or three cards so the
hero cross-fade, focus glow, and vignette all show.

> "Every time you watch something, you reach for your phone — who's that actor,
> what did I miss, what is this. **Wait, What? answers all of it on the TV, without
> pausing.** It turns the timeline into something you talk to."

`[DELIVERY]` Beat after "what is this." — then say the name "**Wait, What?**" as
the punchline (it echoes the confused questions you just listed), then continue.

---

## 0:15–0:50 · LIVE AI + TIMELINE ANCHOR  (≈70 words)

`[ACTION]` Open a show. Let it play 2–3 seconds (clearly live). Open **Ask
Wait, What?** — panel slides in. Focus the field, type/dictate: **"Who is in this
scene?"** Submit.

> "I open Wait, What? and just ask — and notice the show keeps playing underneath.
> I'm never pausing."

`[ACTION]` When the answer lands, point to the **"asked at 0:4X"** line and the
marker on the seek bar.

> "That's a **live Amazon Bedrock call**, grounded on the title, the episode,
> and the exact moment I asked — and it pins the answer right there on the
> timeline."

---

## 0:50–1:30 · NATURAL-LANGUAGE NAVIGATION (your signature)  (≈75 words)

`[ACTION]` Open the panel. Type/say: **"Take me to 0:10 and tell me what's
happening."** The playhead jumps to 0:10; a **⤷ Jumped to 0:10** pill appears and
the answer describes that moment.

> "I can just *tell* it where to go — and it both seeks there **and** explains
> the moment."

`[ACTION]` Open again, say **"Go to the middle."** Then **"Go to the end."** Let
the playhead jump each time.

> "A timestamp, or 'the middle', 'a quarter of the way', 'the end' — it
> understands and takes me there. It controls playback, so it never refuses to
> rewind."

---

## 1:30–2:00 · SPORTS MODE  (≈50 words)

`[ACTION]` Back out. Open a **Sports** game. UI re-themes green / "SPORTS
MODE". Ask **"Catch me up."** Live answer grounded on the game.

> "Open a game and the same gesture becomes a **sports companion** — it
> re-themes and catches me up, grounded on the game, so I can jump in late."

---

## 2:00–2:20 · SEES THE SCREEN + REVISIT THE TIMELINE  (≈50 words)

`[ACTION]` On Tears of Steel, ask "what's happening right now?".

> "It's looking at the actual frames up to where I am — not guessing, no spoilers."

`[ACTION]` Open controls, focus the **"Your questions:"** chips, select an
earlier one — it jumps back and re-shows that answer.

> "And every question I asked lives on the timeline — select one and it jumps
> back to that moment and brings the answer with it."

---

## 2:20–2:38 · UNDER THE HOOD (for the AWS + Vega judges)  (≈55 words) — TRIM FIRST IF LONG

`[ACTION]` Slow pan over the UI (or a one-line architecture caption).

> "Under the hood: every answer is a live **Amazon Bedrock Nova** call behind
> **API Gateway and Lambda** with least-privilege IAM — no credentials ever ship
> in the app. It's built on Vega's native **W3C media** stack, and answers are
> spoken through **VoiceView** for low-vision viewers."

---

## 2:38–2:45 · CLOSE  (≈25 words)

`[ACTION]` Return Home, one clean focus sweep.

> "Wait, What? — it understands what you're watching, and how *you* watch. One
> button, zero pauses. And it drops into any streaming app."

---

## Timing cheat-sheet
| Block | End time | Trim priority |
|---|---|---|
| Hook | 0:15 | keep |
| Live AI + anchor | 0:50 | keep |
| NL navigation | 1:30 | keep (signature) |
| Sports mode | 2:00 | keep |
| Sees the screen + revisit | 2:20 | keep |
| Under the hood | 2:38 | **cut first** |
| Close | 2:45 | keep |

## Delivery notes
- Say **"without pausing"** and **"live Amazon Bedrock call"** clearly — those are
  the two phrases that score Design + Tech.
- Let one answer **type out on screen** (the typewriter reveal) rather than
  cutting away — it proves it's live.
- If a take fumbles, keep rolling and redo the line; edit later. Clean takes of
  the **navigation** and **CV** beats matter most.
- Do NOT show console logs or simulator chrome — crop the capture to the VD screen.
- Don't name teams or ask for a score: the clips are license-clear amateur footage with no scoreboard.
