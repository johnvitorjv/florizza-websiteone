import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [settings, setSettings] = useState({
        storeName: 'Florizza Boutique',
        whatsapp: '5571982570273',
        instagram: 'souflorizza',
        email: 'contato@florizza.com'
    });

    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch Initial Data
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Products
            const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            if (prods) setProducts(prods);

            // Fetch Categories
            const { data: cats } = await supabase.from('categories').select('*');
            if (cats) setCategories(cats.map(c => c.name));

            // Fetch Settings
            const { data: sets } = await supabase.from('settings').select('*').limit(1).single();
            if (sets) {
                setSettings({
                    storeName: sets.store_name || 'Florizza Boutique',
                    whatsapp: sets.whatsapp || '5571982570273',
                    instagram: sets.instagram || 'souflorizza',
                    email: sets.email || 'contato@florizza.com'
                });
            }
        } catch (error) {
            console.error('Error fetching data from Supabase:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Product Mutations ---
    const addProduct = async (product) => {
        const { data, error } = await supabase.from('products').insert([product]).select();
        if (error) throw error;
        if (data) {
            setProducts(prev => [data[0], ...prev]);
        }
    };

    const updateProduct = async (id, updatedFields) => {
        const { data, error } = await supabase.from('products').update(updatedFields).eq('id', id).select();
        if (error) throw error;
        if (data) {
            setProducts(prev => prev.map(p => p.id === id ? data[0] : p));
        }
    };

    const deleteProduct = async (id) => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
            setProducts(prev => prev.filter(p => p.id !== id));
        }
    };

    // --- Category Mutations ---
    const addCategory = async (cat) => {
        if (!categories.includes(cat)) {
            const { error } = await supabase.from('categories').insert([{ name: cat }]);
            if (!error) setCategories([...categories, cat]);
        }
    };

    const deleteCategory = async (cat) => {
        const { error } = await supabase.from('categories').delete().eq('name', cat);
        if (!error) setCategories(categories.filter(c => c !== cat));
    };

    // --- Settings Mutations ---
    const updateSettings = async (newSettings) => {
        // Optimistic UI update
        const updated = { ...settings, ...newSettings };
        setSettings(updated);

        // Find existing record id to update
        const { data: existingSettings } = await supabase.from('settings').select('id').limit(1).single();

        if (existingSettings) {
            await supabase.from('settings').update({
                store_name: updated.storeName,
                whatsapp: updated.whatsapp,
                instagram: updated.instagram,
                email: updated.email
            }).eq('id', existingSettings.id);
        }
    };

    // --- Cart Actions (Local State Only) ---
    const addToCart = (product, quantity = 1, size = 'Único') => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id && item.size === size);
            if (existing) {
                return prev.map(item =>
                    (item.id === product.id && item.size === size)
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { ...product, quantity, size }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId, size) => {
        setCart(prev => prev.filter(item => !(item.id === productId && item.size === size)));
    };

    const updateCartItemQuantity = (productId, size, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId, size);
            return;
        }
        setCart(prev => prev.map(item =>
            (item.id === productId && item.size === size) ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => setCart([]);

    return (
        <ProductContext.Provider value={{
            products, addProduct, updateProduct, deleteProduct, loading,
            categories, addCategory, deleteCategory,
            settings, updateSettings,
            cart, isCartOpen, setIsCartOpen, addToCart, removeFromCart, updateCartItemQuantity, clearCart
        }}>
            {children}
        </ProductContext.Provider>
    );
};
