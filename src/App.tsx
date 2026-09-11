/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameScreen, GameSettings, FlightRound, UserProfile } from './types';
import { FlightCanvas } from './components/FlightCanvas';
import { HomeScreen } from './components/HomeScreen';
import { GameHUD } from './components/GameHUD';
import { GameOverModal } from './components/GameOverModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SettingsModal } from './components/SettingsModal';
import { AdModal } from './components/AdModal';
import { SignUpScreen } from './components/SignUpScreen';
import { SignInScreen } from './components/SignInScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { soundService } from './services/sound';
import {
  auth,
  getGuestProfile,
  subscribeToUserProfile,
  deductFlightCostPoints,
  creditRewardedAdPoints,
  creditClaimedScorePoints,
  reportFlightCrash,
  signOutPlayer,
  createDefaultProfile,
} from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Generate a hidden random crash multiplier between 1.00x and 50.00x
 * - The player must never see the crash value before the crash.
 * - The airplane can crash almost immediately, such as 1.01x.
 * - It can also reach high values such as 10x, 25x, or up to 50x.
 */
function generateCrashMultiplier(): number {
  const rand = Math.random();
  let multiplier: number;

  if (rand < 0.12) {
    // Immediate / low crash (1.01x - 1.25x)
    multiplier = 1.01 + Math.random() * 0.24;
  } else if (rand < 0.52) {
    // Low to mid cruising ascent (1.25x - 3.50x)
    multiplier = 1.25 + Math.random() * 2.25;
  } else if (rand < 0.82) {
    // High altitude flight (3.50x - 12.00x)
    multiplier = 3.50 + Math.random() * 8.50;
  } else if (rand < 0.94) {
    // Supersonic dash (12.00x - 28.00x)
    multiplier = 12.00 + Math.random() * 16.00;
  } else {
    // Hypersonic stratosphere up to 50.00x
    multiplier = 28.00 + Math.random() * 22.00;
  }

  // Strictly clamp between 1.01 and 50.00
  const clamped = Math.min(Math.max(multiplier, 1.01), 50.00);
  return Number(clamped.toFixed(2));
}

export default function App() {
  // Navigation & Screen state
  const [screen, setScreen] = useState<GameScreen>('home');

  // Authenticated Player Profile state
  const [profile, setProfile] = useState<UserProfile>(() => getGuestProfile());

  // Current flight score & high score record
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // Insufficient points prompt state
  const [insufficientPointsPrompt, setInsufficientPointsPrompt] = useState<boolean>(false);

  // Modals
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showAdModal, setShowAdModal] = useState<boolean>(false);
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('skyfly_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      soundEnabled: true,
      engineSoundEnabled: true,
      hapticsEnabled: true,
      pilotName: 'Pilot Maverick',
    };
  });

  // Sync settings with audio engine
  useEffect(() => {
    soundService.enabled = settings.soundEnabled;
    soundService.engineSoundEnabled = settings.engineSoundEnabled;
    try {
      localStorage.setItem('skyfly_settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Subscribe to user profile in Firestore
        const unsubscribeProfile = subscribeToUserProfile(firebaseUser.uid, (cloudProfile) => {
          setProfile(cloudProfile);
        });
        return () => unsubscribeProfile();
      } else {
        // Return to local guest profile if signed out
        const guest = getGuestProfile();
        setProfile(guest);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Active Flight Round state
  const [round, setRound] = useState<FlightRound>({
    crashMultiplier: 1.0,
    currentMultiplier: 1.0,
    status: 'idle',
    durationMs: 0,
  });

  const flightIntervalRef = useRef<number | null>(null);
  const flightStartTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(1.0);
  const activeSessionIdRef = useRef<string | null>(null);

  // Clean up flight timer on unmount
  useEffect(() => {
    return () => {
      if (flightIntervalRef.current) {
        clearInterval(flightIntervalRef.current);
      }
      soundService.stopJetEngine();
    };
  }, []);

  /**
   * FLIGHT START:
   * Deducts exactly 20 virtual points.
   * If points < 20, blocks takeoff and displays notice.
   */
  const handleStartFlight = useCallback(async () => {
    // Pre-flight check: At least 20 virtual points required
    if (profile.virtualPoints < 20) {
      soundService.triggerHaptic(100);
      setInsufficientPointsPrompt(true);
      return;
    }

    setInsufficientPointsPrompt(false);
    soundService.playClick();
    soundService.playTakeoff();
    soundService.triggerHaptic(50);

    // Deduct exactly 20 points from balance with server-side validation
    try {
      const { profile: updatedProfile, sessionId } = await deductFlightCostPoints(profile);
      activeSessionIdRef.current = sessionId;
      setProfile(updatedProfile);
    } catch (e) {
      setInsufficientPointsPrompt(true);
      return;
    }

    const hiddenCrashPoint = generateCrashMultiplier();
    crashPointRef.current = hiddenCrashPoint;
    flightStartTimeRef.current = Date.now();

    setRound({
      crashMultiplier: hiddenCrashPoint,
      currentMultiplier: 1.0,
      status: 'flying',
      durationMs: 0,
      startTime: flightStartTimeRef.current,
    });

    setCurrentScore(0);
    setScreen('game');
    setShowGameOverModal(false);
    setIsNewHighScore(false);

    soundService.startJetEngine();

    // Flight multiplier acceleration loop
    if (flightIntervalRef.current) {
      clearInterval(flightIntervalRef.current);
    }

    flightIntervalRef.current = window.setInterval(() => {
      const elapsedSec = (Date.now() - flightStartTimeRef.current) / 1000;

      // Continuous flight multiplier curve
      const progressMultiplier = 1.00 + Math.pow(elapsedSec * 0.42, 1.48);
      const currentVal = Number(progressMultiplier.toFixed(2));

      soundService.updateEnginePitch(currentVal);

      if (currentVal >= crashPointRef.current) {
        // Airplane Crashed!
        if (flightIntervalRef.current) {
          clearInterval(flightIntervalRef.current);
          flightIntervalRef.current = null;
        }

        if (activeSessionIdRef.current) {
          reportFlightCrash(activeSessionIdRef.current);
        }

        const finalCrash = crashPointRef.current;
        soundService.playExplosion();
        soundService.triggerHaptic(120);

        setRound((prev) => ({
          ...prev,
          currentMultiplier: finalCrash,
          status: 'crashed',
          durationMs: Date.now() - flightStartTimeRef.current,
        }));

        setScreen('crashed');

        // Delay modal slightly so user sees the crash explosion
        setTimeout(() => {
          setShowGameOverModal(true);
        }, 1200);
      } else {
        setRound((prev) => ({
          ...prev,
          currentMultiplier: currentVal,
          durationMs: Date.now() - flightStartTimeRef.current,
        }));
      }
    }, 25);
  }, [profile]);

  /**
   * CLAIM SCORE:
   * Converts current multiplier to virtual score points (e.g. 5.50x = 55 PTS)
   * Credits earned score to user's virtual points balance and updates high score.
   */
  const handleClaimScore = useCallback(async () => {
    if (round.status !== 'flying') return;

    if (flightIntervalRef.current) {
      clearInterval(flightIntervalRef.current);
      flightIntervalRef.current = null;
    }

    const claimedVal = round.currentMultiplier;
    // 5.50x = 55 points
    const earnedScore = Math.floor(claimedVal * 10);

    soundService.playClaimSuccess();
    soundService.triggerHaptic(80);

    // Confetti celebration
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#34d399', '#facc15', '#f43f5e'],
      });
    } catch {}

    setCurrentScore(earnedScore);

    const isRecord = earnedScore > (profile.highScore || 0);
    if (isRecord) {
      setIsNewHighScore(true);
    }

    // Save and credit points with server-side validation
    try {
      const claimResult = await creditClaimedScorePoints(
        profile,
        claimedVal,
        activeSessionIdRef.current || undefined
      );
      setProfile(claimResult.profile);

      setRound((prev) => ({
        ...prev,
        status: 'claimed',
        claimedMultiplier: claimedVal,
        earnedScore: claimResult.earnedScore,
      }));
    } catch (err: any) {
      // If server detected crash before claim
      soundService.playExplosion();
      setRound((prev) => ({
        ...prev,
        status: 'crashed',
      }));
      setScreen('crashed');
      setShowGameOverModal(true);
      return;
    }

    setScreen('claimed');

    // Delay modal slightly so player sees aircraft soaring safely
    setTimeout(() => {
      setShowGameOverModal(true);
    }, 1100);
  }, [round.status, round.currentMultiplier, profile]);

  /**
   * Return to Hangar / Home Screen
   */
  const handleGoHome = useCallback(() => {
    soundService.playClick();
    if (flightIntervalRef.current) {
      clearInterval(flightIntervalRef.current);
      flightIntervalRef.current = null;
    }
    soundService.stopJetEngine();

    setRound((prev) => ({
      ...prev,
      status: 'idle',
      currentMultiplier: 1.0,
    }));
    setScreen('home');
    setShowGameOverModal(false);
  }, []);

  /**
   * Restart flight directly
   */
  const handleRestartFlight = useCallback(() => {
    handleStartFlight();
  }, [handleStartFlight]);

  /**
   * REWARDED AD BONUS:
   * Adds exactly 100 virtual points after verified callback completion.
   */
  const handleRewardGranted = useCallback(async (bonusPts: number, rewardToken: string) => {
    soundService.playClaimSuccess();
    const updated = await creditRewardedAdPoints(profile, rewardToken);
    setProfile(updated);
    setInsufficientPointsPrompt(false);
  }, [profile]);

  /**
   * User sign out
   */
  const handleSignOut = async () => {
    await signOutPlayer();
    const guest = getGuestProfile();
    setProfile(guest);
    setScreen('home');
  };

  const toggleSound = () => {
    const next = !settings.soundEnabled;
    setSettings((prev) => ({ ...prev, soundEnabled: next }));
    soundService.enabled = next;
    if (!next) {
      soundService.stopJetEngine();
    }
  };

  return (
    <main className="w-screen h-[100dvh] max-h-screen bg-[#050914] text-white flex flex-col items-center justify-center p-0 sm:p-4 overflow-hidden relative font-sans">
      {/* Mobile Shell Frame */}
      <div className="w-full h-full sm:max-w-md sm:h-[92vh] sm:max-h-[860px] sm:rounded-3xl sm:border sm:border-slate-800/80 bg-[#060c1d] flex flex-col relative overflow-hidden shadow-2xl shadow-black/80">
        
        {/* Background Flight Canvas Layer */}
        <div className="absolute inset-0 z-0">
          <FlightCanvas
            status={round.status}
            multiplier={round.currentMultiplier}
          />
        </div>

        {/* 1. Landing / Home Screen */}
        {screen === 'home' && (
          <div className="relative z-10 w-full h-full">
            <HomeScreen
              profile={profile}
              settings={settings}
              onStartFlight={handleStartFlight}
              onOpenLeaderboard={() => setShowLeaderboard(true)}
              onOpenSettings={() => setShowSettings(true)}
              onOpenProfile={() => setScreen('profile')}
              onOpenSignIn={() => setScreen('signin')}
              onOpenSignUp={() => setScreen('signup')}
              onOpenAdModal={() => setShowAdModal(true)}
              onToggleSound={toggleSound}
            />
          </div>
        )}

        {/* 2. Sign Up Screen */}
        {screen === 'signup' && (
          <SignUpScreen
            onSuccess={(newProfile) => {
              setProfile(newProfile);
              setScreen('home');
            }}
            onNavigateToSignIn={() => setScreen('signin')}
            onBackToHome={() => setScreen('home')}
          />
        )}

        {/* 3. Sign In Screen */}
        {screen === 'signin' && (
          <SignInScreen
            onSuccess={(authedProfile) => {
              setProfile(authedProfile);
              setScreen('home');
            }}
            onNavigateToSignUp={() => setScreen('signup')}
            onBackToHome={() => setScreen('home')}
          />
        )}

        {/* 4. Game Screen (HUD / Cockpit) */}
        {(screen === 'game' || screen === 'crashed' || screen === 'claimed') && (
          <GameHUD
            round={round}
            profile={profile}
            currentScore={currentScore}
            highScore={profile.highScore || 0}
            soundEnabled={settings.soundEnabled}
            onStartFlight={handleStartFlight}
            onClaimScore={handleClaimScore}
            onAbortFlight={handleGoHome}
            onToggleSound={toggleSound}
            onOpenAdModal={() => setShowAdModal(true)}
            onOpenSignUp={() => setScreen('signup')}
            onSignOut={handleSignOut}
            insufficientPointsPrompt={insufficientPointsPrompt}
            onDismissInsufficientPoints={() => setInsufficientPointsPrompt(false)}
          />
        )}

        {/* 5. Player Profile Screen */}
        {screen === 'profile' && (
          <ProfileScreen
            profile={profile}
            onSignOut={handleSignOut}
            onOpenAdModal={() => setShowAdModal(true)}
            onOpenSignUp={() => setScreen('signup')}
            onBackToHome={() => setScreen('home')}
          />
        )}

        {/* 6. Game Over / Crash Modal */}
        {showGameOverModal && (
          <GameOverModal
            round={round}
            profile={profile}
            isNewHighScore={isNewHighScore}
            highScore={profile.highScore || 0}
            currentScore={currentScore}
            onRestartFlight={handleRestartFlight}
            onGoHome={handleGoHome}
            onOpenSignUp={() => {
              setShowGameOverModal(false);
              setScreen('signup');
            }}
            onOpenAdModal={() => {
              setShowGameOverModal(false);
              setShowAdModal(true);
            }}
          />
        )}

        {/* 7. Settings Modal */}
        {showSettings && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={(newVals) =>
              setSettings((prev) => ({ ...prev, ...newVals }))
            }
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Modal: Leaderboard */}
        {showLeaderboard && (
          <LeaderboardModal
            pilotName={profile.displayName || settings.pilotName}
            onUpdatePilotName={(name) => {
              setSettings((prev) => ({ ...prev, pilotName: name }));
              setProfile((prev) => ({ ...prev, displayName: name }));
            }}
            onClose={() => setShowLeaderboard(false)}
          />
        )}

        {/* Modal: Rewarded Ad Simulation */}
        {showAdModal && (
          <AdModal
            onClose={() => setShowAdModal(false)}
            onRewardGranted={handleRewardGranted}
          />
        )}
      </div>
    </main>
  );
}
