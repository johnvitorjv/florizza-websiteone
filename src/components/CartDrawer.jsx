import { useEffect, useRef, useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
    const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateCartItemQuantity, clearCart } = useProducts();
    const navigate = useNavigate();
    const overlayRef = useRef(null);
    const drawerRef = useRef(null);
    const [itemToDelete, setItemToDelete] = useState(null); // { id, size }

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Animation Effect
    useEffect(() => {
        if (isCartOpen) {
            gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, display: 'block', ease: 'power2.out' });
            gsap.to(drawerRef.current, { x: 0, duration: 0.4, ease: 'power3.out' });
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, display: 'none', ease: 'power2.in' });
            gsap.to(drawerRef.current, { x: '100%', duration: 0.4, ease: 'power3.in' });
            document.body.style.overflow = '';
        }

        // Cleanup
        return () => { document.body.style.overflow = ''; };
    }, [isCartOpen]);

    const handleQuantityChange = (item, newQuantity) => {
        if (newQuantity === 0) {
            setItemToDelete({ id: item.id, size: item.size });
        } else {
            updateCartItemQuantity(item.id, item.size, newQuantity);
        }
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            removeFromCart(itemToDelete.id, itemToDelete.size);
            setItemToDelete(null);
        }
    };

    const formatPrice = (price) => {
        return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/checkout');
    };

    return (
        <>
            {/* Overlay */}
            <div
                ref={overlayRef}
                className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 hidden opacity-0"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-zinc-950 shadow-2xl z-50 transform translate-x-full flex flex-col border-l border-slate-100 dark:border-white/5"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
                    <h2 className="text-sm uppercase tracking-widest font-semibold flex items-center text-slate-800 dark:text-white">
                        <ShoppingBag className="w-4 h-4 mr-3" /> Sacola ({cart.reduce((a, c) => a + c.quantity, 0)})
                    </h2>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-500 dark:text-slate-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-4">
                            <ShoppingBag className="w-12 h-12 opacity-20" />
                            <p className="text-sm uppercase tracking-widest">Sua sacola está vazia</p>
                            <button
                                onClick={() => {
                                    setIsCartOpen(false);
                                    navigate('/catalogo');
                                }}
                                className="mt-4 px-6 py-3 border border-slate-200 dark:border-white/10 text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
                            >
                                Ver Coleção
                            </button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={`${item.id}-${item.size}`} className="flex gap-4 relative">
                                {/* Delete Confirmation Overlay for single item */}
                                {itemToDelete?.id === item.id && itemToDelete?.size === item.size && (
                                    <div className="absolute inset-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center border border-red-100 dark:border-red-900/30 rounded-md">
                                        <p className="text-xs text-slate-800 dark:text-slate-200 mb-3">Remover do pedido?</p>
                                        <div className="flex gap-3">
                                            <button onClick={() => setItemToDelete(null)} className="px-3 py-1.5 text-[10px] sm:text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5">Não</button>
                                            <button onClick={confirmDelete} className="px-3 py-1.5 text-[10px] sm:text-xs bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20">Sim, remover</button>
                                        </div>
                                    </div>
                                )}

                                <div className="w-20 h-28 bg-plaster dark:bg-zinc-900 rounded-md overflow-hidden shrink-0">
                                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col py-1">
                                    <h3 className="text-sm font-medium text-slate-800 dark:text-white leading-tight pr-6">{item.name}</h3>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase mt-1">Tam: {item.size}</p>
                                    <div className="mt-auto flex items-center justify-between">
                                        <p className="text-sm text-slate-800 dark:text-slate-300 font-medium">{formatPrice(item.price)}</p>

                                        {/* Quantity Control */}
                                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-sm">
                                            <button
                                                onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white transition-colors"
                                            >
                                                {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5" />}
                                            </button>
                                            <span className="w-6 text-center text-xs text-slate-800 dark:text-slate-200 font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-plaster/30 dark:bg-black/20">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400">Subtotal</span>
                            <span className="text-xl hero-serif text-slate-900 dark:text-white">{formatPrice(subtotal)}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full py-4 bg-primary text-white text-xs font-semibold tracking-widest uppercase rounded-sm hover:bg-opacity-90 transition-colors"
                        >
                            Finalizar Pedido
                        </button>
                        <p className="text-[10px] text-center text-slate-400 mt-4 uppercase tracking-widest">
                            Frete calculado na próxima etapa
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
