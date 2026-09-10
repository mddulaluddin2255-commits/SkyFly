export type GameScreen = 
  | 'home' 
  | 'signin' 
  | 'signup' 
  | 'game' 
  | 'profile' 
  | 'settings' 
  | 'crashed' 
  | 'claimed';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  virtualPoints: number;
  highScore: number;
  totalFlights: number;
  successfulClaims: number;
  totalEarnedScore: number;
  createdAt?: number | string;
  updatedAt?: number | string;
}

export interface GameSettings {
  soundEnabled: boolean;
  engineSoundEnabled: boolean;
  hapticsEnabled: boolean;
  pilotName: string;
}

export interface ScoreRecord {
  id: string;
  userId?: string;
  pilotName: string;
  score: number;
  multiplier: number;
  timestamp: number;
  claimed: boolean;
}

export interface FlightRound {
  crashMultiplier: number;
  currentMultiplier: number;
  status: 'idle' | 'flying' | 'crashed' | 'claimed';
  claimedMultiplier?: number;
  earnedScore?: number;
  durationMs: number;
  startTime?: number;
}
