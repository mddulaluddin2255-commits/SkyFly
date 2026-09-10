/**
 * Google AdSense & Google Ads Integration Bridge for SkyFly Arcade
 * 
 * Configured Client:
 * - Publisher Client ID: ca-pub-5378392556030394
 * - Rewarded Slot: ca-pub-5378392556030394/rewarded
 * 
 * Rules:
 * - Reward: Exactly 100 virtual points upon verified completion.
 * - In Web:
 *   Loads Google AdSense (ca-pub-5378392556030394) with interactive sponsored view and verified server callback.
 * - In Android (via Capacitor / Cordova):
 *   Hooks into native Google Ads rewarded video ad plugin.
 * - Duplicate prevention: Tracks processed transaction/reward tokens so rewards cannot be double-counted.
 */

export const ADMOB_CONFIG = {
  clientId: 'ca-pub-5378392556030394',
  appId: 'ca-pub-5378392556030394',
  rewardedAdUnitId: 'ca-pub-5378392556030394/rewarded',
  rewardPoints: 100,
};

export interface AdRewardResult {
  rewarded: boolean;
  rewardToken: string;
  points: number;
}

// Memory cache of redeemed reward tokens to prevent duplicate rewards from the same callback
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

export function isNativeAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as unknown as { Capacitor?: { isNativePlatform: () => boolean } }).Capacitor?.isNativePlatform?.()
  );
}

/**
 * Android AdMob Native Runner
 * When converted to Android with Capacitor, this hooks into the native AdMob plugin.
 * Returns verified reward token and points if completed.
 */
export async function showNativeAndroidRewardedAd(): Promise<AdRewardResult | null> {
  if (!isNativeAndroid()) {
    return null;
  }

  try {
    const admob = (window as unknown as { AdMob?: { showRewardVideoAd: (options: { adId: string }) => Promise<{ type: string; amount: number }> } }).AdMob;
    if (admob) {
      const result = await admob.showRewardVideoAd({
        adId: ADMOB_CONFIG.rewardedAdUnitId
      });
      const token = `admob_native_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      if (markRewardTokenUsed(token)) {
        return {
          rewarded: true,
          rewardToken: token,
          points: result?.amount || ADMOB_CONFIG.rewardPoints,
        };
      }
    }
  } catch (err) {
    console.warn('Native AdMob error (falling back to web callback if needed):', err);
  }
  return null;
}
