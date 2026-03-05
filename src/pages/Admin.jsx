import { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { Plus, Edit2, Trash2, Star, LogOut, Image as ImageIcon, Video, Box, Layers, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const {
        products, addProduct, updateProduct, deleteProduct,
        categories, addCategory, deleteCategory,
        settings, updateSettings
    } = useProducts();
    const navigate = useNavigate();

    // Authentication State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [loginError, setLoginError] = useState(false);
    const maxPinLength = 4;

    // Theme State
    const [theme, setTheme] = useState(
        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );

    useEffect(() => {
        document.documentElement.classList.add('dark');
        setTheme('dark');

        const handleKeyDown = (e) => {
            if (!isAuthenticated) {
                if (e.key >= '0' && e.key <= '9') {
                    handlePinPress(e.key);
                } else if (e.key === 'Backspace') {
                    handleBackspace();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAuthenticated, pin]);

    const handlePinPress = (num) => {
        if (pin.length < maxPinLength) {
            const newPin = pin + num;
            setPin(newPin);
            setLoginError(false);
            if (newPin.length === maxPinLength) {
                setTimeout(() => verifyPin(newPin), 300);
            }
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
        setLoginError(false);
    };

    const verifyPin = (currentPin) => {
        if (currentPin === '6831') {
            setIsAuthenticated(true);
        } else {
            setLoginError(true);
            setPin('');
        }
    };

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
        setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };

    // Dashboard State
    const [activeTab, setActiveTab] = useState('produtos');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', category: categories[0] || 'Conjunto', price: '', description: '',
        images: [], video: '', coverIndex: 0, stock: 1, orderIndex: 0,
        active: true, featured: false
    });

    // Configurações e Categorias State
    const [newCategory, setNewCategory] = useState('');
    const [localSettings, setLocalSettings] = useState(settings);
    const [settingsSaved, setSettingsSaved] = useState(false);

    // Media Input States
    const [newMediaUrl, setNewMediaUrl] = useState('');
    const [mediaType, setMediaType] = useState('image'); // 'image' or 'video'

    // Form Handlers
    const handleOpenForm = (product = null) => {
        if (product) {
            setEditingId(product.id);
            setFormData({
                ...product,
                images: product.images || [],
                coverIndex: product.coverIndex || 0,
                video: product.video || '',
                stock: product.stock ?? 1,
                orderIndex: product.orderIndex || 0,
                description: product.description || ''
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '', category: categories[0] || 'Conjunto', price: '', description: '',
                images: [], video: '', coverIndex: 0, stock: 1, orderIndex: 0,
                active: true, featured: false
            });
        }
        setNewMediaUrl('');
        setIsFormOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const payload = {
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
            orderIndex: Number(formData.orderIndex)
        };

        if (payload.images.length > 0 && payload.coverIndex >= payload.images.length) {
            payload.coverIndex = 0;
        }

        try {
            if (editingId) await updateProduct(editingId, payload);
            else await addProduct(payload);
        } catch (error) {
            console.error("Erro ao salvar produto no Supabase:", error);
        } finally {
            setIsSaving(false);
            setIsFormOpen(false);
        }
    };

    // Convert file to Base64 (to mock an actual upload)
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            if (mediaType === 'image') {
                setFormData(prev => ({ ...prev, images: [...prev.images, base64String] }));
            } else {
                setFormData(prev => ({ ...prev, video: base64String }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (e, index) => {
        e.stopPropagation();
        setFormData(prev => {
            const newImages = prev.images.filter((_, i) => i !== index);
            let newCover = prev.coverIndex;
            if (index === prev.coverIndex) newCover = 0;
            else if (index < prev.coverIndex) newCover -= 1;
            return { ...prev, images: newImages, coverIndex: newCover };
        });
    };

    const handleSaveSettings = () => {
        updateSettings(localSettings);
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
    };

    const sortedProducts = [...products].sort((a, b) => {
        if (a.orderIndex !== b.orderIndex) return b.orderIndex - a.orderIndex;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // ----------------------------------------------------
    // RENDER LOGIN SCREEN
    // ----------------------------------------------------
    if (!isAuthenticated) {
        return (
            <div className="bg-[#f8f9fa] dark:bg-[#070809] font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500 min-h-screen flex selection:bg-primary selection:text-white relative">
                <div className="noise-overlay"></div>

                <div className="hidden lg:block w-1/2 relative overflow-hidden z-10">
                    <img alt="Florizza Premium" className="absolute inset-0 w-full h-full object-cover grayscale-[10%] brightness-[0.9] dark:brightness-[0.7] transition-all duration-700 hover:scale-105" src="/admin_login.jpg" />
                    <div className="absolute inset-0 bg-black/5"></div>
                    <div className="absolute bottom-12 left-12">
                        <p className="text-white font-display italic text-2xl tracking-widest opacity-90 drop-shadow-md">Florizza</p>
                        <div className="h-px w-24 bg-white/40 mt-2"></div>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#f8f9fa] dark:bg-[#070809] z-10 transition-colors duration-500">
                    <div className="max-w-md w-full space-y-12 animate-fade-in">
                        <div className="text-center space-y-4">
                            <span className="text-xs uppercase tracking-[0.3em] font-medium text-slate-500 dark:text-slate-400">Painel Administrativo</span>
                            <h1 className="text-4xl md:text-5xl font-display text-slate-900 dark:text-slate-50">Acesso Restrito</h1>
                            <p className="text-sm text-slate-400 dark:text-slate-500 font-light italic">Insira seu código de acesso pessoal</p>
                            {loginError && <p className="text-xs font-bold text-red-500 animate-pulse tracking-widest mt-2">CÓDIGO INCORRETO</p>}
                        </div>

                        <div className="flex justify-center gap-6 py-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={`pin-dot border ${i <= pin.length ? 'bg-primary border-primary scale-110 shadow-lg shadow-primary/30' : 'border-slate-300 dark:border-slate-700'}`}></div>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-y-6 gap-x-12 px-4 select-none">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button key={num} onClick={() => handlePinPress(num.toString())} className="keypad-btn py-4 text-3xl font-light text-slate-800 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-all rounded-full hover:bg-slate-100 dark:hover:bg-white/5">{num}</button>
                            ))}
                            <div className="py-4"></div>
                            <button onClick={() => handlePinPress('0')} className="keypad-btn py-4 text-3xl font-light text-slate-800 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-all rounded-full hover:bg-slate-100 dark:hover:bg-white/5">0</button>
                            <button onClick={handleBackspace} className="keypad-btn py-4 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all rounded-full hover:bg-red-50 dark:hover:bg-red-900/10">
                                <span className="material-symbols-outlined text-[28px]">backspace</span>
                            </button>
                        </div>

                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-600 font-medium pt-8">
                            <button className="hover:text-primary transition-colors">Suporte</button>
                            <button onClick={toggleTheme} className="flex items-center gap-2 hover:text-primary transition-colors hover:scale-105 transform">
                                <span className="material-symbols-outlined text-sm">contrast</span> Alterar Tema
                            </button>
                            <button className="hover:text-primary transition-colors">Privacidade</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ----------------------------------------------------
    // RENDER DASHBOARD
    // ----------------------------------------------------
    return (
        <div className="min-h-screen bg-[#f8f9fa] dark:bg-background-dark font-sans text-slate-800 dark:text-slate-100 flex selection:bg-primary selection:text-white overflow-hidden transition-colors duration-500 relative">
            <div className="noise-overlay"></div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-background-dark/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 z-40 flex justify-around p-3 pb-safe">
                <button onClick={() => setActiveTab('produtos')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'produtos' ? 'text-primary font-semibold' : 'text-slate-500'}`}>
                    <Box size={20} /> <span className="text-[10px] uppercase tracking-wider">Produtos</span>
                </button>
                <button onClick={() => setActiveTab('categorias')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'categorias' ? 'text-primary font-semibold' : 'text-slate-500'}`}>
                    <Layers size={20} /> <span className="text-[10px] uppercase tracking-wider">Categorias</span>
                </button>
                <button onClick={() => setActiveTab('configuracoes')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'configuracoes' ? 'text-primary font-semibold' : 'text-slate-500'}`}>
                    <Settings2 size={20} /> <span className="text-[10px] uppercase tracking-wider">Ajustes</span>
                </button>
            </div>

            {/* Sidebar (Desktop only) */}
            <aside className="hidden md:flex w-64 border-r border-slate-200 dark:border-white/5 flex-col fixed h-full bg-white dark:bg-background-dark/80 backdrop-blur-xl z-30 transition-colors duration-500 shadow-xl dark:shadow-none">
                <div className="p-8">
                    <h1 className="font-display text-2xl tracking-tight text-slate-900 dark:text-white">
                        <span className="font-bold italic">Florizza</span> <span className="text-primary font-normal">Admin</span>
                    </h1>
                </div>

                <nav className="flex-1 pl-4 space-y-2 mt-4">
                    <button onClick={() => setActiveTab('produtos')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-l-xl transition-all ${activeTab === 'produtos' ? 'bg-primary/10 text-primary border-r-2 border-primary font-semibold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary'}`}>
                        <Box size={18} /> <span className="text-sm">Produtos</span>
                    </button>
                    <button onClick={() => setActiveTab('categorias')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-l-xl transition-all ${activeTab === 'categorias' ? 'bg-primary/10 text-primary border-r-2 border-primary font-semibold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary'}`}>
                        <Layers size={18} /> <span className="text-sm">Categorias</span>
                    </button>
                    <button onClick={() => setActiveTab('configuracoes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-l-xl transition-all ${activeTab === 'configuracoes' ? 'bg-primary/10 text-primary border-r-2 border-primary font-semibold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary'}`}>
                        <Settings2 size={18} /> <span className="text-sm">Configurações</span>
                    </button>
                </nav>

                <div className="p-6 mt-auto space-y-4">
                    <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                        <span className="material-symbols-outlined text-[18px]">contrast</span> <span className="text-sm font-medium">Alternar Tema</span>
                    </button>
                    <button onClick={() => navigate('/catalogo')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                        <LogOut size={18} /> <span className="text-sm font-medium">Sair para Catálogo</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`flex-1 md:ml-64 p-6 pt-12 md:p-12 min-h-screen relative overflow-y-auto w-full transition-colors duration-500 shadow-inner pb-24 md:pb-12 ${theme === 'dark' ? 'bg-luxury-pattern' : 'bg-[#f8f9fa]'}`}>
                <div className="relative z-10 max-w-6xl mx-auto h-full flex flex-col">
                    {/* Mobile Only Header with Logout & Theme toggle */}
                    <div className="md:hidden flex justify-between items-center mb-8">
                        <h1 className="font-display text-xl tracking-tight text-slate-900 dark:text-white">
                            <span className="font-bold italic">Florizza</span> <span className="text-primary font-normal">Admin</span>
                        </h1>
                        <div className="flex gap-4">
                            <button onClick={toggleTheme} className="text-slate-500 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-xl">contrast</span>
                            </button>
                            <button onClick={() => navigate('/catalogo')} className="text-slate-500 hover:text-red-500 transition-colors">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                    <header className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="font-display text-4xl md:text-5xl mb-2 text-slate-900 dark:text-white capitalize">{activeTab}</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium tracking-widest uppercase text-[10px]">
                                {activeTab === 'produtos' ? `${products.length} itens cadastrados na sua boutique` : `Gerenciamento de ${activeTab}`}
                            </p>
                        </div>
                        {activeTab === 'produtos' && (
                            <button onClick={() => handleOpenForm()} className="bg-[#73cf17] hover:bg-[#62b412] text-white px-6 md:px-8 py-3 rounded-full flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20 transform hover:-translate-y-1">
                                <Plus size={20} /> <span className="text-sm font-bold tracking-wide">Novo Produto</span>
                            </button>
                        )}
                    </header>

                    {/* Produtos Tab Layout */}
                    {activeTab === 'produtos' && (
                        <div className="flex flex-col gap-6 w-full animate-fade-in pb-20">
                            {sortedProducts.map(product => {
                                const coverImage = product.images?.[product.coverIndex || 0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80';
                                return (
                                    <div key={product.id} className="bg-white/80 backdrop-blur-xl dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-8 group hover:border-primary/40 dark:hover:border-primary/30 transition-all duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl">
                                        <div className="relative overflow-hidden rounded-2xl w-full sm:w-32 h-40 shrink-0 shadow-lg group-hover:shadow-primary/20 transition-all">
                                            <img alt={product.name} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" src={coverImage} />
                                            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/10 rounded-2xl"></div>
                                        </div>

                                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 w-full items-center">
                                            <div className="col-span-2 md:col-span-1">
                                                <span className="text-[9px] uppercase tracking-[0.3em] text-primary font-bold mb-2 block">{product.category}</span>
                                                <h3 className="font-display text-xl text-slate-800 dark:text-white leading-tight">{product.name}</h3>
                                            </div>
                                            <div className="text-left md:text-center">
                                                <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2 block">Preço</span>
                                                <p className="font-semibold text-lg text-slate-700 dark:text-slate-200">
                                                    {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </p>
                                            </div>
                                            <div className="text-left md:text-center">
                                                <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2 block">Estoque</span>
                                                <div className="flex md:justify-center items-center">
                                                    <span className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold ${product.stock > 0 ? 'border-primary/20 bg-primary/10 text-primary' : 'border-red-500/20 bg-red-500/10 text-red-500'}`}>
                                                        {product.stock}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-left md:text-center">
                                                <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2 block">Status</span>
                                                <span className={`inline-block px-4 py-1.5 rounded-full border text-[9px] font-bold tracking-[0.2em] uppercase shadow-sm ${product.active ? 'border-primary/30 bg-primary/10 text-primary' : 'border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                                                    {product.active ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex sm:flex-col gap-3 sm:ml-4 w-full sm:w-auto justify-end border-t border-slate-100 dark:border-transparent pt-4 sm:pt-0">
                                            <button onClick={() => updateProduct(product.id, { featured: !product.featured })} className={`p-2.5 rounded-full transition-all focus:outline-none ${product.featured ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 shadow-sm' : 'text-slate-400 hover:text-primary hover:bg-primary/10'}`} title="Destacar Produto">
                                                <Star size={18} fill={product.featured ? 'currentColor' : 'none'} className={product.featured ? "drop-shadow-md" : ""} />
                                            </button>
                                            <button onClick={() => handleOpenForm(product)} className="p-2.5 rounded-full text-slate-400 hover:text-primary hover:bg-primary/10 transition-all focus:outline-none" title="Editar Produto">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => deleteProduct(product.id)} className="p-2.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all focus:outline-none" title="Excluir">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Categorias Tab Layout */}
                    {activeTab === 'categorias' && (
                        <div className="flex flex-col gap-6 w-full animate-fade-in pb-20 max-w-2xl">
                            <div className="p-8 bg-white/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl shadow-xl">
                                <h3 className="text-2xl font-display text-slate-800 dark:text-white mb-6">Nova Categoria</h3>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        placeholder="Ex: Calçados"
                                        className="flex-1 p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                        onKeyDown={(e) => { if (e.key === 'Enter' && newCategory.trim()) { addCategory(newCategory.trim()); setNewCategory(''); } }}
                                    />
                                    <button
                                        onClick={() => { if (newCategory.trim()) { addCategory(newCategory.trim()); setNewCategory(''); } }}
                                        className="bg-primary hover:bg-[#62b412] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-transform active:scale-95 shadow-lg w-full sm:w-auto"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {categories.map(cat => (
                                    <div key={cat} className="p-6 bg-white/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                <Layers size={22} />
                                            </div>
                                            <span className="font-medium text-lg text-slate-700 dark:text-slate-200">{cat}</span>
                                        </div>
                                        <button
                                            onClick={() => deleteCategory(cat)}
                                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Configurações Tab Layout */}
                    {activeTab === 'configuracoes' && (
                        <div className="flex flex-col gap-8 w-full animate-fade-in pb-20 max-w-3xl">
                            <div className="p-8 bg-white/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl shadow-xl flex flex-col gap-6">
                                <h3 className="text-3xl font-display text-slate-800 dark:text-white mb-2">Informações da Loja</h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2">Nome da Loja</label>
                                        <input type="text" value={localSettings.storeName || ''} onChange={(e) => setLocalSettings({ ...localSettings, storeName: e.target.value })} className="w-full p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2">WhatsApp (com DDD)</label>
                                        <input type="text" value={localSettings.whatsapp || ''} onChange={(e) => setLocalSettings({ ...localSettings, whatsapp: e.target.value })} className="w-full p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2">Instagram URL ou @</label>
                                        <input type="text" value={localSettings.instagram || ''} onChange={(e) => setLocalSettings({ ...localSettings, instagram: e.target.value })} className="w-full p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2">Email de Contato</label>
                                        <input type="email" value={localSettings.email || ''} onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })} className="w-full p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-primary font-medium text-sm h-6 flex items-center">
                                        {settingsSaved ? '✓ Configurações salvas com sucesso!' : ''}
                                    </div>
                                    <button
                                        onClick={handleSaveSettings}
                                        className="bg-primary hover:bg-[#62b412] text-white w-full sm:w-auto px-10 py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-transform active:scale-95 shadow-lg"
                                    >
                                        Salvar Configurações
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="fixed bottom-0 right-0 p-12 opacity-[0.02] dark:opacity-[0.03] pointer-events-none select-none z-0">
                        <h1 className="font-display text-[15vw] leading-none text-slate-900 dark:text-white font-black blur-[2px]">FLORIZZA</h1>
                    </div>
                </div>
            </main>

            {/* Modal de Adição/Edição */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in">
                    <div className="bg-white dark:bg-[#121412] border border-slate-200/50 dark:border-white/[0.05] rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.3)] w-full max-w-3xl my-auto flex flex-col max-h-[90vh] relative overflow-hidden">

                        <div className="p-8 border-b border-slate-100 dark:border-white/5 shrink-0 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
                            <h2 className="font-display text-3xl text-slate-900 dark:text-white font-bold">{editingId ? 'Editar Produto' : 'Novo Produto Boutique'}</h2>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-primary transition-colors bg-white dark:bg-white/5 p-2 rounded-full shadow-sm">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto flex-1 no-scrollbar space-y-8">
                            <form id="productForm" onSubmit={handleSave} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2">Nome do Produto</label>
                                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all shadow-inner" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2">Preço (R$)</label>
                                        <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all shadow-inner" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2">Estoque (Qtd)</label>
                                        <input type="number" min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="w-full p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all shadow-inner" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2">Categoria Mestre</label>
                                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all appearance-none shadow-inner">
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2">Ordem Listagem</label>
                                        <input type="number" value={formData.orderIndex} onChange={e => setFormData({ ...formData, orderIndex: e.target.value })} placeholder="Ex: 5" className="w-full p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all shadow-inner" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2">Descrição SEO / Detalhes</label>
                                        <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none shadow-inner"></textarea>
                                    </div>
                                </div>

                                {/* Media Management */}
                                <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] p-6 rounded-2xl">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-display text-2xl text-slate-800 dark:text-white">Gerenciador de Mídias</h3>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setMediaType('image')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${mediaType === 'image' ? 'bg-primary text-white shadow-md' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'}`}>
                                                <ImageIcon size={14} /> Imagens
                                            </button>
                                            <button type="button" onClick={() => setMediaType('video')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${mediaType === 'video' ? 'bg-primary text-white shadow-md' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'}`}>
                                                <Video size={14} /> Vídeo
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 w-full mb-8">
                                        <div className="flex-1 p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-black/40 dark:text-white text-sm outline-none transition-colors shadow-inner flex items-center justify-between pointer-events-none">
                                            <span className="text-slate-400">Clique em Importar para abrir a galeria...</span>
                                        </div>

                                        <input
                                            type="file"
                                            id="mediaUpload"
                                            className="hidden"
                                            accept={mediaType === 'image' ? "image/*" : "video/*"}
                                            onChange={handleFileUpload}
                                        />

                                        <label htmlFor="mediaUpload" className="bg-slate-900 cursor-pointer dark:bg-white/10 text-white dark:text-slate-200 px-6 py-4 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-lg">
                                            <span className="material-symbols-outlined text-[18px]">add_circle</span> Importar {mediaType === 'image' ? 'Imagem' : 'Vídeo'}
                                        </label>
                                    </div>

                                    {formData.video && (
                                        <div className="mb-8">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-3">Vídeo Vinculado</p>
                                            <div className="flex items-center justify-between bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                                                <div className="flex items-center gap-3 overflow-hidden text-sm text-slate-600 dark:text-slate-400">
                                                    <Video size={18} className="text-primary" />
                                                    <span className="truncate">{formData.video}</span>
                                                </div>
                                                <button type="button" onClick={() => setFormData({ ...formData, video: '' })} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                                                    Remover
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {formData.images.length > 0 ? (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-4 flex items-center justify-between">
                                                Galeria de Imagens
                                                <span className="text-primary font-medium tracking-normal normal-case">Clique na imagem para definir a capa oficial.</span>
                                            </p>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                {formData.images.map((img, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => setFormData(prev => ({ ...prev, coverIndex: idx }))}
                                                        className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group border-2 transition-all p-1 ${idx === formData.coverIndex ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-105 z-10' : 'border-transparent bg-slate-100 dark:bg-zinc-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                                    >
                                                        <img src={img} className="w-full h-full object-cover rounded-lg shadow-inner" alt={`Midia ${idx}`} />

                                                        {idx === formData.coverIndex && (
                                                            <div className="absolute top-3 left-3 bg-primary text-white text-[9px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-md">
                                                                <Star size={10} fill="currentColor" /> Capa
                                                            </div>
                                                        )}

                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all flex items-center justify-center rounded-xl p-1">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleRemoveImage(e, idx)}
                                                                className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-transform transform scale-75 group-hover:scale-100 shadow-xl"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                                            <p className="text-slate-400 text-sm">Nenhuma imagem importada para este produto ainda.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 flex flex-col sm:flex-row items-center gap-6 pb-2">
                                    <label className="flex items-center gap-3 text-sm font-bold tracking-widest uppercase text-slate-700 dark:text-slate-300 cursor-pointer w-full sm:w-auto p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-white/5 hover:border-primary transition-colors">
                                        <input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} className="rounded bg-slate-100 dark:bg-black text-primary focus:ring-primary size-5 border-slate-300 dark:border-zinc-700" />
                                        Ativo no App
                                    </label>
                                    <label className="flex items-center gap-3 text-sm font-bold tracking-widest uppercase text-slate-700 dark:text-slate-300 cursor-pointer w-full sm:w-auto p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-white/5 hover:border-amber-500 transition-colors">
                                        <input type="checkbox" checked={formData.featured} onChange={e => setFormData({ ...formData, featured: e.target.checked })} className="rounded bg-slate-100 dark:bg-black text-amber-500 focus:ring-amber-500 size-5 border-slate-300 dark:border-zinc-700" />
                                        Em Destaque
                                    </label>
                                </div>
                            </form>
                        </div>

                        <div className="p-8 bg-slate-100 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/5 shrink-0 flex justify-end gap-x-4">
                            <button type="button" onClick={() => setIsFormOpen(false)} disabled={isSaving} className="px-8 py-3.5 text-xs tracking-widest uppercase font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50">Voltar</button>
                            <button type="submit" form="productForm" disabled={isSaving} className="px-10 py-3.5 bg-primary hover:bg-[#62b412] text-white rounded-full text-xs tracking-widest uppercase font-bold shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed">
                                {isSaving ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Salvando...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-[18px]">save</span> Salvar Edições</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
