import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { ChevronLeft, Check, Truck, MapPin, Store } from 'lucide-react';
import gsap from 'gsap';

const Checkout = () => {
    const { cart, clearCart, settings, trackEvent } = useProducts();
    const navigate = useNavigate();
    const pageRef = useRef(null);
    const btnRef = useRef(null);
    const waOverlayRef = useRef(null);
    const waIconRef = useRef(null);
    const waRingRef = useRef(null);
    const waCheckRef = useRef(null);
    const waTextRef = useRef(null);
    const [isCompleting, setIsCompleting] = useState(false);
    const [showWAAnimation, setShowWAAnimation] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: ''
    });

    const [loadingCep, setLoadingCep] = useState(false);
    const [shippingOptions, setShippingOptions] = useState([]);
    const [selectedShipping, setSelectedShipping] = useState(null);
    const [shippingCost, setShippingCost] = useState(0);

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = subtotal + shippingCost;

    useEffect(() => {
        window.scrollTo(0, 0);
        if (cart.length === 0) {
            navigate('/catalogo');
            return;
        }

        if (trackEvent) {
            trackEvent('checkout_started', {
                cart_value: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
                items_count: cart.length
            });
        }

        gsap.fromTo(pageRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );
    }, [cart, navigate, trackEvent]);

    // Handle form input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'cep' && value.replace(/\D/g, '').length === 8) {
            fetchAddress(value.replace(/\D/g, ''));
        }
    };

    // ViaCEP Integration
    const fetchAddress = async (cepStr) => {
        setLoadingCep(true);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cepStr}/json/`);
            const data = await res.json();

            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    street: data.logradouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf
                }));
                generateShippingOptions(data.localidade);
            }
        } catch (error) {
            console.error('ViaCEP Error:', error);
        } finally {
            setLoadingCep(false);
        }
    };

    // Dynamic Shipping Logic
    const generateShippingOptions = (city) => {
        const localCities = ['Salvador', 'Lauro de Freitas', 'Simões Filho'];

        if (localCities.includes(city)) {
            setShippingOptions([
                { id: 'retirada', name: 'Retirada na Loja', price: 0, time: 'Hoje', icon: Store },
                { id: 'uber', name: 'Uber Flash Moto', price: 'A combinar', time: 'Hoje', icon: Truck }
            ]);
            setSelectedShipping('retirada');
            setShippingCost(0);
        } else {
            setShippingOptions([
                { id: 'pac', name: 'Correios PAC', price: 25.90, time: '7-10 dias úteis', icon: Truck },
                { id: 'sedex', name: 'Correios Sedex', price: 45.90, time: '2-4 dias úteis', icon: Truck }
            ]);
            setSelectedShipping('pac');
            setShippingCost(25.90);
        }
    };

    const handleShippingChange = (option) => {
        setSelectedShipping(option.id);
        setShippingCost(typeof option.price === 'number' ? option.price : 0);
    };

    // Format Currency
    const formatPrice = (price) => {
        if (typeof price === 'string') return price;
        return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Form submit animation intercept
    const handleActionSubmit = (e) => {
        e.preventDefault();

        if (!selectedShipping) {
            alert('Por favor, selecione um método de entrega.');
            return;
        }

        // Ensure form validation passes before animating
        const form = document.getElementById('checkout-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        setIsCompleting(true);

        if (trackEvent) {
            trackEvent('checkout_completed', {
                total_value: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
                shipping_method: selectedShipping
            });
        }

        // ── Spectacular WhatsApp Animation ──────────────────────────────
        setShowWAAnimation(true);

        // Give React a frame to render the overlay before animating
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const overlay = waOverlayRef.current;
                const icon = waIconRef.current;
                const ring = waRingRef.current;
                const check = waCheckRef.current;
                const text = waTextRef.current;
                if (!overlay) return;

                gsap.set(overlay, { autoAlpha: 0 });
                gsap.set(icon, { scale: 0, opacity: 0, y: 40 });
                gsap.set(ring, { scale: 0.5, opacity: 0 });
                gsap.set(check, { scale: 0, opacity: 0, rotation: -45 });
                gsap.set(text, { opacity: 0, y: 20 });

                const tl = gsap.timeline({
                    onComplete: () => {
                        handleSubmit();
                    }
                });

                // 1. Fade in black overlay with page blur
                tl.to(overlay, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' })
                    // 2. Pulse ring burst
                    .to(ring, { scale: 1.6, opacity: 0.3, duration: 0.6, ease: 'power3.out' }, '-=0.1')
                    .to(ring, { scale: 2.2, opacity: 0, duration: 0.5, ease: 'power2.in' }, '-=0.1')
                    // 3. WhatsApp icon elastic entrance
                    .to(icon, { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'elastic.out(1.2, 0.5)' }, '-=0.4')
                    // 4. Second ring burst (ripple effect)
                    .set(ring, { scale: 0.8, opacity: 0.4 })
                    .to(ring, { scale: 3, opacity: 0, duration: 0.9, ease: 'power2.out' }, '-=0.2')
                    // 5. Checkmark pops in
                    .to(check, { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: 'back.out(3)' }, '-=0.5')
                    // 6. Motivational text appears
                    .to(text, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2')
                    // 7. Hold for a beat
                    .to({}, { duration: 0.9 })
                    // 8. Flash out with radial white burst
                    .to(overlay, { backgroundColor: '#25D366', duration: 0.3, ease: 'power2.in' })
                    .to(overlay, { autoAlpha: 0, scale: 1.1, duration: 0.4, ease: 'power3.out' });
            });
        });
    };

    // WhatsApp Order Generation
    const handleSubmit = () => {

        const orderId = Math.random().toString(36).substr(2, 6).toUpperCase();

        let message = `*NOVO PEDIDO FLORIZZA* 🛍️\n`;
        message += `ID: #${orderId}\n\n`;

        message += `*Cliente:* ${formData.firstName} ${formData.lastName}\n`;
        message += `*Telefone:* ${formData.phone}\n\n`;

        message += `*Itens do Pedido:*\n`;
        cart.forEach(item => {
            message += `- ${item.quantity}x ${item.name} (Tam: ${item.size}) - ${formatPrice(item.price * item.quantity)}\n`;
        });

        message += `\n*Entrega:*\n`;
        const shippingDetails = shippingOptions.find(o => o.id === selectedShipping);
        message += `Método: ${shippingDetails.name}\n`;

        if (shippingDetails.id !== 'retirada') {
            message += `Endereço: ${formData.street}, ${formData.number}`;
            if (formData.complement) message += ` (${formData.complement})`;
            message += `\n${formData.neighborhood} - ${formData.city}/${formData.state}\n`;
            message += `CEP: ${formData.cep}\n`;
        }

        message += `\n*Valores:*\n`;
        message += `Subtotal: ${formatPrice(subtotal)}\n`;
        message += `Frete: ${typeof shippingDetails.price === 'number' ? formatPrice(shippingDetails.price) : shippingDetails.price}\n`;
        message += `*Total: ${formatPrice(total)}*\n\n`;

        message += `Olá! Gostaria de finalizar este pedido.`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${settings.whatsapp}?text=${encodedMessage}`, '_blank');

        // Clear cart after a small delay implying success
        setTimeout(() => {
            clearCart();
            navigate('/');
        }, 1000);
    };

    return (
        <div ref={pageRef} className="page-wrapper min-h-screen bg-plaster dark:bg-zinc-950 pt-24 pb-20 font-sans transition-colors">

            {/* ── Spectacular WhatsApp Animation Overlay ── */}
            {showWAAnimation && (
                <div
                    ref={waOverlayRef}
                    className="fixed inset-0 z-[200] bg-black flex items-center justify-center flex-col gap-8"
                    style={{ visibility: 'hidden', opacity: 0 }}
                >
                    {/* Pulsing ring */}
                    <div
                        ref={waRingRef}
                        className="absolute w-48 h-48 rounded-full border-4 border-[#25D366]/60"
                        style={{ opacity: 0 }}
                    />
                    {/* WhatsApp icon */}
                    <div
                        ref={waIconRef}
                        className="relative w-36 h-36 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_0_60px_rgba(37,211,102,0.5)]"
                        style={{ opacity: 0 }}
                    >
                        <svg viewBox="0 0 32 32" fill="white" className="w-20 h-20">
                            <path d="M16 0C7.163 0 0 7.163 0 16c0 2.82.733 5.467 2.015 7.77L0 32l8.445-2.015A15.933 15.933 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.091a13.07 13.07 0 01-6.664-1.82l-.48-.284-4.977 1.187 1.21-4.844-.315-.5A13.052 13.052 0 012.91 16C2.91 9.295 8.295 3.91 16 3.91S29.091 9.295 29.091 16 23.705 29.091 16 29.091zm7.156-9.782c-.392-.196-2.32-1.144-2.68-1.275-.36-.13-.622-.196-.883.196-.261.392-1.013 1.275-1.242 1.536-.229.261-.457.294-.85.098-.392-.196-1.656-.61-3.155-1.945-1.166-1.04-1.953-2.323-2.183-2.716-.229-.392-.024-.604.173-.8.177-.177.392-.457.588-.687.196-.229.261-.392.392-.654.13-.261.065-.49-.033-.687-.098-.196-.883-2.127-1.21-2.913-.319-.763-.644-.659-.883-.671l-.752-.013c-.261 0-.686.098-.955.49C10.5 11.45 9.75 12.397 9.75 14.31c0 1.91 1.39 3.758 1.583 4.019.196.261 2.73 4.167 6.614 5.843.924.398 1.645.637 2.207.816.927.295 1.77.254 2.437.154.743-.11 2.32-.948 2.647-1.864.327-.916.327-1.701.229-1.864-.097-.163-.36-.261-.751-.457z" />
                        </svg>
                        {/* Checkmark badge */}
                        <div
                            ref={waCheckRef}
                            className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg"
                            style={{ opacity: 0 }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                    </div>
                    {/* Motivational text */}
                    <div ref={waTextRef} className="text-center" style={{ opacity: 0 }}>
                        <p className="text-white text-xl font-display font-light tracking-widest">Pedido Pronto! 🎉</p>
                        <p className="text-slate-400 text-sm mt-2 tracking-wide">Redirecionando para o WhatsApp...</p>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-6 md:px-12 xl:px-32 max-w-7xl">

                {/* Header */}
                <div className="mb-10 text-center md:text-left flex items-center justify-between">
                    <div>
                        <h1 className="hero-serif text-3xl md:text-4xl text-slate-900 dark:text-white">Finalizar Pedido</h1>
                        <p className="text-xs uppercase tracking-widest text-slate-500 mt-2">Pagamento 100% Seguro</p>
                    </div>
                    <button
                        onClick={() => navigate('/catalogo')}
                        className="hidden md:flex flex-col items-end text-xs text-slate-500 hover:text-primary transition-colors tracking-widest uppercase"
                    >
                        <span>Continuar</span>
                        <span>Comprando</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

                    {/* Left Column: Form */}
                    <div className="lg:col-span-7 space-y-10">
                        <form id="checkout-form" onSubmit={handleSubmit}>
                            {/* Identificação */}
                            <section>
                                <h2 className="text-sm uppercase tracking-widest font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 text-xs">1</span>
                                    Identificação
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Nome</label>
                                        <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Sobrenome</label>
                                        <input required name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-slate-900 dark:text-white" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">WhatsApp</label>
                                        <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-slate-900 dark:text-white" />
                                    </div>
                                </div>
                            </section>

                            <hr className="border-slate-200 dark:border-white/5 my-10" />

                            {/* Entrega */}
                            <section>
                                <h2 className="text-sm uppercase tracking-widest font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 text-xs">2</span>
                                    Entrega
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="md:col-span-1">
                                        <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">CEP</label>
                                        <div className="relative">
                                            <input required name="cep" value={formData.cep} onChange={handleChange} maxLength="9" placeholder="00000-000" className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-slate-900 dark:text-white" />
                                            {loadingCep && <span className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Rua / Avenida</label>
                                        <input required name="street" value={formData.street} onChange={handleChange} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-slate-900 dark:text-white" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <div className="col-span-1">
                                        <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Número</label>
                                        <input required name="number" value={formData.number} onChange={handleChange} className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-slate-900 dark:text-white" />
                                    </div>
                                    <div className="col-span-1 md:col-span-3">
                                        <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Complemento</label>
                                        <input name="complement" value={formData.complement} onChange={handleChange} placeholder="Apto, Bloco (Opcional)" className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-slate-900 dark:text-white" />
                                    </div>
                                    <div className="col-span-2 md:col-span-2">
                                        <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Bairro</label>
                                        <input required name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full bg-transparent border-b border-slate-300 dark:border-zinc-700 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-slate-900 dark:text-white" />
                                    </div>
                                    <div className="col-span-1 md:col-span-1">
                                        <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Cidade</label>
                                        <input required name="city" value={formData.city} onChange={handleChange} className="w-full bg-transparent border-b border-slate-300 dark:border-zinc-700 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-slate-900 dark:text-white" />
                                    </div>
                                    <div className="col-span-1 md:col-span-1">
                                        <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">UF</label>
                                        <input required name="state" value={formData.state} onChange={handleChange} maxLength="2" className="w-full bg-transparent border-b border-slate-300 dark:border-zinc-700 py-2 text-sm uppercase focus:outline-none focus:border-primary transition-colors text-slate-900 dark:text-white" />
                                    </div>
                                </div>

                                {/* Dynamic Shipping Options */}
                                {shippingOptions.length > 0 && (
                                    <div className="mt-8">
                                        <label className="block text-xs uppercase tracking-wider text-slate-500 mb-4">Método de Envio</label>
                                        <div className="space-y-3">
                                            {shippingOptions.map((opt) => {
                                                const Icon = opt.icon;
                                                const isSelected = selectedShipping === opt.id;
                                                return (
                                                    <div
                                                        key={opt.id}
                                                        onClick={() => handleShippingChange(opt)}
                                                        className={`flex items-center justify-between p-4 rounded-sm border cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-primary/30'}`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-2 rounded-full ${isSelected ? 'bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'}`}>
                                                                <Icon className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-slate-800 dark:text-slate-200'}`}>{opt.name}</p>
                                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{opt.time}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(opt.price)}</span>
                                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-slate-300 dark:border-zinc-600'}`}>
                                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </section>
                        </form>
                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="lg:col-span-5">
                        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-md shadow-sm sticky top-32 overflow-hidden">
                            <div className="p-6 md:p-8">
                                <h3 className="hero-serif text-2xl text-slate-900 dark:text-white mb-6">Resumo da Compra</h3>

                                <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {cart.map((item, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="w-16 h-20 bg-plaster dark:bg-zinc-800 aspect-[3/4] rounded-sm overflow-hidden shrink-0">
                                                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">{item.name}</h4>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Tam: {item.size} | Qtd: {item.quantity}</p>
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{formatPrice(item.price * item.quantity)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 border-t border-slate-100 dark:border-zinc-800 pt-6 mb-6 text-sm">
                                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                        <span>Frete</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{shippingCost === 0 && selectedShipping ? 'Grátis' : formatPrice(shippingCost)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center border-t border-slate-100 dark:border-zinc-800 pt-6 mb-8">
                                    <span className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">Total</span>
                                    <span className="hero-serif text-3xl font-medium text-slate-900 dark:text-white">{formatPrice(total)}</span>
                                </div>

                                <button
                                    ref={btnRef}
                                    type="submit"
                                    onClick={handleActionSubmit}
                                    className={`w-full py-5 text-white text-xs font-bold tracking-[0.2em] uppercase rounded-sm transition-all shadow-md flex items-center justify-center gap-2 ${isCompleting ? 'bg-[#82cf17] shadow-[0_0_20px_rgba(130,207,23,0.4)] pointer-events-none' : 'bg-primary hover:bg-[#62b412] active:scale-95'}`}
                                >
                                    {isCompleting ? (
                                        <> <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Processando... </>
                                    ) : 'Finalizar no WhatsApp'}
                                </button>

                                <p className="text-[10px] text-center text-slate-400 mt-4 px-4 leading-relaxed uppercase tracking-wider">
                                    Ao finalizar, você será redirecionada(o) ao nosso WhatsApp para organizar o pagamento e a entrega com nosso time.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;
