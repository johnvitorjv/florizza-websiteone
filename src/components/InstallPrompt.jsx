import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const InstallPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const bannerRef = useRef(null);

    useEffect(() => {
        // Don't show if already dismissed or already installed
        if (localStorage.getItem('florizza-install-dismissed')) return;
        if (window.matchMedia('(display-mode: standalone)').matches) return;
        if (window.navigator.standalone === true) return;

        // Detect iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        setIsIOS(iOS);

        if (iOS) {
            // Show iOS instruction after a short delay
            const timer = setTimeout(() => setShowPrompt(true), 3000);
            return () => clearTimeout(timer);
        }

        // Android / Desktop: listen for beforeinstallprompt
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setTimeout(() => setShowPrompt(true), 2000);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    // Animate in
    useEffect(() => {
        if (showPrompt && bannerRef.current) {
            gsap.fromTo(bannerRef.current,
                { y: 100, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
            );
        }
    }, [showPrompt]);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                localStorage.setItem('florizza-install-dismissed', 'true');
            }
            setDeferredPrompt(null);
        }
        dismiss();
    };

    const dismiss = () => {
        if (bannerRef.current) {
            gsap.to(bannerRef.current, {
                y: 100, opacity: 0, duration: 0.4, ease: 'power2.in',
                onComplete: () => {
                    setShowPrompt(false);
                    localStorage.setItem('florizza-install-dismissed', 'true');
                }
            });
        } else {
            setShowPrompt(false);
            localStorage.setItem('florizza-install-dismissed', 'true');
        }
    };

    if (!showPrompt) return null;

    return (
        <div
            ref={bannerRef}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-[380px] z-[95] opacity-0"
        >
            <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5 md:p-6">
                {/* Close button */}
                <button
                    onClick={dismiss}
                    className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
                    aria-label="Fechar"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>

                {/* Logo + text */}
                <div className="flex items-start gap-4">
                    <img
                        src="/icons/icon-192.png"
                        alt="Florizza"
                        className="w-12 h-12 rounded-xl flex-shrink-0 shadow-lg"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-display text-base text-white font-medium tracking-wide leading-tight">
                            Tenha a FLORIZZA sempre com você
                        </h3>
                        <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
                            {isIOS
                                ? 'Toque no ícone de compartilhar e depois em "Adicionar à Tela de Início"'
                                : 'Instale nosso app para uma experiência mais rápida e elegante'
                            }
                        </p>
                    </div>
                </div>

                {/* Action */}
                <div className="mt-4 flex gap-3">
                    {!isIOS && (
                        <button
                            onClick={handleInstall}
                            className="flex-1 bg-white text-[#0A0A0A] text-[11px] font-bold uppercase tracking-[0.15em] py-2.5 rounded-full hover:bg-white/90 active:scale-[0.97] transition-all"
                        >
                            Instalar App
                        </button>
                    )}
                    <button
                        onClick={dismiss}
                        className={`text-[11px] uppercase tracking-[0.1em] text-white/40 hover:text-white/70 transition-colors font-medium ${isIOS ? 'flex-1 py-2.5' : 'px-4'}`}
                    >
                        {isIOS ? 'Entendi' : 'Agora não'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
