import React, { useEffect, useRef } from 'react';

interface AdsterraNativeBannerProps {
  className?: string;
  showBadge?: boolean;
}

export const AdsterraNativeBanner: React.FC<AdsterraNativeBannerProps> = ({
  className = '',
  showBadge = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scriptId = 'adsterra-native-dcdee03b89e85a9a708ea876b43a2e2e';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = 'https://pl31319398.profitableratecpmnetwork.com/dcdee03b89e85a9a708ea876b43a2e2e/invoke.js';
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`adsterra-native-banner-box w-full overflow-hidden rounded-2xl bg-slate-950/70 border border-amber-500/30 p-2.5 text-center relative ${className}`}
    >
      {showBadge && (
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1 px-1">
          <span className="text-amber-400 font-bold">Sponsor Ad</span>
          <span className="text-slate-500">Adsterra Native</span>
        </div>
      )}

      {/* Target Container for Adsterra Native Banner */}
      <div
        id="container-dcdee03b89e85a9a708ea876b43a2e2e"
        className="w-full min-h-[80px] flex items-center justify-center text-xs text-slate-400"
      />
    </div>
  );
};
