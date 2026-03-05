import { useState, useEffect, useRef } from 'react';
import { useProducts } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import gsap from 'gsap';

const SearchModal = ({ isOpen, onClose }) => {
    const { products, categories } = useProducts();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef(null);
    const overlayRef = useRef(null);
    const modalRef = useRef(null);
    const lineRef = useRef(null);
    const suggestionRefs = useRef([]);

    // Busca apenas o que realmente existe nas categorias
    // Caso não tenha produto na categoria, ela ainda existe no admin se o usuário a criou,
    // o que satisfaz o requisito ("o que realmente tem em catalogo... atualiza junto").
    const topSearches = categories.slice(0, 5);

    useEffect(() => {
        if (isOpen) {
            // Animate overlay in
            gsap.to(overlayRef.current, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' });

            // Animate modal container up slightly
            gsap.fromTo(modalRef.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.2 }
            );

            // Animate the thin line growing from center
            gsap.fromTo(lineRef.current,
                { scaleX: 0 },
                { scaleX: 1, duration: 0.8, ease: 'power3.inOut', delay: 0.3 }
            );

            // Animate suggestions fading in with stagger
            if (suggestionRefs.current.length > 0) {
                gsap.fromTo(suggestionRefs.current,
                    { y: 10, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.5 }
                );
            }

            document.body.style.overflow = 'hidden';
            setTimeout(() => inputRef.current?.focus(), 600); // Focus after animations
        } else {
            // Smooth exit
            gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.4, ease: 'power2.in' });
            gsap.to(modalRef.current, { y: -20, opacity: 0, duration: 0.3, ease: 'power2.in' });
            document.body.style.overflow = '';
            setTimeout(() => setSearchTerm(''), 400); // clear after close
        }

        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Handle search logic
    const filteredProducts = searchTerm.length > 1
        ? products.filter(p =>
            p.active &&
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.category.toLowerCase().includes(searchTerm.toLowerCase()))
        ).slice(0, 4) // Show up to 4 beautiful cards
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
            className="fixed inset-0 bg-[#F9F8F6]/95 dark:bg-[#0A0A0A]/95 backdrop-blur-xl z-[90] invisible opacity-0"
        >
            <div className="container mx-auto px-6 md:px-12 h-full flex flex-col pt-[15vh] max-w-4xl relative">

                {/* Close Button - Minimalist */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-6 md:right-12 p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
                >
                    <X size={24} strokeWidth={1} className="group-hover:rotate-90 transition-transform duration-500" />
                    <span className="sr-only">Fechar busca</span>
                </button>

                {/* Main Search Area */}
                <div ref={modalRef} className="w-full relative flex flex-col items-center">

                    {/* The Input */}
                    <div className="relative w-full max-w-2xl flex items-center justify-center group">
                        <Search className="absolute left-0 w-5 h-5 text-slate-300 dark:text-zinc-600 group-focus-within:text-primary transition-colors" strokeWidth={1.5} />

                        <input
                            ref={inputRef}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar no catálogo..."
                            className="w-full bg-transparent text-center text-lg md:text-2xl font-light tracking-wide text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-zinc-700 focus:outline-none py-4 px-10"
                        />

                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-0 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                                <X size={18} strokeWidth={1.5} />
                            </button>
                        )}
                    </div>

                    {/* The Animated Line */}
                    <div className="w-full max-w-2xl h-[1px] bg-slate-200 dark:bg-zinc-800 relative mt-2">
                        <div ref={lineRef} className="absolute inset-0 bg-primary origin-center scale-x-0"></div>
                    </div>

                    {/* Content Area */}
                    <div className="mt-16 w-full max-w-3xl h-[60vh] overflow-y-auto no-scrollbar pb-20">
                        {searchTerm.length < 2 ? (
                            // Suggestions - minimal tags
                            <div className="flex flex-col items-center animate-fade-in text-center">
                                <h3 className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-semibold mb-8">
                                    Termos Frequentes
                                </h3>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {topSearches.map((term, i) => (
                                        <button
                                            key={i}
                                            ref={el => suggestionRefs.current[i] = el}
                                            onClick={() => handleSuggestionClick(term)}
                                            className="px-6 py-2 rounded-full border border-slate-200 dark:border-zinc-800 text-xs font-medium tracking-wider uppercase text-slate-500 hover:border-primary hover:text-primary hover:shadow-[0_0_15px_rgba(115,207,23,0.15)] transition-all bg-white/50 dark:bg-black/20 backdrop-blur-sm"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Results Search
                            <div className="animate-fade-in">
                                <h3 className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-semibold mb-8 text-center">
                                    Encontrado para "{searchTerm}"
                                </h3>

                                {filteredProducts.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {filteredProducts.map((product, i) => (
                                            <div
                                                key={product.id}
                                                onClick={() => handleProductClick(product.id)}
                                                className="group cursor-pointer flex flex-col gap-3 fade-in-up"
                                                style={{ animationDelay: `${i * 0.1}s` }}
                                            >
                                                <div className="w-full aspect-[3/4] bg-[#F2F0ED] dark:bg-zinc-900 rounded-sm overflow-hidden relative">
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 z-10"></div>
                                                </div>
                                                <div className="text-center">
                                                    <h4 className="text-sm font-display text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight mb-1">{product.name}</h4>
                                                    <p className="text-xs font-medium text-slate-500">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                                        <Search className="w-8 h-8 text-slate-200 dark:text-zinc-800 mb-6" strokeWidth={1} />
                                        <p className="text-lg font-display text-slate-800 dark:text-slate-200 mb-2">
                                            Nenhuma peça encontrada.
                                        </p>
                                        <p className="text-xs text-slate-400 max-w-xs">
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
