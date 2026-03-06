import { useState, useEffect, useRef } from 'react';
import { useProducts } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

const SearchModal = ({ isOpen, onClose }) => {
    const { products, categories } = useProducts();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef(null);
    const overlayRef = useRef(null);
    const contentRef = useRef(null);
    const lineRef = useRef(null);
    const suggestionRefs = useRef([]);

    const topSearches = categories.slice(0, 5);

    useEffect(() => {
        if (isOpen) {
            gsap.to(overlayRef.current, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' });
            gsap.fromTo(contentRef.current,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.15 }
            );
            gsap.fromTo(lineRef.current,
                { scaleX: 0 },
                { scaleX: 1, duration: 1, ease: 'power3.inOut', delay: 0.3 }
            );
            if (suggestionRefs.current.length > 0) {
                gsap.fromTo(suggestionRefs.current.filter(Boolean),
                    { y: 12, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.5 }
                );
            }
            document.body.style.overflow = 'hidden';
            setTimeout(() => inputRef.current?.focus(), 500);
        } else {
            gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.4, ease: 'power2.in' });
            gsap.to(contentRef.current, { y: -20, opacity: 0, duration: 0.3, ease: 'power2.in' });
            document.body.style.overflow = '';
            setTimeout(() => setSearchTerm(''), 400);
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const filteredProducts = searchTerm.length > 1
        ? products.filter(p =>
            p.active &&
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.category.toLowerCase().includes(searchTerm.toLowerCase()))
        ).slice(0, 4)
        : [];

    const handleProductClick = (id) => {
        onClose();
        navigate(`/produto/${id}`);
    };

    const handleSuggestionClick = (term) => {
        setSearchTerm(term);
        inputRef.current?.focus();
    };

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[90] invisible opacity-0"
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            {/* Backdrop with subtle blur */}
            <div className="absolute inset-0 bg-[#F9F8F6]/97 dark:bg-[#0A0A0A]/97 backdrop-blur-2xl" />

            {/* Content Container — perfectly centered */}
            <div className="relative z-10 h-full flex flex-col items-center justify-start pt-[12vh] md:pt-[15vh] px-6 overflow-y-auto">

                {/* Close Button — top right, minimal */}
                <button
                    onClick={onClose}
                    className="fixed top-6 right-6 md:top-8 md:right-8 z-50 w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 hover:bg-slate-100 dark:hover:bg-white/5 group"
                >
                    <X size={20} strokeWidth={1.5} className="group-hover:rotate-90 transition-transform duration-500" />
                </button>

                {/* Search Content */}
                <div ref={contentRef} className="w-full max-w-xl flex flex-col items-center">

                    {/* Minimal label */}
                    <span className="text-[9px] uppercase tracking-[0.5em] text-slate-400 dark:text-slate-500 font-semibold mb-8">
                        Pesquisar
                    </span>

                    {/* Input Area */}
                    <div className="relative w-full flex items-center group">
                        <Search className="absolute left-0 w-5 h-5 text-slate-300 dark:text-zinc-600 group-focus-within:text-slate-800 dark:group-focus-within:text-white transition-colors duration-300" strokeWidth={1.5} />

                        <input
                            ref={inputRef}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="O que você procura?"
                            className="w-full bg-transparent text-center text-xl md:text-2xl font-light tracking-wide text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-zinc-600 focus:outline-none py-4 px-10 font-display"
                        />

                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-0 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                                <X size={18} strokeWidth={1.5} />
                            </button>
                        )}
                    </div>

                    {/* Elegant underline */}
                    <div className="w-full h-px bg-slate-200/60 dark:bg-zinc-800/80 relative">
                        <div ref={lineRef} className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400 dark:via-slate-500 to-transparent origin-center scale-x-0"></div>
                    </div>

                    {/* Content Below */}
                    <div className="mt-12 md:mt-16 w-full max-w-2xl pb-20">
                        {searchTerm.length < 2 ? (
                            /* Suggestions */
                            <div className="flex flex-col items-center text-center">
                                <h3 className="text-[9px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 font-semibold mb-8">
                                    Termos Frequentes
                                </h3>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {topSearches.map((term, i) => (
                                        <button
                                            key={i}
                                            ref={el => suggestionRefs.current[i] = el}
                                            onClick={() => handleSuggestionClick(term)}
                                            className="px-6 py-2.5 rounded-full border border-slate-200 dark:border-zinc-800 text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-800 dark:hover:text-white transition-all duration-300 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Results */
                            <div className="animate-fade-in">
                                <h3 className="text-[9px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 font-semibold mb-8 text-center">
                                    {filteredProducts.length > 0
                                        ? `${filteredProducts.length} resultado${filteredProducts.length > 1 ? 's' : ''}`
                                        : 'Nenhum resultado'}
                                </h3>

                                {filteredProducts.length > 0 ? (
                                    <div className="flex flex-col gap-1">
                                        {filteredProducts.map((product, i) => (
                                            <button
                                                key={product.id}
                                                onClick={() => handleProductClick(product.id)}
                                                className="w-full flex items-center gap-5 p-4 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-white/5 transition-all duration-300 group text-left"
                                                style={{ animationDelay: `${i * 0.08}s` }}
                                            >
                                                <div className="w-16 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-zinc-800 flex-shrink-0">
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 font-semibold mb-1">{product.category}</p>
                                                    <h4 className="font-display text-base text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors leading-tight truncate">{product.name}</h4>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                                    </p>
                                                </div>
                                                <ArrowRight size={16} className="text-slate-300 dark:text-zinc-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-12 h-12 rounded-full border border-slate-200 dark:border-zinc-800 flex items-center justify-center mb-6">
                                            <Search size={18} className="text-slate-300 dark:text-zinc-600" strokeWidth={1.5} />
                                        </div>
                                        <p className="font-display text-lg text-slate-800 dark:text-slate-200 mb-2">
                                            Nenhuma peça encontrada.
                                        </p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
                                            Tente usar palavras mais curtas ou navegue pelo nosso catálogo completo.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
