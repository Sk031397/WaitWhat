/**
 * Runtime configuration for SideKick.
 *
 * Set ASK_ENDPOINT to your deployed backend `/ask` URL (the SAM template
 * outputs it as `AskEndpoint`). Until you deploy, leave it as the placeholder:
 * the app detects the placeholder and shows a "not connected" message instead
 * of answering.
 *
 * You can also override at runtime without editing this file by calling
 * `setAskEndpoint(url)` from bedrockClient (e.g. from a dev/debug menu).
 */

// Deployed SideKick backend (API Gateway → Lambda → Amazon Bedrock Nova Lite).
export const ASK_ENDPOINT = 'https://u7ycv4t5kc.execute-api.us-east-1.amazonaws.com/ask';

/**
 * Shared key sent as `x-ww-key`; must match the Lambda's ASK_API_KEY. It ships
 * inside the app (and this repo is public), so it's a speed bump against
 * casual scanners, not a secret. API Gateway throttling is the real cost cap.
 */
export const ASK_API_KEY = 'ww_PTfoiXpATWW82NL9feMnega8';

/** True when no real endpoint has been configured yet. */
export const isPlaceholderEndpoint = (url: string): boolean =>
  !url || url.startsWith('REPLACE_WITH') || url.includes('your-api-id');
