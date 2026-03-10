import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

// ─── Platform helpers ────────────────────────────────────────
const getIsIOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const getIsStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

const InstallPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [platform, setPlatform] = useState('chromium'); // 'chromium' | 'ios'
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const bannerRef = useRef(null);

    useEffect(() => {
        // Already installed as standalone app → never show
        if (getIsStandalone()) return;

        // Already dismissed in this session → don't nag
        if (sessionStorage.getItem('florizza-install-dismissed')) return;

        const iOS = getIsIOS();
        setPlatform(iOS ? 'ios' : 'chromium');

        if (iOS) {
            // iOS: show instruction after a gentle delay
            const timer = setTimeout(() => setShowPrompt(true), 4000);
            return () => clearTimeout(timer);
        }

        // ── Chromium browsers ──
        // Check if the event was already captured globally (before this component mounted)
        if (window.__deferredInstallPrompt) {
            setDeferredPrompt(window.__deferredInstallPrompt);
            setTimeout(() => setShowPrompt(true), 2000);
            return;
        }

        // Otherwise listen for it (in case it fires late)
        const handler = (e) => {
            e.preventDefault();
            window.__deferredInstallPrompt = e;
            setDeferredPrompt(e);
            setTimeout(() => setShowPrompt(true), 1500);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    // ── Animate banner in ──
    useEffect(() => {
        if (showPrompt && bannerRef.current) {
            gsap.fromTo(bannerRef.current,
                { y: 80, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
            );
        }
    }, [showPrompt]);

    // ── Install handler ──
    const handleInstall = async () => {
        const prompt = deferredPrompt || window.__deferredInstallPrompt;
        if (prompt) {
            prompt.prompt();
            const { outcome } = await prompt.userChoice;
            if (outcome === 'accepted') {
                sessionStorage.setItem('florizza-install-dismissed', 'true');
            }
            setDeferredPrompt(null);
            window.__deferredInstallPrompt = null;
        }
        dismiss();
    };

    // ── Dismiss ──
    const dismiss = () => {
        if (bannerRef.current) {
            gsap.to(bannerRef.current, {
                y: 80, opacity: 0, duration: 0.35, ease: 'power2.in',
                onComplete: () => {
                    setShowPrompt(false);
                    sessionStorage.setItem('florizza-install-dismissed', 'true');
                }
            });
        } else {
            setShowPrompt(false);
            sessionStorage.setItem('florizza-install-dismissed', 'true');
        }
    };

    if (!showPrompt) return null;

    return (
        <div
            ref={bannerRef}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-[380px] z-[95] opacity-0"
        >
            <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5 md:p-6 relative">
                {/* Close button */}
                <button
                    onClick={dismiss}
                    className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
                    aria-label="Fechar"
                >
                    <span className="material-symbols-outlined text-base">close</span>
                </button>

                {/* Logo + text */}
                <div className="flex items-start gap-4 pr-6">
                    <img
                        src="/icons/icon-192.png"
                        alt="Florizza"
                        className="w-12 h-12 rounded-xl flex-shrink-0 shadow-lg"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-display text-base text-white font-medium tracking-wide leading-tight">
                            Tenha a FLORIZZA sempre com você
                        </h3>
                        <p className="text-[11px] text-white/50 mt-1.5 leading-relaxed">
                            {platform === 'ios'
                                ? <>Toque em <span className="inline-flex items-center mx-0.5"><span className="material-symbols-outlined text-[13px] text-white/70 align-middle">ios_share</span></span> e depois em <strong className="text-white/70">"Adicionar à Tela de Início"</strong></>
                                : 'Instale nosso app para uma experiência mais rápida e elegante'
                            }
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-3">
                    {platform === 'chromium' && (
                        <button
                            onClick={handleInstall}
                            className="flex-1 bg-white text-[#0A0A0A] text-[11px] font-bold uppercase tracking-[0.15em] py-2.5 rounded-full hover:bg-white/90 active:scale-[0.97] transition-all"
                        >
                            Instalar App
                        </button>
                    )}
                    <button
                        onClick={dismiss}
                        className={`text-[11px] uppercase tracking-[0.1em] text-white/40 hover:text-white/70 transition-colors font-medium ${platform === 'ios' ? 'flex-1 py-2.5' : 'px-4'}`}
                    >
                        {platform === 'ios' ? 'Entendi' : 'Agora não'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
