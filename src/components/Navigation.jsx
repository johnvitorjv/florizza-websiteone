import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { useProducts } from '../context/ProductContext';
import SearchModal from './SearchModal';

const Navigation = ({ toggleDark, isDark }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const navRef = useRef();
    const { setIsCartOpen, cart } = useProducts();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Pill Navigation State
    const navItems = [
        { name: 'INÍCIO', path: '/' },
        { name: 'CATÁLOGO', path: '/catalogo' },
        { name: 'SOBRE', path: '/sobre' }
    ];

    const isAdmin = location.pathname === '/admin';
    const isV2 = location.pathname === '/v2';

    // Resolve active path for the pill (Home catches both / and /v2)
    const getActiveIndex = () => {
        if (location.pathname === '/sobre') return 2;
        if (location.pathname === '/catalogo') return 1;
        return 0; // Home is default
    };

    const activeIndex = getActiveIndex();
    const itemsRef = useRef([]);
    const indicatorRef = useRef(null);
    const containerRef = useRef(null);

    // Handle fluid highlight pill positioning
    const updateIndicatorLoc = () => {
        if (!indicatorRef.current || !itemsRef.current[activeIndex] || !containerRef.current) return;

        const activeItem = itemsRef.current[activeIndex];
        const containerLeft = containerRef.current.getBoundingClientRect().left;
        const activeRect = activeItem.getBoundingClientRect();

        gsap.to(indicatorRef.current, {
            x: activeRect.left - containerLeft,
            width: activeRect.width,
            duration: 0.5,
            ease: "power3.out"
        });
    };

    useLayoutEffect(() => {
        // Run once DOM is painted
        const timer = setTimeout(updateIndicatorLoc, 50);
        window.addEventListener('resize', updateIndicatorLoc);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateIndicatorLoc);
        }
    }, [activeIndex, location.pathname]);

    const handleNavigate = (e, targetPath, index) => {
        e.preventDefault();

        // If clicking the current tab, and it's not a V1/V2 swap, do nothing
        if (activeIndex === index && !((location.pathname === '/' || isV2) && targetPath === '/v2')) {
            if ((location.pathname === '/' || isV2) && targetPath === '/') {
                // clicking home while on home, do nothing.
                return;
            }
        }

        // If toggling between v1 and v2 or already home
        if ((location.pathname === '/' || isV2) && (targetPath === '/' || targetPath === '/v2')) {
            navigate(targetPath);
            return;
        }

        // Animate Page Out
        const pageWrapper = document.querySelector('.page-wrapper');
        if (pageWrapper) {
            gsap.to(pageWrapper, {
                opacity: 0,
                y: -15, // Subtle lift
                duration: 0.4,
                ease: 'power3.inOut',
                onComplete: () => navigate(targetPath)
            });
        } else {
            navigate(targetPath);
        }
    };

    // Toggle layouts if on home screen
    const handleToggleLayout = (e) => {
        const next = isV2 ? '/' : '/v2';
        handleNavigate(e, next, 0);
    };

    // Entrance Animation
    useEffect(() => {
        if (isAdmin) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(navRef.current,
                { y: -50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 1.5 }
            );
        });
        return () => ctx.revert();
    }, [isAdmin]);

    if (isAdmin) return null;

    return (
        <nav ref={navRef} className="fixed top-0 left-0 w-full z-[80] px-4 md:px-8 py-4 md:py-6 flex justify-between items-center transition-all bg-transparent">

            {/* Logo */}
            <a
                href="/"
                onClick={(e) => handleNavigate(e, '/', 0)}
                className="text-lg md:text-2xl font-display font-medium tracking-[0.2em] text-slate-900 dark:text-white uppercase cursor-pointer z-20 whitespace-nowrap hover:text-primary transition-colors mix-blend-difference"
            >
                Florizza
            </a>

            {/* Central Floating Pill */}
            <div
                ref={containerRef}
                className="absolute left-1/2 -translate-x-1/2 flex items-center p-1 bg-[#F9F8F6]/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full shadow-sm"
            >
                {/* The Sliding Highlight */}
                <div
                    ref={indicatorRef}
                    className="absolute h-[calc(100%-8px)] top-1 bg-white dark:bg-white/10 rounded-full shadow-sm pointer-events-none"
                    style={{ left: 0 }}
                ></div>

                {navItems.map((item, i) => (
                    <a
                        key={item.name}
                        ref={el => itemsRef.current[i] = el}
                        href={item.path}
                        onClick={(e) => handleNavigate(e, item.path, i)}
                        className={`relative z-10 px-4 md:px-6 py-2.5 text-[9px] md:text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors duration-300 ${activeIndex === i
                                ? 'text-primary dark:text-white'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        {item.name}
                    </a>
                ))}
            </div>

            {/* Right Tools */}
            <div className="flex items-center space-x-3 md:space-x-6 z-20 mix-blend-difference text-white">
                {(location.pathname === '/' || isV2) && (
                    <button
                        onClick={handleToggleLayout}
                        className="hidden md:flex items-center justify-center hover:text-primary transition-colors"
                        title="Alternar Tema V1/V2"
                    >
                        <span className="material-symbols-outlined text-lg">{isV2 ? 'view_agenda' : 'space_dashboard'}</span>
                    </button>
                )}

                <button
                    onClick={() => setIsSearchOpen(true)}
                    className="flex items-center justify-center hover:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined text-xl md:text-[22px]">search</span>
                </button>
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative hover:text-primary transition-colors flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-xl md:text-[22px]">shopping_bag</span>
                    {cart.reduce((total, item) => total + item.quantity, 0) > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] sm:text-[9px] font-bold h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center rounded-full border border-white dark:border-zinc-900 shadow-sm">
                            {cart.reduce((total, item) => total + item.quantity, 0)}
                        </span>
                    )}
                </button>
            </div>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </nav>
    );
};

export default Navigation;
