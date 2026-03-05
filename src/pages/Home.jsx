import { useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import FooterInfo from '../components/FooterInfo';
import HeroSlider from '../components/HeroSlider';

const Home = ({ variant = 1 }) => {
    const navigate = useNavigate();
    const pageRef = useRef();

    useEffect(() => {
        const path = variant === 2 ? '/v2' : '/';
        if (localStorage.getItem('florizza-layout') !== path) {
            localStorage.setItem('florizza-layout', path);
        }
    }, [variant]);

    const handleGoToCatalog = () => {
        // 1. Trigger cabecalho animation (handled by Navigation component reacting to URL change, but we want it simultaneous)
        // Actually, Navigation reacts to url change, so it's better to navigate and let the new page animate in,
        // OR animate out the Home page, then navigate.

        // Let's animate out the home page content
        const ctx = gsap.context(() => {
            gsap.to(pageRef.current, {
                opacity: 0,
                y: -50,
                scale: 0.98,
                duration: 0.6,
                ease: 'power3.in',
                onComplete: () => {
                    navigate('/catalogo');
                }
            });
        });
    };

    const ScreenOne = () => (
        <div className="page-wrapper" ref={pageRef}>
            <main className="relative min-h-screen flex items-center overflow-hidden pt-20">
                <div className="absolute inset-0 z-0 plaster-texture pointer-events-none"></div>
                <div className="absolute right-0 top-0 w-1/3 h-full bg-plaster/30 dark:bg-white/5 border-l border-white/20 z-0"></div>
                <div className="container mx-auto px-6 md:px-12 lg:px-24 flex flex-col lg:flex-row items-center gap-0 z-10">
                    <div className="w-full lg:w-1/2 z-30 lg:-mr-16">
                        <div className="bg-white dark:bg-zinc-900 p-8 md:p-16 lg:p-20 floating-panel-shadow relative rounded-md">
                            <div className="absolute top-0 left-10 w-[1px] h-10 bg-primary/30"></div>
                            <span className="inline-block text-[10px] uppercase tracking-[0.4em] font-semibold text-primary mb-8 border-b border-primary/20 pb-2">
                                Coleção Verão 2026
                            </span>
                            <h1 className="hero-serif text-4xl md:text-6xl lg:text-7xl leading-[1.1] mb-8 text-slate-900 dark:text-white">
                                Vista-se com <br /><span className="italic">Elegância</span> e Estilo
                            </h1>
                            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-light leading-relaxed mb-12 max-w-sm">
                                Descubra o luxo minimalista em cada detalhe. Peças curadas para a mulher que valoriza a sofisticação atemporal e o conforto sublime.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <button onClick={handleGoToCatalog} className="inline-flex items-center justify-center px-12 py-4 bg-primary text-white text-[10px] font-medium tracking-[0.3em] uppercase hover:bg-opacity-90 transition-all duration-300 rounded-md">
                                    Ver catálogo
                                </button>
                                <a href="https://wa.me/5571982570273" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-12 py-4 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-medium tracking-[0.3em] uppercase hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 rounded-md">
                                    Whatsapp
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-3/5 mt-12 lg:mt-0 flex justify-end items-center">
                        <div className="relative w-full aspect-[4/5] lg:aspect-[3/4] max-w-2xl bg-[#EBE9E6] dark:bg-zinc-800 p-4 md:p-8 lg:p-10 rounded-t-[15rem] niche-shadow">
                            <div className="w-full h-full overflow-hidden rounded-t-[13rem] relative bg-plaster dark:bg-zinc-950 border border-white/40 dark:border-white/5">
                                <HeroSlider variant={1} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-40 pointer-events-none z-20"></div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 md:-right-12 bg-primary text-white py-6 px-10 hidden md:block rounded-md shadow-lg">
                                <p className="text-[9px] uppercase tracking-[0.5em] whitespace-nowrap">Quiet Luxury Aesthetic</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <FooterInfo variant={1} />
        </div>
    );

    const ScreenTwo = () => (
        <div className="page-wrapper" ref={pageRef}>
            <main className="relative min-h-screen flex items-center overflow-hidden">
                <div className="container mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-2 items-center gap-12 z-10">
                    <div className="max-w-xl animate-fade-in">
                        <span className="inline-block text-xs uppercase tracking-[0.3em] font-semibold text-primary mb-6">
                            Coleção Verão 2026
                        </span>
                        <h1 className="hero-serif text-5xl md:text-7xl lg:text-8xl leading-tight md:leading-tight mb-8 text-slate-900 dark:text-white">
                            Vista-se com <br />Elegância e Estilo
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed mb-10 max-w-md">
                            Descubra o luxo minimalista em cada detalhe. Peças curadas para a mulher que valoriza a sofisticação atemporal e o conforto sublime.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={handleGoToCatalog} className="inline-flex items-center justify-center px-10 py-4 bg-primary text-white text-sm font-medium tracking-widest uppercase hover:bg-opacity-90 transition-all duration-300 rounded-md">
                                Ver catálogo
                            </button>
                            <a href="https://wa.me/5571982570273" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-10 py-4 border border-primary text-primary dark:text-primary text-sm font-medium tracking-widest uppercase hover:bg-primary hover:text-white transition-all duration-300 rounded-md">
                                Whatsapp
                            </a>
                        </div>
                    </div>
                </div>
                <div className="absolute inset-y-0 right-0 w-full lg:w-[55%] pointer-events-none z-0">
                    <div className="absolute inset-0 bg-[#F2F0ED] dark:bg-[#1A1A1A] z-0"></div>
                    <div className="relative h-full w-full overflow-hidden">
                        <HeroSlider variant={2} />
                        <div className="absolute inset-0 bg-gradient-to-r from-background-light via-transparent to-transparent dark:from-background-dark opacity-100 lg:opacity-100 pointer-events-none z-20"></div>
                    </div>
                </div>
                <div className="absolute bottom-12 left-12 lg:left-24 hidden lg:block z-10">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-[1px] bg-slate-400"></div>
                        <span className="text-xs uppercase tracking-widest text-slate-400">Quiet Luxury Aesthetic</span>
                    </div>
                </div>
            </main>
            <FooterInfo variant={2} />
        </div>
    );

    return variant === 1 ? <ScreenOne /> : <ScreenTwo />;
};

export default Home;
