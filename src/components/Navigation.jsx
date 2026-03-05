import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useProducts } from '../context/ProductContext';
import SearchModal from './SearchModal';

const Navigation = ({ toggleDark, isDark }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const navRef = useRef();
    const pillRef = useRef();
    const { setIsCartOpen, cart } = useProducts();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const isAdmin = location.pathname === '/admin';
    const isV2 = location.pathname === '/v2';

    // Pages for the arrow navigation
    const pages = [
        { name: 'Início', path: '/' },
        { name: 'Catálogo', path: '/catalogo' },
        { name: 'Sobre', path: '/sobre' },
    ];

    const getActiveIndex = () => {
        if (location.pathname === '/sobre') return 2;
        if (location.pathname === '/catalogo' || location.pathname.startsWith('/produto')) return 1;
        return 0; // home or /v2
    };

    const activeIndex = getActiveIndex();
    const canGoLeft = activeIndex > 0;
    const canGoRight = activeIndex < pages.length - 1;

    const handleNavigate = (targetPath) => {
        if (location.pathname === targetPath) return;
        const pw = document.querySelector('.page-wrapper');
        if (pw) {
            gsap.to(pw, { opacity: 0, y: -15, duration: 0.3, ease: 'power3.inOut', onComplete: () => navigate(targetPath) });
        } else navigate(targetPath);
    };

    const goLeft = () => { if (canGoLeft) handleNavigate(pages[activeIndex - 1].path); };
    const goRight = () => { if (canGoRight) handleNavigate(pages[activeIndex + 1].path); };

    const handleToggleLayout = () => navigate(isV2 ? '/' : '/v2');

    // Sync pill text with GSAP animation on active change
    useEffect(() => {
        if (isAdmin || !pillRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(pillRef.current,
                { opacity: 0, y: 5, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' }
            );
        });
        return () => ctx.revert();
    }, [activeIndex, isAdmin]);

    // Entrance Animation
    useEffect(() => {
        if (isAdmin) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(navRef.current,
                { y: -60, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.8 }
            );
        });
        return () => ctx.revert();
    }, [isAdmin]);

    if (isAdmin) return null;

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <nav
            ref={navRef}
            className="fixed top-0 left-0 w-full z-[80] px-4 md:px-12 lg:px-20 py-4 md:py-5 flex justify-between items-center bg-transparent"
            style={{ opacity: 0 }}
        >
            {/* Logo */}
            <a
                href="/"
                onClick={(e) => { e.preventDefault(); handleNavigate('/'); }}
                className="text-lg md:text-2xl font-display font-medium tracking-[0.25em] uppercase cursor-pointer hover:text-primary transition-colors duration-300 text-slate-900 dark:text-white"
            >
                Florizza
            </a>

            {/* ── Arrow Navigation Pill ── */}
            <div className="flex items-center gap-0 bg-black/15 dark:bg-white/10 backdrop-blur-xl rounded-full border border-black/10 dark:border-white/10 shadow-lg">
                {/* Left Arrow */}
                <button
                    onClick={goLeft}
                    disabled={!canGoLeft}
                    className={`flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full transition-all duration-300 ${canGoLeft ? 'text-slate-800 dark:text-white hover:bg-black/10 dark:hover:bg-white/20 hover:text-primary cursor-pointer active:scale-90' : 'text-slate-300 dark:text-white/20 cursor-default'}`}
                >
                    <span className="material-symbols-outlined text-lg md:text-xl">chevron_left</span>
                </button>

                {/* Current Page Name */}
                <div
                    ref={pillRef}
                    className="px-3 md:px-6 py-1.5 md:py-2 text-[9px] md:text-[11px] font-bold tracking-[0.3em] uppercase text-slate-800 dark:text-white select-none min-w-[80px] md:min-w-[100px] text-center"
                >
                    {pages[activeIndex].name}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={goRight}
                    disabled={!canGoRight}
                    className={`flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full transition-all duration-300 ${canGoRight ? 'text-slate-800 dark:text-white hover:bg-black/10 dark:hover:bg-white/20 hover:text-primary cursor-pointer active:scale-90' : 'text-slate-300 dark:text-white/20 cursor-default'}`}
                >
                    <span className="material-symbols-outlined text-lg md:text-xl">chevron_right</span>
                </button>
            </div>

            {/* ── Right Tools ── */}
            <div className="flex items-center gap-2 md:gap-4 text-slate-900 dark:text-white">
                {/* V1/V2 toggle — only on home pages */}
                {(location.pathname === '/' || isV2) && (
                    <button onClick={handleToggleLayout} className="hidden md:flex items-center justify-center hover:text-primary transition-colors" title={isV2 ? 'Voltar para V1' : 'Ver V2'}>
                        <span className="material-symbols-outlined text-[20px]">{isV2 ? 'view_agenda' : 'space_dashboard'}</span>
                    </button>
                )}

                {/* Dark/Light Mode */}
                <button onClick={toggleDark} className="flex items-center justify-center hover:text-primary transition-colors" title="Alternar Tema" id="theme-toggle">
                    <span className="material-symbols-outlined text-lg md:text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
                </button>

                {/* Search */}
                <button onClick={() => setIsSearchOpen(true)} className="flex items-center justify-center hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg md:text-[22px]">search</span>
                </button>

                {/* Cart */}
                <button onClick={() => setIsCartOpen(true)} className="relative hover:text-primary transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg md:text-[22px]">shopping_bag</span>
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1.5 bg-primary text-white text-[7px] md:text-[9px] font-bold h-3.5 w-3.5 md:h-4 md:w-4 flex items-center justify-center rounded-full border border-white dark:border-zinc-900 shadow-sm">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </nav>
    );
};

export default Navigation;
