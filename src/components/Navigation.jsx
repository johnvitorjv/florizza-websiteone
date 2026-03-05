import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useProducts } from '../context/ProductContext';
import SearchModal from './SearchModal';

const Navigation = ({ toggleDark, isDark }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const navRef = useRef();
    const linkRefs = useRef([]);
    const underlineRefs = useRef([]);
    const { setIsCartOpen, cart } = useProducts();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const isAdmin = location.pathname === '/admin';
    const isV2 = location.pathname === '/v2';

    const navItems = [
        { name: 'Início', path: '/' },
        { name: 'Catálogo', path: '/catalogo' },
        { name: 'Sobre', path: '/sobre' },
    ];

    const getActiveIndex = () => {
        if (location.pathname === '/sobre') return 2;
        if (location.pathname === '/catalogo') return 1;
        return 0;
    };

    const activeIndex = getActiveIndex();

    // Sync underline on active change
    useEffect(() => {
        linkRefs.current.forEach((el, i) => {
            if (!el) return;
            const underline = underlineRefs.current[i];
            if (i === activeIndex) {
                gsap.to(underline, { scaleX: 1, duration: 0.4, ease: 'power3.out', transformOrigin: 'left' });
                gsap.to(el, { color: '#73cf17', duration: 0.3 });
            } else {
                gsap.to(underline, { scaleX: 0, duration: 0.3, ease: 'power3.in', transformOrigin: 'left' });
                gsap.to(el, { color: '', duration: 0.3 });
            }
        });
    }, [activeIndex]);

    // Toggle layouts if on home screen
    const handleToggleLayout = (e) => {
        e.preventDefault();
        const next = isV2 ? '/' : '/v2';
        navigate(next);
    };

    const handleNavigate = (e, targetPath, index) => {
        e.preventDefault();
        // If already on the same path, do nothing
        if (location.pathname === targetPath) return;

        const pageWrapper = document.querySelector('.page-wrapper');
        if (pageWrapper) {
            gsap.to(pageWrapper, {
                opacity: 0,
                y: -15,
                duration: 0.4,
                ease: 'power3.inOut',
                onComplete: () => navigate(targetPath)
            });
        } else {
            navigate(targetPath);
        }
    };

    // Entrance Animation
    useEffect(() => {
        if (isAdmin) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(navRef.current,
                { y: -60, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 1.2 }
            );
            // Stagger links entrance
            gsap.fromTo(linkRefs.current,
                { opacity: 0, y: -10 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 1.6 }
            );
        });
        return () => ctx.revert();
    }, [isAdmin]);

    if (isAdmin) return null;

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <nav
            ref={navRef}
            className="fixed top-0 left-0 w-full z-[80] px-6 md:px-12 lg:px-20 py-5 flex justify-between items-center bg-transparent"
            style={{ opacity: 0 }} // start hidden, GSAP reveals
        >
            {/* Logo */}
            <a
                href="/"
                onClick={(e) => handleNavigate(e, '/', 0)}
                className="text-xl md:text-2xl font-display font-medium tracking-[0.25em] text-slate-900 dark:text-white uppercase cursor-pointer hover:text-primary transition-colors duration-300 mix-blend-difference"
            >
                Florizza
            </a>

            {/* Central Nav Links */}
            <div className="hidden md:flex items-center gap-10 lg:gap-14">
                {navItems.map((item, i) => (
                    <div key={item.name} className="relative group">
                        <a
                            ref={el => linkRefs.current[i] = el}
                            href={item.path}
                            onClick={(e) => handleNavigate(e, item.path, i)}
                            className="text-[11px] font-semibold tracking-[0.25em] uppercase transition-colors duration-300 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary mix-blend-difference text-white"
                        >
                            {item.name}
                        </a>
                        {/* Animated underline */}
                        <span
                            ref={el => underlineRefs.current[i] = el}
                            className="absolute -bottom-1 left-0 h-[1.5px] w-full bg-primary"
                            style={{ transform: 'scaleX(0)', transformOrigin: 'left' }}
                        />
                    </div>
                ))}
            </div>

            {/* Right Tools */}
            <div className="flex items-center space-x-4 md:space-x-6 z-20 mix-blend-difference text-white">
                {/* V1/V2 Layout Toggle — only on home pages */}
                {(location.pathname === '/' || isV2) && (
                    <button
                        onClick={handleToggleLayout}
                        className="hidden md:flex items-center justify-center hover:text-primary transition-colors"
                        title={isV2 ? 'Voltar para V1' : 'Ver V2'}
                    >
                        <span className="material-symbols-outlined text-[20px]">{isV2 ? 'view_agenda' : 'space_dashboard'}</span>
                    </button>
                )}

                {/* Dark/Light Mode Toggle */}
                <button
                    onClick={toggleDark}
                    className="hidden md:flex items-center justify-center hover:text-primary transition-colors"
                    title="Alternar Tema"
                    id="theme-toggle"
                >
                    <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
                </button>

                {/* Search */}
                <button
                    onClick={() => setIsSearchOpen(true)}
                    className="flex items-center justify-center hover:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined text-xl md:text-[22px]">search</span>
                </button>

                {/* Cart */}
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative hover:text-primary transition-colors flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-xl md:text-[22px]">shopping_bag</span>
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1.5 bg-primary text-white text-[8px] sm:text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white dark:border-zinc-900 shadow-sm">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Mobile: compact right section with cart and theme only */}
            <div className="flex md:hidden items-center gap-4 mix-blend-difference text-white">
                <button onClick={toggleDark} className="hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">{isDark ? 'light_mode' : 'dark_mode'}</span>
                </button>
                <button onClick={() => setIsCartOpen(true)} className="relative hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">shopping_bag</span>
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1.5 bg-primary text-white text-[8px] font-bold h-3.5 w-3.5 flex items-center justify-center rounded-full border border-white dark:border-zinc-900 shadow-sm">
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
