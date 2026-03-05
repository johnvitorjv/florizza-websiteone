import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useProducts } from '../context/ProductContext';
import SearchModal from './SearchModal';

const Navigation = ({ toggleDark, isDark }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const navRef = useRef();
    const { setIsCartOpen, cart } = useProducts();

    const isCatalog = location.pathname === '/catalogo';
    const isAbout = location.pathname === '/sobre';
    const isAdmin = location.pathname === '/admin';
    const isHome = location.pathname === '/' || location.pathname === '/v2';

    // Check if we are on v1 or v2 (for mobile toggle)
    const isV1 = location.pathname === '/';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const handleNavigate = (e, path) => {
        e.preventDefault();

        if (path === '/' || path === '/v2') {
            localStorage.setItem('florizza-layout', path);
        }

        // Don't animate if we are already on the page or toggling home modes
        if (location.pathname === path) return;
        if ((isHome && (path === '/' || path === '/v2'))) {
            navigate(path);
            return;
        }

        const pageWrapper = document.querySelector('.page-wrapper');
        if (pageWrapper) {
            gsap.to(pageWrapper, {
                opacity: 0,
                y: -30,
                duration: 0.5,
                ease: 'power3.in',
                onComplete: () => {
                    navigate(path);
                }
            });
        } else {
            navigate(path);
        }
    };

    // Toggle between V1 and V2 Home modes
    const handleToggleLayout = (e) => {
        if (isV1) handleNavigate(e, '/v2');
        else handleNavigate(e, '/');
    };

    // GSAP Animation for header links entering and leaving contextually
    useEffect(() => {
        if (isAdmin) return;

        const ctx = gsap.context(() => {
            if (isCatalog) {
                gsap.to('.nav-link-standard, .nav-link-about', {
                    opacity: 0, x: 20, duration: 0.3, ease: 'power2.inOut',
                    onComplete: () => {
                        gsap.set('.nav-link-standard, .nav-link-about', { display: 'none' });
                        gsap.set('.nav-link-catalog', { display: 'flex' });
                        gsap.fromTo('.nav-link-catalog',
                            { opacity: 0, x: -20 },
                            { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
                        );
                    }
                });
            } else if (isAbout) {
                gsap.to('.nav-link-standard, .nav-link-catalog', {
                    opacity: 0, x: 20, duration: 0.3, ease: 'power2.inOut',
                    onComplete: () => {
                        gsap.set('.nav-link-standard, .nav-link-catalog', { display: 'none' });
                        gsap.set('.nav-link-about', { display: 'flex' });
                        gsap.fromTo('.nav-link-about',
                            { opacity: 0, x: -20 },
                            { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
                        );
                    }
                });
            } else {
                gsap.to('.nav-link-catalog, .nav-link-about', {
                    opacity: 0, x: -20, duration: 0.3, ease: 'power2.inOut',
                    onComplete: () => {
                        gsap.set('.nav-link-catalog, .nav-link-about', { display: 'none' });
                        gsap.set('.nav-link-standard', { display: 'flex' });
                        gsap.fromTo('.nav-link-standard',
                            { opacity: 0, x: 20 },
                            { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
                        );
                    }
                });
            }
        }, navRef);
        return () => ctx.revert();
    }, [isCatalog, isAbout, isAdmin]);

    if (isAdmin) return null; // No navigation bar in Admin

    return (
        <nav ref={navRef} className="absolute top-0 left-0 w-full z-50 px-6 md:px-8 py-6 md:py-8 flex justify-between items-center bg-transparent">
            {/* Logo */}
            <a
                href="/"
                onClick={(e) => handleNavigate(e, '/')}
                className="text-xl md:text-2xl font-display font-bold tracking-[0.2em] text-primary dark:text-white uppercase cursor-pointer z-20 whitespace-nowrap"
            >
                Florizza
            </a>

            {/* Desktop Center Links */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex flex-row items-center space-x-12 text-[10px] font-medium tracking-[0.3em] uppercase">
                {/* Standard Mode Links (Home) */}
                <a href="/" onClick={(e) => handleNavigate(e, '/')} className={`nav-link-standard hover:text-primary transition-colors cursor-pointer ${location.pathname === '/' ? 'text-primary' : ''}`}>Design v1</a>
                <a href="/v2" onClick={(e) => handleNavigate(e, '/v2')} className={`nav-link-standard hover:text-primary transition-colors cursor-pointer ${location.pathname === '/v2' ? 'text-primary' : ''}`}>Design v2</a>
                <a href="/catalogo" onClick={(e) => handleNavigate(e, '/catalogo')} className="nav-link-standard hover:text-primary transition-colors cursor-pointer">CATÁLOGO</a>
                <a href="/sobre" onClick={(e) => handleNavigate(e, '/sobre')} className="nav-link-standard hover:text-primary transition-colors cursor-pointer">SOBRE</a>

                {/* Catalog Mode Links */}
                <a href="/" onClick={(e) => handleNavigate(e, '/')} className="nav-link-catalog hidden hover:text-primary transition-colors cursor-pointer" style={{ display: 'none', opacity: 0 }}>← INÍCIO</a>
                <span className="nav-link-catalog hidden text-primary tracking-[0.4em] scale-110 transition-transform cursor-default" style={{ display: 'none', opacity: 0 }}>CATÁLOGO</span>
                <a href="/sobre" onClick={(e) => handleNavigate(e, '/sobre')} className="nav-link-catalog hidden hover:text-primary transition-colors cursor-pointer" style={{ display: 'none', opacity: 0 }}>SOBRE →</a>

                {/* About Mode Links */}
                <a href="/" onClick={(e) => handleNavigate(e, '/')} className="nav-link-about hidden hover:text-primary transition-colors cursor-pointer" style={{ display: 'none', opacity: 0 }}>← INÍCIO</a>
                <a href="/catalogo" onClick={(e) => handleNavigate(e, '/catalogo')} className="nav-link-about hidden hover:text-primary transition-colors cursor-pointer" style={{ display: 'none', opacity: 0 }}>CATÁLOGO</a>
                <span className="nav-link-about hidden text-primary tracking-[0.4em] scale-110 transition-transform cursor-default" style={{ display: 'none', opacity: 0 }}>SOBRE</span>
            </div>

            {/* Right Tools - Mobile vs Desktop considerations */}
            <div className="flex items-center space-x-4 md:space-x-6 z-20">
                {/* Layout switch for Mobile (hidden on Desktop) */}
                {isHome && (
                    <button onClick={handleToggleLayout} className="md:hidden material-symbols-outlined text-xl hover:text-primary transition-colors" title="Limpar Layout (Alternar Tema V1/V2)">
                        {isV1 ? 'view_agenda' : 'space_dashboard'}
                    </button>
                )}

                <button
                    title="Pesquisar"
                    onClick={() => setIsSearchOpen(true)}
                    className="material-symbols-outlined text-xl hover:text-primary transition-colors"
                >
                    search
                </button>
                <button
                    title="Sacola"
                    onClick={() => setIsCartOpen(true)}
                    className="relative text-xl hover:text-primary transition-colors flex items-center justify-center"
                >
                    <span className="material-symbols-outlined">shopping_bag</span>
                    {cart.reduce((total, item) => total + item.quantity, 0) > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] sm:text-[9px] font-bold h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center rounded-full border border-white dark:border-zinc-900">
                            {cart.reduce((total, item) => total + item.quantity, 0)}
                        </span>
                    )}
                </button>
                <button title="Modo Noturno" onClick={toggleDark} className="material-symbols-outlined text-xl hover:text-primary transition-colors">
                    {isDark ? 'light_mode' : 'dark_mode'}
                </button>

                {/* Burger for mobile 'Sobre', 'Inicio' e 'Catalogo' when out of space */}
                <div className="md:hidden relative group">
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="material-symbols-outlined text-xl hover:text-primary pt-1">menu</button>
                    <div className={`absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-md shadow-lg transition-opacity flex flex-col p-2 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                        <a href="/" onClick={(e) => { setMobileMenuOpen(false); handleNavigate(e, '/'); }} className={`text-sm p-3 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded ${isHome ? 'text-primary' : ''}`}>Início</a>
                        <a href="/catalogo" onClick={(e) => { setMobileMenuOpen(false); handleNavigate(e, '/catalogo'); }} className={`text-sm p-3 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded ${isCatalog ? 'text-primary' : ''}`}>Catálogo</a>
                        <a href="/sobre" onClick={(e) => { setMobileMenuOpen(false); handleNavigate(e, '/sobre'); }} className={`text-sm p-3 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded ${isAbout ? 'text-primary' : ''}`}>Sobre</a>
                    </div>
                </div>
            </div>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </nav>
    );
};

export default Navigation;
