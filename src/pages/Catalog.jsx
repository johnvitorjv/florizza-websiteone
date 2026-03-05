import { useState, useEffect, useRef } from 'react';
import { useProducts } from '../context/ProductContext';
import { ShoppingBag, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const ProductCard = ({ product, viewMode }) => {
    const defaultIndex = product.coverIndex || 0;
    const [currentImageIdx, setCurrentImageIdx] = useState(defaultIndex);
    const { addToCart, trackEvent } = useProducts();
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);
    const btnRef = useRef(null);
    const listBtnRef = useRef(null);

    // Auto crossfade images
    useEffect(() => {
        if (!product.images || product.images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIdx(prev => (prev + 1) % product.images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [product.images]);

    const handleDotClick = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIdx(index);
    };

    return (
        <div
            onClick={() => navigate(`/produto/${product.id}`)}
            className={`product-card-anim flex ${viewMode === 'list' ? 'flex-row items-center gap-6' : 'flex-col gap-4'} group cursor-pointer`}
        >
            <div className={`relative overflow-hidden rounded-md bg-[#EBE9E6] dark:bg-zinc-800 ${viewMode === 'list' ? 'w-1/3 aspect-[3/4]' : 'w-full aspect-[4/5]'}`}>
                {/* Image Crossfade Layers */}
                {product.images.map((img, idx) => (
                    <img
                        key={idx}
                        alt={`${product.name} - ${idx}`}
                        src={img}
                        className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-1000 group-hover:scale-110 group-hover:duration-[3000ms] ${idx === currentImageIdx ? 'opacity-100 z-10' : 'opacity-0 scale-[1.02] z-0 pointer-events-none'}`}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80' }}
                    />
                ))}

                {/* Dots Pagination */}
                {product.images.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {product.images.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => handleDotClick(e, i)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                                aria-label={`Ver imagem ${i + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Tags and Icons */}
                {product.featured && (
                    <div className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm z-10">
                        <span className="material-symbols-outlined text-amber-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                )}

                {product.stock === 1 && (
                    <div className="absolute top-4 left-4 inline-block bg-primary text-white text-[9px] uppercase tracking-wider font-bold px-3 py-1 rounded-full z-10 shadow-md">
                        Última peça
                    </div>
                )}
                {product.stock === 0 && (
                    <div className="absolute top-4 left-4 inline-block bg-red-500 text-white text-[9px] uppercase tracking-wider font-bold px-3 py-1 rounded-full z-10 shadow-md">
                        Esgotado
                    </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-12 gap-4">
                    <button
                        ref={btnRef}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            // Impeccable Button Animation
                            setIsAdding(true);
                            if (trackEvent) trackEvent('add_to_cart', { product_id: product.id, product_name: product.name, price: product.price });
                            gsap.timeline({
                                onComplete: () => {
                                    addToCart(product);
                                    setTimeout(() => setIsAdding(false), 500);
                                }
                            })
                                .to(btnRef.current, { scale: 0.9, duration: 0.1, ease: 'power2.in' })
                                .to(btnRef.current, { scale: 1.1, backgroundColor: '#82cf17', duration: 0.2, ease: 'back.out(2)' })
                                .to(btnRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
                        }}
                        className={`flex items-center gap-2 text-white px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-all transform translate-y-8 group-hover:translate-y-0 duration-500 shadow-lg ${isAdding ? 'bg-[#82cf17] shadow-[0_0_20px_rgba(130,207,23,0.6)]' : 'bg-primary hover:bg-[#62b412] hover:scale-105 active:scale-95'}`}
                    >
                        <ShoppingBag size={18} /> {isAdding ? 'Na Sacola' : 'Adicionar'}
                    </button>
                    <button title="Espiar" className="flex items-center justify-center size-12 bg-white/95 text-slate-800 rounded-full hover:bg-white hover:text-primary transition-all transform translate-y-8 group-hover:translate-y-0 duration-500 delay-75 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95">
                        <Eye size={20} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col flex-1">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2">{product.category}</span>
                <h3 className="hero-serif text-xl text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                </p>
                {viewMode === 'list' && (
                    <div className="mt-6 flex gap-4">
                        <button
                            ref={listBtnRef}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                setIsAdding(true);
                                if (trackEvent) trackEvent('add_to_cart', { product_id: product.id, product_name: product.name, price: product.price });
                                gsap.timeline({
                                    onComplete: () => {
                                        addToCart(product);
                                        setTimeout(() => setIsAdding(false), 500);
                                    }
                                })
                                    .to(listBtnRef.current, { scale: 0.95, duration: 0.1, ease: 'power2.in' })
                                    .to(listBtnRef.current, { scale: 1.05, backgroundColor: '#82cf17', duration: 0.2, ease: 'back.out(2)' })
                                    .to(listBtnRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
                            }}
                            className={`px-8 py-3 text-white text-xs tracking-widest uppercase rounded-full transition-all transform hover:-translate-y-1 font-bold flex items-center gap-2 shadow-md ${isAdding ? 'bg-[#82cf17] shadow-[0_0_20px_rgba(130,207,23,0.6)]' : 'bg-primary hover:bg-[#62b412] hover:shadow-[0_8px_20px_rgb(115,207,23,0.3)] active:scale-95'}`}
                        >
                            <ShoppingBag size={16} /> {isAdding ? 'Adicionado' : 'Comprar Agora'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const Catalog = () => {
    const { products, trackEvent } = useProducts();
    const [filterCategory, setFilterCategory] = useState('Todos');
    const [sortBy, setSortBy] = useState('recentes'); // recentes, preco_crescente, preco_decrescente
    const [viewMode, setViewMode] = useState('grid');
    const catalogRef = useRef();

    useEffect(() => {
        if (trackEvent) trackEvent('page_view', { page: 'catalogo' });

        // Initial entrance animation
        const tl = gsap.timeline();

        tl.fromTo(catalogRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: 'power2.out' }
        ).fromTo('.product-card-anim',
            { opacity: 0, y: 30, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.2)' },
            "-=0.2"
        );
    }, [filterCategory, viewMode, sortBy]);

    // Filter and Sort Logic
    let displayProducts = products.filter(p => p.active);

    if (filterCategory !== 'Todos') {
        displayProducts = displayProducts.filter(p => p.category === filterCategory);
    }

    displayProducts.sort((a, b) => {
        if (sortBy === 'preco_crescente') return a.price - b.price;
        if (sortBy === 'preco_decrescente') return b.price - a.price;
        // recentes (by orderIndex descending, then creation)
        if (a.orderIndex !== b.orderIndex) return b.orderIndex - a.orderIndex; // Higher index first
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return (
        <div ref={catalogRef} className="page-wrapper pt-32 px-6 md:px-12 lg:px-24 min-h-screen bg-background-light dark:bg-background-dark pb-24 transition-colors">
            {/* Title Section */}
            <div className="mb-12 text-center md:text-left">
                <h1 className="hero-serif text-5xl font-light italic text-slate-900 dark:text-slate-100 leading-tight">Catálogo</h1>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500 mt-4">Coleção Atemporal 2026</p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4 mb-8">
                {['Todos', 'Conjunto', 'Vestidos'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`flex h-12 items-center justify-center rounded-full px-8 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 shadow-sm hover:shadow-md ${filterCategory === cat
                            ? 'bg-primary border-primary text-white shadow-primary/20 hover:shadow-primary/30'
                            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:border-primary/50 hover:text-primary'
                            } border`}
                    >
                        <p className="text-sm font-medium">{cat}</p>
                    </button>
                ))}
            </div>

            {/* Sorting & View Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 border-y border-slate-200 dark:border-zinc-800 mb-10 gap-4">
                <div className="flex gap-6">
                    <button
                        onClick={() => setSortBy(sortBy === 'preco_crescente' ? 'preco_decrescente' : 'preco_crescente')}
                        className={`flex items-center gap-1 text-xs font-bold tracking-wider uppercase transition-colors ${sortBy.includes('preco') ? 'text-primary' : 'text-slate-400'}`}
                    >
                        Preço
                        <span className="material-symbols-outlined text-sm">unfold_more</span>
                    </button>
                    <button
                        onClick={() => setSortBy('recentes')}
                        className={`flex items-center gap-1 text-xs font-bold tracking-wider uppercase transition-colors ${sortBy === 'recentes' ? 'text-primary' : 'text-slate-400'}`}
                    >
                        Recentes
                        <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                    </button>
                </div>
                <div className="flex gap-4">
                    <span className="text-xs text-slate-400 font-medium my-auto mr-4">{displayProducts.length} peças</span>
                    <button onClick={() => setViewMode('list')} className="transition-transform hover:scale-110">
                        <span className={`material-symbols-outlined ${viewMode === 'list' ? 'text-primary' : 'text-slate-400 dark:text-slate-600'}`}>view_list</span>
                    </button>
                    <button onClick={() => setViewMode('grid')} className="transition-transform hover:scale-110">
                        <span className={`material-symbols-outlined ${viewMode === 'grid' ? 'text-primary' : 'text-slate-400 dark:text-slate-600'}`}>grid_view</span>
                    </button>
                </div>
            </div>

            {/* Product Grid / List */}
            <div className={`grid gap-x-8 gap-y-12 ${viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 lg:grid-cols-2'
                }`}>
                {displayProducts.map(product => (
                    <div key={product.id} className="product-card-anim">
                        <ProductCard product={product} viewMode={viewMode} />
                    </div>
                ))}
            </div>

            {displayProducts.length === 0 && (
                <div className="py-20 text-center">
                    <p className="text-slate-500 font-light text-lg">Nenhum produto encontrado nesta categoria.</p>
                </div>
            )}
        </div>
    );
};

export default Catalog;
