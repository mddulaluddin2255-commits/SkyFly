/**
 * Adsterra Network & Sponsored Rewards Integration Bridge for SkyFly Arcade
 * 
 * Configured Adsterra Units:
 * - Native Banner Container: container-dcdee03b89e85a9a708ea876b43a2e2e
 * - Native Banner Invoke: https://pl31319398.profitableratecpmnetwork.com/dcdee03b89e85a9a708ea876b43a2e2e/invoke.js
 * - Network Script: https://pl31319429.profitableratecpmnetwork.com/e9/ad/dd/e9addde329b6259b2112a860027e0059.js
 * 
 * Rules:
 * - Reward: Exactly 100 virtual points upon viewing sponsored Adsterra ad.
 * - Single-use tokens prevent duplicate credit.
 */

export const ADSTERRA_CONFIG = {
  network: 'Adsterra',
  nativeContainerId: 'container-dcdee03b89e85a9a708ea876b43a2e2e',
  nativeBannerScript: 'https://pl31319398.profitableratecpmnetwork.com/dcdee03b89e85a9a708ea876b43a2e2e/invoke.js',
  networkScript: 'https://pl31319429.profitableratecpmnetwork.com/e9/ad/dd/e9addde329b6259b2112a860027e0059.js',
  rewardPoints: 100,
};

// Backwards compatibility alias if referenced elsewhere
export const ADMOB_CONFIG = {
  clientId: 'adsterra-network',
  appId: 'adsterra-network',
  adSlot: 'dcdee03b89e85a9a708ea876b43a2e2e',
  adName: 'Adsterra Native',
  rewardedAdUnitId: 'adsterra-rewarded',
  rewardPoints: 100,
};

export interface AdRewardResult {
  rewarded: boolean;
  rewardToken: string;
  points: number;
}

// Memory cache of redeemed reward tokens
const processedRewardTokens = new Set<string>();

export function isRewardTokenUsed(token: string): boolean {
  return processedRewardTokens.has(token);
}

export function markRewardTokenUsed(token: string): boolean {
  if (processedRewardTokens.has(token)) {
    return false; // Already processed
  }
  processedRewardTokens.add(token);
  return true;
}

export function generateRewardToken(): string {
  const token = `adsterra_rew_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  markRewardTokenUsed(token);
  return token;
}
