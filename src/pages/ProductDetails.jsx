import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ShoppingBag, ChevronLeft, ChevronRight, Ruler, Undo2 } from 'lucide-react';
import FooterInfo from '../components/FooterInfo';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, addToCart } = useProducts();
    const [currentImage, setCurrentImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('Único');
    const [isAdding, setIsAdding] = useState(false);

    const pageRef = useRef();
    const btnRef = useRef();

    const product = products.find(p => p.id === Number(id));
    const relatedProducts = products.filter(p => p.category === product?.category && p.id !== product?.id).slice(0, 4);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (product && pageRef.current) {
            gsap.fromTo(pageRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );
        }
    }, [product]);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="text-center">
                    <h2 className="text-2xl font-serif text-slate-800 dark:text-slate-200 mb-4">Produto não encontrado</h2>
                    <button onClick={() => navigate('/catalogo')} className="text-primary hover:underline uppercase text-xs tracking-widest">
                        Voltar ao Catálogo
                    </button>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        setIsAdding(true);
        gsap.timeline({
            onComplete: () => {
                addToCart(product, 1, selectedSize);
                setTimeout(() => setIsAdding(false), 500);
            }
        })
            .to(btnRef.current, { scale: 0.95, duration: 0.1, ease: 'power2.in' })
            .to(btnRef.current, { scale: 1.02, backgroundColor: '#82cf17', duration: 0.2, ease: 'back.out(2)' })
            .to(btnRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
    };

    return (
        <div ref={pageRef} className="page-wrapper min-h-screen bg-background-light dark:bg-background-dark pt-24 pb-20 transition-colors">
            {/* Breadcrumb / Back */}
            <div className="container mx-auto px-6 md:px-12 lg:px-24 mb-6">
                <button
                    onClick={() => navigate('/catalogo')}
                    className="flex items-center text-xs text-slate-500 hover:text-primary transition-colors uppercase tracking-widest"
                >
                    <Undo2 className="w-4 h-4 mr-2" /> Voltar
                </button>
            </div>

            <div className="container mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                {/* Images Section */}
                <div className="flex flex-col-reverse md:flex-row gap-4 h-full">
                    {/* Thumbnails */}
                    {product.images.length > 1 && (
                        <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar py-2 md:w-24 shrink-0">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImage(idx)}
                                    className={`relative w-20 md:w-full aspect-[3/4] rounded-sm overflow-hidden border-2 transition-all ${currentImage === idx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Main Image */}
                    <div className="relative flex-1 aspect-[3/4] md:aspect-[4/5] bg-[#EBE9E6] dark:bg-zinc-800 rounded-md overflow-hidden group">
                        <img
                            src={product.images[currentImage]}
                            alt={product.name}
                            className="w-full h-full object-cover object-top"
                        />
                        {/* Tags */}
                        {product.stock === 1 && (
                            <div className="absolute top-4 left-4 bg-primary text-white text-[9px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-md">
                                Última peça
                            </div>
                        )}
                        {/* Mobile Swipe Indicators */}
                        {product.images.length > 1 && (
                            <div className="absolute inset-y-0 left-0 right-0 flex justify-between items-center px-4 md:hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center pointer-events-auto shadow-sm text-slate-800"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImage(prev => prev === 0 ? product.images.length - 1 : prev - 1);
                                    }}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center pointer-events-auto shadow-sm text-slate-800"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImage(prev => prev === product.images.length - 1 ? 0 : prev + 1);
                                    }}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Section */}
                <div className="flex flex-col justify-center py-6 lg:py-12">
                    <span className="text-xs uppercase tracking-[0.2em] font-medium text-slate-500 dark:text-slate-400 mb-4">{product.category}</span>
                    <h1 className="hero-serif text-3xl md:text-4xl lg:text-5xl text-slate-900 dark:text-white mb-6 leading-tight">{product.name}</h1>
                    <p className="text-2xl font-medium text-slate-800 dark:text-slate-200 mb-8">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                    </p>

                    {/* Size Selector */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300 font-semibold">Tamanho</span>
                            <button className="flex items-center text-[10px] uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
                                <Ruler className="w-3 h-3 mr-1" /> Guia de Medidas
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedSize('Único')}
                                className="px-6 py-3 rounded-sm border border-primary bg-primary text-white text-sm font-medium shadow-md cursor-default pointer-events-none"
                            >
                                Tamanho Único
                            </button>
                        </div>
                    </div>

                    {/* Add to Cart */}
                    <button
                        ref={btnRef}
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className={`w-full py-5 flex items-center justify-center gap-3 text-white text-sm tracking-[0.2em] uppercase font-bold rounded-sm shadow-xl transition-all ${product.stock === 0 ? 'bg-slate-300 dark:bg-zinc-800 cursor-not-allowed text-slate-500' : isAdding ? 'bg-[#82cf17] shadow-[0_0_30px_rgba(130,207,23,0.5)]' : 'bg-primary hover:bg-[#62b412] hover:-translate-y-1 active:scale-95'}`}
                    >
                        <ShoppingBag size={20} />
                        {product.stock === 0 ? 'Esgotado' : isAdding ? 'Adicionado à Sacola' : 'Adicionar à Sacola'}
                    </button>

                    {/* Accordeons (Mocked functionality) */}
                    <div className="mt-12 border-t border-slate-100 dark:border-zinc-800">
                        <details className="group border-b border-slate-100 dark:border-zinc-800 text-sm" open>
                            <summary className="flex items-center justify-between py-5 cursor-pointer text-slate-800 dark:text-slate-200 uppercase tracking-widest font-semibold text-xs">
                                Descrição
                                <span className="transition group-open:rotate-180">
                                    <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" w="24"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </span>
                            </summary>
                            <p className="pb-5 text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                                Peça exímia da coleção "Quiet Luxury". Feita com tecido premium, caimento impecável que valoriza a silhueta com elegância discreta e sofisticação atemporal. Uma adição essencial ao guarda-roupa da mulher moderna.
                            </p>
                        </details>
                        <details className="group border-b border-slate-100 dark:border-zinc-800 text-sm">
                            <summary className="flex items-center justify-between py-5 cursor-pointer text-slate-800 dark:text-slate-200 uppercase tracking-widest font-semibold text-xs">
                                Composição e Cuidados
                                <span className="transition group-open:rotate-180">
                                    <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" w="24"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </span>
                            </summary>
                            <p className="pb-5 text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                                95% Poliéster, 5% Elastano de alta gramatura.<br />
                                Lavagem à mão recomendada. Não usar alvejante. Passar em temperatura baixa.
                            </p>
                        </details>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="container mx-auto px-6 md:px-12 lg:px-24 mt-24">
                    <h2 className="hero-serif text-3xl text-slate-900 dark:text-white mb-10 text-center md:text-left">Você também pode gostar</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedProducts.map(rp => (
                            <div
                                key={rp.id}
                                onClick={() => navigate(`/produto/${rp.id}`)}
                                className="group cursor-pointer"
                            >
                                <div className="aspect-[3/4] overflow-hidden rounded-sm bg-[#EBE9E6] dark:bg-zinc-800 mb-4">
                                    <img src={rp.images[0]} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                </div>
                                <h3 className="text-xs uppercase tracking-widest text-slate-800 dark:text-slate-200 truncate">{rp.name}</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rp.price)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-20">
                <FooterInfo variant={1} />
            </div>
        </div>
    );
};

export default ProductDetails;
