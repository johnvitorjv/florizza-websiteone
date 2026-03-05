import { useNavigate, useLocation } from 'react-router-dom';
import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import gsap from 'gsap';
import FooterInfo from '../components/FooterInfo';
import HeroSlider from '../components/HeroSlider';
import { useProducts } from '../context/ProductContext';

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const containerRef = useRef(null);
    const v1Ref = useRef(null);
    const v2Ref = useRef(null);
    const transitionOverlayRef = useRef(null);

    const isV2Path = location.pathname === '/v2';
    const [renderedVariant, setRenderedVariant] = useState(isV2Path ? 2 : 1);
    const [isAnimating, setIsAnimating] = useState(false);

    const { trackEvent } = useProducts();

    useEffect(() => {
        if (trackEvent) {
            trackEvent('page_view', { page: isV2Path ? 'home_v2' : 'home_v1' });
        }
    }, [isV2Path, trackEvent]);

    useLayoutEffect(() => {
        const targetVariant = isV2Path ? 2 : 1;

        if (targetVariant === renderedVariant && !isAnimating) {
            const ctx = gsap.context(() => {
                const activeRef = targetVariant === 1 ? v1Ref.current : v2Ref.current;
                if (activeRef) {
                    gsap.fromTo(activeRef,
                        { opacity: 0, scale: 0.97 },
                        { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" }
                    );
                }
            });
            return () => ctx.revert();
        }

        if (targetVariant !== renderedVariant) {
            setIsAnimating(true);
            const ctx = gsap.context(() => {
                const currentRef = renderedVariant === 1 ? v1Ref.current : v2Ref.current;
                const tl = gsap.timeline({
                    onComplete: () => {
                        setRenderedVariant(targetVariant);
                        requestAnimationFrame(() => {
                            const newRef = targetVariant === 1 ? v1Ref.current : v2Ref.current;
                            if (!newRef) { setIsAnimating(false); return; }
                            const t2 = gsap.timeline({ onComplete: () => setIsAnimating(false) });
                            const animIn = newRef.querySelector('.animate-in');
                            if (animIn) {
                                t2.fromTo(animIn,
                                    { opacity: 0, x: targetVariant === 2 ? 80 : -80 },
                                    { opacity: 1, x: 0, duration: 0.8, ease: "power4.out" }
                                );
                            }
                            t2.to(transitionOverlayRef.current, { autoAlpha: 0, duration: 0.6 }, "-=0.5");
                        });
                    }
                });

                const animOut = currentRef ? currentRef.querySelector('.animate-in') : null;
                if (animOut) {
                    tl.to(animOut, { opacity: 0, x: targetVariant === 2 ? -80 : 80, duration: 0.5, ease: "power3.in" });
                }
                tl.to(transitionOverlayRef.current, { autoAlpha: 1, duration: 0.4 }, "-=0.3");
            });
            return () => ctx.revert();
        }
    }, [isV2Path, renderedVariant]);

    const handleGoToCatalog = () => {
        const pw = document.querySelector('.page-wrapper');
        if (pw) {
            gsap.to(pw, { opacity: 0, y: -30, duration: 0.4, ease: 'power3.in', onComplete: () => navigate('/catalogo') });
        } else navigate('/catalogo');
    };

    const handleToggle = () => navigate(isV2Path ? '/' : '/v2');

    // ────────────────────────────────────────────
    // V1 SCREEN
    // ────────────────────────────────────────────
    const ScreenOne = () => (
        <div className="absolute inset-0 w-full min-h-screen" ref={v1Ref} style={{ zIndex: 1 }}>
            <main className="relative min-h-screen flex items-center overflow-hidden pt-20 bg-[#f8f9fa] dark:bg-background-dark">
                <div className="absolute inset-0 z-0 plaster-texture pointer-events-none" />
                <div className="absolute right-0 top-0 w-1/3 h-full bg-plaster/30 dark:bg-white/5 border-l border-white/20 z-0" />

                <div className="animate-in container mx-auto px-6 md:px-12 lg:px-24 flex flex-col lg:flex-row items-center gap-0 z-10 w-full">
                    <div className="w-full lg:w-1/2 z-30 lg:-mr-16">
                        <div className="bg-white dark:bg-zinc-900 p-8 md:p-16 lg:p-20 floating-panel-shadow relative rounded-[2rem]">
                            <div className="absolute top-0 left-10 w-[1px] h-10 bg-primary/30" />
                            <span className="inline-block text-[10px] uppercase tracking-[0.4em] font-semibold text-primary mb-8 border-b border-primary/20 pb-2">
                                Coleção Verão 2026
                            </span>
                            <h1 className="hero-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] mb-8 text-slate-900 dark:text-white">
                                Vista-se com <br /><span className="italic font-light">Elegância</span> & Estilo
                            </h1>
                            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-light leading-relaxed mb-12 max-w-sm">
                                Descubra o luxo minimalista em cada detalhe. Peças curadas para a mulher que valoriza a sofisticação atemporal.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={handleGoToCatalog} className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-black dark:bg-white px-10 py-5 text-[10px] font-semibold tracking-[0.3em] uppercase text-white dark:text-black transition-all hover:scale-[1.03] active:scale-95">
                                    <span className="relative z-10 transition-colors group-hover:text-white">Explorar Catálogo</span>
                                    <div className="absolute inset-0 z-0 h-full w-0 bg-primary transition-all duration-500 ease-out group-hover:w-full" />
                                </button>
                                <a href="https://wa.me/5571982570273" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center sm:justify-start text-[10px] font-medium tracking-[0.3em] uppercase text-slate-500 dark:text-slate-400 transition-colors hover:text-primary">
                                    Falar no WhatsApp
                                    <span className="ml-4 h-[1px] w-12 bg-slate-300 dark:bg-slate-700 transition-all duration-500 group-hover:w-20 group-hover:bg-primary" />
                                </a>
                            </div>
                            <button onClick={handleToggle} className="mt-8 text-[9px] uppercase tracking-[0.3em] text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group">
                                <span className="material-symbols-outlined text-sm transition-transform group-hover:rotate-180 duration-500">space_dashboard</span>
                                Ver versão V2
                            </button>
                        </div>
                    </div>
                    <div className="w-full lg:w-3/5 mt-12 lg:mt-0 flex justify-end items-center">
                        <div className="relative w-full aspect-[4/5] lg:aspect-[3/4] max-w-2xl bg-[#EBE9E6] dark:bg-zinc-800 p-4 md:p-8 lg:p-10 rounded-[3rem] lg:rounded-l-[15rem] lg:rounded-br-[15rem] niche-shadow">
                            <div className="w-full h-full overflow-hidden rounded-[2rem] lg:rounded-tl-[13rem] lg:rounded-br-[13rem] relative bg-plaster dark:bg-zinc-950 border border-white/40 dark:border-white/5">
                                <HeroSlider variant={1} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-40 pointer-events-none z-20" />
                            </div>
                            <div className="absolute -bottom-6 -right-6 md:-right-12 bg-primary text-white py-6 px-10 hidden md:block rounded-full shadow-lg z-30">
                                <p className="text-[9px] uppercase tracking-[0.5em] whitespace-nowrap">Estética de Luxo Silencioso</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <FooterInfo variant={1} />
        </div>
    );

    // ────────────────────────────────────────────
    // V2 SCREEN — NOW IN PORTUGUESE + LIGHT MODE + MOBILE FIXED
    // ────────────────────────────────────────────
    const ScreenTwo = () => {
        const isDark = document.documentElement.classList.contains('dark');
        const bgColor = isDark ? 'bg-black' : 'bg-[#fcfbf9]';
        const textColor = isDark ? 'text-white' : 'text-slate-900';
        const subTextColor = isDark ? 'text-slate-300' : 'text-slate-600';
        const overlayMobile = isDark ? 'bg-black/40' : ''; // Light mode uses gradient below
        const overlayDesktop = isDark ? 'bg-black/10' : 'bg-[#fcfbf9]/20';
        const gradientFrom = isDark ? 'from-black' : 'from-[#fcfbf9]';
        const btnBg = isDark ? 'bg-white' : 'bg-slate-900';
        const btnText = isDark ? 'text-black' : 'text-white';
        const waColor = isDark ? 'text-slate-300' : 'text-slate-500';
        const waLine = isDark ? 'bg-slate-700' : 'bg-slate-300';
        const toggleColor = isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900';
        const detailColor = isDark ? 'text-slate-500' : 'text-slate-400';
        const detailLine = isDark ? 'bg-slate-700' : 'bg-slate-200';

        return (
            <div className="absolute inset-0 w-full min-h-screen" ref={v2Ref} style={{ zIndex: 1 }}>
                <main className={`relative min-h-screen flex ${bgColor} overflow-hidden page-wrapper`}>

                    {/* Left Side */}
                    <div className="w-full lg:w-1/2 min-h-screen flex items-center relative z-20">
                        <div className={`absolute inset-0 z-0 bg-gradient-to-r ${gradientFrom} via-${isDark ? 'transparent' : '[#fcfbf9]/80'} lg:via-transparent lg:to-transparent`} />

                        <div className="animate-in container mx-auto px-6 md:px-12 lg:px-24 flex flex-col justify-center relative z-10 w-full h-full pt-24 pb-16 lg:pt-0 lg:pb-0">
                            <div className="max-w-xl">
                                <span className="inline-block text-[10px] uppercase tracking-[0.5em] font-medium text-primary mb-8 opacity-80">
                                    Coleção Verão 2026
                                </span>
                                <h1 className={`hero-serif text-4xl md:text-6xl lg:text-[5.5rem] leading-[1.05] mb-8 ${textColor} font-normal`}>
                                    Vista-se com <br />
                                    <span className={`italic ${subTextColor} font-light`}>Elegância.</span>
                                </h1>
                                <p className={`text-sm md:text-base ${subTextColor} font-light leading-relaxed mb-12 max-w-sm tracking-wide`}>
                                    Curadoria exclusiva para mentes exigentes. Descubra peças que falam silenciosamente sobre luxo, atemporalidade e domínio artesanal.
                                </p>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                    <button onClick={handleGoToCatalog} className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full ${btnBg} px-10 py-5 text-[10px] font-semibold tracking-[0.3em] uppercase ${btnText} transition-all hover:scale-[1.03] active:scale-95`}>
                                        <span className="relative z-10 transition-colors group-hover:text-white">Explorar Catálogo</span>
                                        <div className="absolute inset-0 z-0 h-full w-0 bg-primary transition-all duration-500 ease-out group-hover:w-full" />
                                    </button>
                                    <a href="https://wa.me/5571982570273" target="_blank" rel="noopener noreferrer" className={`group flex items-center text-[10px] font-medium tracking-[0.3em] uppercase ${waColor} transition-colors hover:text-primary`}>
                                        Falar no WhatsApp
                                        <span className={`ml-4 h-[1px] w-12 ${waLine} transition-all duration-500 group-hover:w-20 group-hover:bg-primary`} />
                                    </a>
                                </div>

                                <button onClick={handleToggle} className={`mt-8 text-[9px] uppercase tracking-[0.3em] ${toggleColor} transition-colors flex items-center gap-2 group`}>
                                    <span className="material-symbols-outlined text-sm transition-transform group-hover:-rotate-180 duration-500">view_agenda</span>
                                    Ver versão clássica
                                </button>
                            </div>

                            <div className={`absolute bottom-8 left-6 md:left-12 lg:left-24 hidden lg:flex items-center space-x-6 text-[9px] uppercase tracking-widest ${detailColor}`}>
                                <span className={`w-12 h-[1px] ${detailLine}`} />
                                <span>SS/26 Exclusives</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Image — mobile shows BELOW text, occupies remaining space */}
                    <div className="absolute lg:relative inset-y-0 right-0 w-full lg:w-1/2 h-screen z-0">
                        <div className="w-full h-full overflow-hidden">
                            <HeroSlider variant={2} />
                            <div className={`absolute inset-0 ${overlayMobile} lg:${overlayDesktop} pointer-events-none z-10`} />
                            {!isDark && <div className="absolute inset-0 bg-gradient-to-b from-[#fcfbf9]/40 via-transparent to-transparent lg:hidden z-10 pointer-events-none" />}
                            <div className={`hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r ${gradientFrom} via-${isDark ? 'transparent' : '[#fcfbf9]/50'} to-transparent z-10 pointer-events-none`} />
                        </div>
                    </div>
                </main>

                <div className={bgColor}>
                    <FooterInfo variant={2} />
                </div>
            </div>
        );
    };

    return (
        <div className="relative w-full h-full page-wrapper" ref={containerRef}>
            <div ref={transitionOverlayRef} className="fixed inset-0 bg-black z-[70] invisible opacity-0 pointer-events-none" />

            {renderedVariant === 1 && <ScreenOne />}
            {renderedVariant === 2 && <ScreenTwo />}
        </div>
    );
};

export default Home;
