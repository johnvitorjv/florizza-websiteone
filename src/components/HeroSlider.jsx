import { useState, useEffect } from 'react';

// Link 1: The original valid image provided.
// Links 2-5: High quality placeholders. 
// Você deve substituir os caminhos das imagens falsas (da Unsplash) abaixo pelas fotos reais já editadas por você.
// Salve as fotos na pasta: public/images/
// E altere aqui na lista para: '/images/sua-foto-2.jpg', etc.
export const heroImages = [
    '/hero/hero_1.jpg',
    '/hero/hero_2.jpg',
    '/hero/hero_3.png',
    '/hero/hero_4.png',
    '/hero/hero_5.png',
];

const animations = [
    { active: 'opacity-100 scale-100 translate-x-0 translate-y-0', inactive: 'opacity-0 scale-105 translate-x-0 translate-y-0' },      // 1: Subtle zoom out (Hero 1 - standing)
    { active: 'opacity-100 scale-100 translate-x-0 translate-y-0', inactive: 'opacity-0 scale-95 translate-x-0 translate-y-4' },       // 2: Float up (Hero 2 - white)
    { active: 'opacity-100 scale-100 translate-x-0 translate-y-0', inactive: 'opacity-0 scale-105 -translate-x-4 translate-y-0' },     // 3: Slide from left (Hero 3 - Red)
    { active: 'opacity-100 scale-100 translate-x-0 translate-y-0', inactive: 'opacity-0 scale-100 translate-x-0 translate-y-4' },      // 4: Float up variant (Hero 4 - Mint)
    { active: 'opacity-100 scale-100 translate-x-0 translate-y-0', inactive: 'opacity-0 scale-105 translate-x-4 translate-y-0' },      // 5: Slide from right (Hero 5 - Short White)
];

const HeroSlider = ({ variant = 1 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000); // Exatamente 5 segundos por foto
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full bg-plaster dark:bg-zinc-950 overflow-hidden">
            {heroImages.map((src, index) => {
                const isActive = index === currentIndex;
                const anim = animations[index % animations.length];

                return (
                    <img
                        key={index}
                        src={src}
                        alt={`Coleção Florizza Estilo ${index + 1}`}
                        className={`absolute inset-0 w-full h-full ${variant === 1 ? 'object-cover object-top' : 'object-cover object-center'} transition-all duration-[2000ms] ease-out ${isActive ? anim.active + ' z-10' : anim.inactive + ' z-0'
                            }`}
                        style={{
                            // Continua movendo muito sutilmente mesmo apos entrar
                            transformOrigin: index % 2 === 0 ? 'top center' : 'center center'
                        }}
                    />
                );
            })}
        </div>
    );
};

export default HeroSlider;
