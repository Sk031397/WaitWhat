/**
 * Runtime configuration for SideKick.
 *
 * Set ASK_ENDPOINT to your deployed backend `/ask` URL (the SAM template
 * outputs it as `AskEndpoint`). Until you deploy, leave it as the placeholder:
 * the app detects the placeholder and runs on the local seeded fallback so the
 * demo still works end-to-end offline.
 *
 * You can also override at runtime without editing this file by calling
 * `setAskEndpoint(url)` from bedrockClient (e.g. from a dev/debug menu).
 */

// Replace with your Lambda Function URL / API Gateway URL after deploy, e.g.
//   https://abc123.lambda-url.us-east-1.on.aws/
export const ASK_ENDPOINT = 'REPLACE_WITH_DEPLOYED_ASK_URL';

/** True when no real endpoint has been configured yet. */
export const isPlaceholderEndpoint = (url: string): boolean =>
  !url || url.startsWith('REPLACE_WITH') || url.includes('your-api-id');
