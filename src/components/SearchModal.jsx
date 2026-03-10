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
    const panelRef = useRef(null);
    const overlayRef = useRef(null);
    const resultsRef = useRef(null);

    const topSearches = categories.slice(0, 4);

    useEffect(() => {
        if (isOpen) {
            // Animate overlay (just for clicking outside)
            gsap.to(overlayRef.current, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' });

            // Animate panel opening (slide down & fade)
            gsap.fromTo(panelRef.current,
                { y: -15, opacity: 0, scale: 0.98 },
                { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' }
            );

            // Stagger in content if there are results
            if (resultsRef.current && resultsRef.current.children) {
                gsap.fromTo(resultsRef.current.children,
                    { y: 10, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
                );
            }

            // Focus input immediately but smoothly
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            // Animate out
            gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.2, ease: 'power2.in' });
            gsap.to(panelRef.current, {
                y: -10, opacity: 0, scale: 0.98, duration: 0.25, ease: 'power2.in',
                onComplete: () => setSearchTerm('')
            });
        }
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
            className={`fixed inset-0 z-[85] invisible ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{ opacity: 0 }}
        >
            {/* Invisible backdrop just to catch clicks outside */}
            <div
                className="absolute inset-0 cursor-default"
                onClick={onClose}
                aria-label="Close search"
            />

            {/* Floating Search Panel */}
            <div
                ref={panelRef}
                className="absolute top-[70px] md:top-[85px] right-4 md:right-12 lg:right-20 w-[calc(100vw-32px)] md:w-[420px] max-h-[80vh] overflow-hidden flex flex-col bg-[#F9F8F6]/95 dark:bg-[#0A0A0A]/95 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-2xl z-10 opacity-0 transform-gpu"
            >
                {/* Search Input Area */}
                <div className="flex-shrink-0 px-5 pt-5 pb-3 border-b border-slate-200/50 dark:border-zinc-800/80">
                    <div className="relative flex items-center group">
                        <Search className="absolute left-0 w-4 h-4 text-slate-400 group-focus-within:text-slate-800 dark:text-zinc-500 dark:group-focus-within:text-white transition-colors" strokeWidth={1.5} />

                        <input
                            ref={inputRef}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="O que você procura?"
                            className="w-full bg-transparent text-sm md:text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none pl-8 pr-8 font-light tracking-wide font-display"
                        />

                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-0 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                            >
                                <X size={14} strokeWidth={2} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Scrollable Results Area */}
                <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
                    {searchTerm.length < 2 ? (
                        /* Suggestions State */
                        <div className="pb-2">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 font-bold mb-4">
                                Termos Frequentes
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {topSearches.map((term, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSuggestionClick(term)}
                                        className="px-4 py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 text-[10px] uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors bg-white/50 dark:bg-black/20"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Results State */
                        <div ref={resultsRef} className="flex flex-col gap-1 pb-2">
                            {filteredProducts.length > 0 ? (
                                <>
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 font-bold mb-3">
                                        Resultados ({filteredProducts.length})
                                    </h3>
                                    {filteredProducts.map((product) => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleProductClick(product.id)}
                                            className="w-full flex items-center justify-between p-2.5 -mx-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group text-left"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-12 rounded-md overflow-hidden bg-slate-100 dark:bg-zinc-800 flex-shrink-0">
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-display text-[13px] text-slate-900 dark:text-slate-200 group-hover:text-slate-600 dark:group-hover:text-white transition-colors truncate leading-tight">
                                                        {product.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
                                                            {product.category}
                                                        </span>
                                                        <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-zinc-700"></span>
                                                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowRight size={14} className="text-slate-300 dark:text-zinc-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all flex-shrink-0 ml-2" />
                                        </button>
                                    ))}
                                </>
                            ) : (
                                <div className="py-6 flex flex-col items-center justify-center text-center">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
                                        <Search size={14} className="text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                                    </div>
                                    <p className="font-display text-sm text-slate-800 dark:text-slate-300">
                                        Nenhuma peça encontrada.
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 max-w-[200px]">
                                        Tente navegar pelas categorias do catálogo.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
