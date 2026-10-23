#!/usr/bin/env bash
# Extract real frames from every catalog video and upload them to S3, so the
# /ask backend can show Nova what's actually on screen at the asked moment.
#
#   scripts/extract-frames.sh            # extract + upload all
#   scripts/extract-frames.sh --no-upload
#
# Layout: s3://$BUCKET/frames/<videoId>/<second>.jpg, one frame every
# $STEP seconds. <videoId> is the video file name without extension — the same
# id the app sends (see videoIdFor in src/sidekick/ModeRouter.ts).
#
# Needs ffmpeg on PATH, or set FFMPEG=/path/to/ffmpeg (e.g. from the npm
# package ffmpeg-static).
set -euo pipefail

BUCKET="${BUCKET:-sidekickvegaos}"
STEP=2         # must match FRAME_STEP_S in backend/handler.ts
WIDTH=512
FFMPEG="${FFMPEG:-$(command -v ffmpeg || true)}"
[ -x "$FFMPEG" ] || { echo "ffmpeg not found; set FFMPEG=/path/to/ffmpeg" >&2; exit 1; }

# Every distinct video URL in src/data/catalog.ts.
S3="https://$BUCKET.s3.us-east-1.amazonaws.com"
CDN=https://d1v0fxmwkpxbrg.cloudfront.net/videos/mp4
VIDEOS=(
  https://media.w3.org/2010/05/sintel/trailer.mp4
  https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4
  "$CDN/tears-of-steel/720p/tears-of-steel.mp4"
  "$CDN/cosmos-laundromat/720p/cosmos-laundromat.mp4"
  "$CDN/glass-half/720p/glass-half.mp4"
)
for s in basketball american_football hockey soccer tennis boxing wrestling baseball rowing; do
  VIDEOS+=("$S3/$s.mp4")
done

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
OUT="$WORK/frames"

for url in "${VIDEOS[@]}"; do
  id="$(basename "${url%%\?*}")"; id="${id%.*}"
  echo "== $id"
  curl -sfL --retry 3 -o "$WORK/video" "$url"
  mkdir -p "$WORK/raw" "$OUT/$id"
  # One frame per STEP seconds starting at 0; frame N (1-based) is at (N-1)*STEP.
  "$FFMPEG" -loglevel error -y -i "$WORK/video" \
    -vf "fps=1/$STEP,scale=$WIDTH:-2" -q:v 5 "$WORK/raw/%d.jpg"
  for f in "$WORK"/raw/*.jpg; do
    n="$(basename "$f" .jpg)"
    mv "$f" "$OUT/$id/$(( (n - 1) * STEP )).jpg"
  done
  echo "   $(ls "$OUT/$id" | wc -l) frames"
  rm -rf "$WORK/raw" "$WORK/video"
done

if [ "${1:-}" = "--no-upload" ]; then
  mkdir -p ./frames-out && cp -r "$OUT"/. ./frames-out/
  echo "Frames written to ./frames-out (not uploaded)."
else
  aws s3 sync "$OUT" "s3://$BUCKET/frames/" --content-type image/jpeg --only-show-errors
  echo "Uploaded to s3://$BUCKET/frames/"
fi
