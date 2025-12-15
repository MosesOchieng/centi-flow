import { useEffect, useState } from 'react';
import './Splash.css';

export default function Splash() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Simulate loading with progress (slightly longer for a richer splash)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          return 100;
        }
        return prev + 1;
      });
    }, 80);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Detect iOS standalone capability
    const ua = window.navigator.userAgent || window.navigator.vendor;
    const iOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isStandalone = (window.navigator as any).standalone === true;
    setIsIOS(iOS && !isStandalone);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="splash-page">
      <div className="splash-container">
        <div className="splash-card">
          <div className="splash-card-header">
            <div className="splash-pill">Centi Flow Business Network</div>

            <div className="splash-logo-row">
              <div className="splash-logo-container">
                <img 
                  src="/1735912600698.jpeg" 
                  alt="Centi Flow Logo" 
                  className="splash-logo"
                />
              </div>
              <div className="splash-title-block">
                <h1 className="splash-title">Centi&nbsp;Flow</h1>
                <p className="splash-subtitle">
                  Modern B2B banking for services, credits &amp; exchanges.
                </p>
              </div>
            </div>

            <p className="splash-tagline">
              Seamlessly settle work, track value, and keep every partner in sync – 
              just like a modern digital bank, but built for service economies.
            </p>
          </div>

          <div className="splash-card-body">
            <div className="splash-balance-card">
              <div className="splash-balance-header">
                <span className="balance-label">Live business wallet</span>
                <span className="balance-status">Realtime · Encrypted</span>
              </div>
              <div className="splash-balance-main">
                <div>
                  <p className="balance-caption">Available Centi credits</p>
                  <p className="balance-amount">₦ 248,920.00</p>
                </div>
                <div className="balance-chip">+12.4% this month</div>
              </div>
              <div className="splash-balance-footer">
                <span>Incoming settlements · 4</span>
                <span>Cleared invoices · 28</span>
              </div>
            </div>

            <div className="splash-insights">
              <div className="insight-item">
                <span className="insight-label">Verified partners</span>
                <span className="insight-value">320+</span>
                <span className="insight-meta">Across service clusters</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Trade volume (30d)</span>
                <span className="insight-value">₦ 18.2M</span>
                <span className="insight-meta">Bilateral &amp; pooled</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">On-time settlements</span>
                <span className="insight-value">99.4%</span>
                <span className="insight-meta">Backed by Centi rules</span>
              </div>
            </div>
          </div>

          <div className="splash-loader-shell">
            {loading ? (
              <div className="splash-loader">
                <div className="loader-header">
                  <span className="loader-title">Preparing your workspace</span>
                  <span className="loader-percentage">{progress}%</span>
                </div>
                <div className="loader-spinner"></div>
                <div className="loader-progress">
                  <div 
                    className="loader-progress-bar" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="loader-text">
                  Securing connections, syncing wallets &amp; partners…
                </p>
              </div>
            ) : (
              <div className="splash-loader done">
                <div className="loader-header">
                  <span className="loader-title">Workspace ready</span>
                  <span className="loader-percentage">100%</span>
                </div>
                <p className="loader-text">
                  You&apos;re all set. Loading your dashboard experience…
                </p>
              </div>
            )}
          </div>

          {(showInstallBanner || isIOS) && (
            <div className="install-banner">
              <div className="install-banner-content">
                <div className="install-text">
                  <h2>Install Centi Flow</h2>
                  <p>
                    Add Centi Flow to your home screen for a faster, full-screen banking-style experience.
                  </p>
                </div>
                <div className="install-actions">
                  {deferredPrompt && (
                    <button className="btn-install" onClick={handleInstallClick}>
                      Install app
                    </button>
                  )}
                  {isIOS && (
                    <p className="install-helper">
                      On iOS: tap <span className="install-icon">Share</span> → <strong>Add to Home Screen</strong>.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

