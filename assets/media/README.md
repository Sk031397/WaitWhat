# SideKick demo media

All swappable content is controlled from **one place**:
`src/data/catalog.ts` → the `MEDIA` map near the top.

For each catalog item id, set three strings:

```ts
show01: {
  video:     'https://your-host/northern-expanse-clip.mp4',
  thumbnail: 'https://your-host/northern-card.jpg',   // ~420x260
  hero:      'https://your-host/northern-hero.jpg',    // 1920x1080
},
```

## Easiest path: host the files somewhere reachable
Put your clips and poster art on any reachable HTTPS host (S3 bucket with public
read, a CDN, or your own server) and paste the URLs into `MEDIA`. This is the
most reliable option and needs no build changes.

## Picking video that actually plays
Not every MP4 decodes on the Vega simulator. Before you record:
1. Point an item's `video` at your URL.
2. `npm run build:debug && vega run-app build/x86_64-debug/sidekick_x86_64.vpkg`
3. Open that item. If the screen is black, check the log:
   `vega device start-log-stream | grep -i "W3CMEDIA\|Forbidden\|error"`
   - `Forbidden (403)` → the URL isn't publicly reachable.
   - `KeplerMediaSink Invalid configuration` / stuck at 0.0s → the codec/container
     isn't accepted by the sim; re-encode as H.264/AAC MP4 (baseline/main profile).

Known-good samples (used by default): the Sintel trailer and the small
Big Buck Bunny 10s clip from `media.w3.org` / `test-videos.co.uk`.

## Bundling local files (optional)
Drop files in this folder (`assets/media/`) and reference their packaged path.
Bundled media on Vega is served from the app package, not a Metro `require()`.
If you go this route, build once, then check the packaged path in the device
logs and point `MEDIA[...].video` at it. Hosting remotely is simpler for a demo.

## Poster art tips (biggest perceived-quality win)
- Thumbnails: landscape, ~420×260, consistent style across a row.
- Hero: 1920×1080, with visual interest on the RIGHT side (the left is covered
  by the gradient scrim + title text).
