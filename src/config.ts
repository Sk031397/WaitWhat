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

// Deployed SideKick backend (API Gateway → Lambda → Amazon Bedrock Nova Micro).
export const ASK_ENDPOINT = 'https://u7ycv4t5kc.execute-api.us-east-1.amazonaws.com/ask';

/** True when no real endpoint has been configured yet. */
export const isPlaceholderEndpoint = (url: string): boolean =>
  !url || url.startsWith('REPLACE_WITH') || url.includes('your-api-id');
