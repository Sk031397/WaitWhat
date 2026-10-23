# Wait, What? demo media

All swappable content is controlled from **one place**:
`src/data/catalog.ts` → the `MEDIA` map near the top.

For each catalog item id, set three strings:

```ts
movie03: {
  video:     'https://your-host/your-clip.mp4',
  thumbnail: 'https://your-host/your-card.jpg',   // ~420x260
  hero:      'https://your-host/your-hero.jpg',   // 1920x1080
},
```

Then make the item's `title`, `synopsis` and `context` in `CATALOG` describe what
the clip actually shows — the model trusts the real frames over the text, so a
mismatch produces confusing answers. Sports items (`contentType: 'sports'`)
switch the app into sports mode. Every item needs its own video (a test checks
this), so frames and insights line up with the right title.

## After changing any video
1. `scripts/extract-frames.sh` — re-extracts a 768px frame every 2s of every
   catalog video and uploads them to `s3://sidekickvegaos/frames/<videoId>/`.
   (Needs ffmpeg; set `FFMPEG=/path/to/ffmpeg`.) If you add a new URL, add it to
   the `VIDEOS` list in the script too.
2. `cd backend && npm run insights` — regenerates `src/data/insights.ts`. Short
   sports clips use the hand-checked notes in `MANUAL` in
   `backend/generateInsights.ts`; update those if you swap a sports clip.
3. Rebuild and reinstall the app.

## Easiest path: host the files somewhere reachable
Put your clips and poster art on any reachable HTTPS host (S3 bucket with public
read, a CDN, or your own server) and paste the URLs into `MEDIA`. The current
sports clips and posters live in the public `sidekickvegaos` S3 bucket (named
after the sport, e.g. `basketball.mp4` / `basketball.jpg`); uploading a new file
under the same name swaps it with no code change.

## Picking video that actually plays
Not every MP4 decodes on the Vega simulator. Before you record:
1. Point an item's `video` at your URL.
2. `npm run build:debug && vega run-app build/x86_64-debug/sidekick_x86_64.vpkg`
3. Open that item. If the screen is black, check the log:
   `vega device start-log-stream | grep -i "W3CMEDIA\|Forbidden\|error"`
   - `Forbidden (403)` → the URL isn't publicly reachable.
   - `KeplerMediaSink Invalid configuration` / stuck at 0.0s → the codec/container
     isn't accepted by the sim; re-encode as H.264/AAC MP4 (baseline/main profile).

Known-good samples in use: the Sintel trailer (`media.w3.org`), the Big Buck
Bunny 10s clip (`test-videos.co.uk`), and Tears of Steel, Cosmos Laundromat and
Glass Half from Amazon's vega-sports-app CDN.

## Bundling local files (optional)
Drop files in this folder (`assets/media/`) and reference their packaged path.
Bundled media on Vega is served from the app package, not a Metro `require()`.
If you go this route, build once, then check the packaged path in the device
logs and point `MEDIA[...].video` at it. Hosting remotely is simpler for a demo.

## Poster art tips (biggest perceived-quality win)
- The films' thumbnails and hero images are still `picsum.photos` placeholders —
  replace them first.
- Thumbnails: landscape, ~420×260, consistent style across a row.
- Hero: 1920×1080, with visual interest on the RIGHT side (the left is covered
  by the gradient scrim + title text).
