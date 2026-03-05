import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Admin from './pages/Admin';
import About from './pages/About';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import CartDrawer from './components/CartDrawer';
import { ProductProvider, useProducts } from './context/ProductContext';
import Intro from './components/Intro';

const RootRoute = () => {
  const savedLayout = localStorage.getItem('florizza-layout');
  if (savedLayout === '/v2') {
    return <Navigate to="/v2" replace />;
  }
  return <Home variant={1} />;
};

const AppRoutes = ({ toggleDark, isDark }) => {
  const { loading } = useProducts();
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('florizza-intro-seen');
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem('florizza-intro-seen', 'true');
    setShowIntro(false);
  };

  if (showIntro) {
    return <Intro onComplete={handleIntroComplete} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm uppercase tracking-widest text-slate-500 font-medium">Carregando Florizza...</p>
      </div>
    );
  }

  return (
    <>
      <Navigation toggleDark={toggleDark} isDark={isDark} />
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/v2" element={<Home variant={2} />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/produto/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/sobre" element={<About />} />
      </Routes>
      <CartDrawer />
    </>
  );
};

const App = () => {
  const [isDark, setIsDark] = useState(false);

  // Check initial dark mode preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('florizza-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDark = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('florizza-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('florizza-theme', 'light');
    }
  };

  return (
    <ProductProvider>
      <Router>
        <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
          <AppRoutes toggleDark={toggleDark} isDark={isDark} />
        </div>
      </Router>
    </ProductProvider>
  );
};

export default App;
