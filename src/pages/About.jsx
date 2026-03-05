import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Instagram, Phone, MapPin } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
    const pageRef = useRef();
    const carouselRef = useRef();
    const mainImgRef = useRef();

    useEffect(() => {
        // Initial load animation for hero section
        gsap.fromTo(pageRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 1, ease: 'power2.out' }
        );

        // Scroll animations for generic elements
        gsap.utils.toArray('.about-anim').forEach((elem) => {
            gsap.fromTo(elem,
                { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0, duration: 1, ease: 'power3.out',
                    scrollTrigger: {
                        trigger: elem,
                        start: "top 85%",
                        toggleActions: 'play none none none'
                    }
                }
            );
        });

        // Entrance animation for carousel images
        gsap.fromTo('.carousel-img',
            { opacity: 0, scale: 0.9, y: 30 },
            {
                opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(1.2)',
                scrollTrigger: {
                    trigger: carouselRef.current,
                    start: "top 85%",
                    toggleActions: 'play none none none'
                }
            }
        );

        // Continuous slow parallax for main image
        gsap.to(mainImgRef.current, {
            yPercent: 10,
            scale: 1.05,
            ease: "none",
            scrollTrigger: {
                trigger: mainImgRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });

        // Infinite auto-scroll for the carousel
        const carousel = carouselRef.current;
        let scrollAnimation;
        if (carousel) {
            // Clone images for infinite illusion
            const items = Array.from(carousel.children);
            items.forEach(item => {
                const clone = item.cloneNode(true);
                carousel.appendChild(clone);
            });

            // Calculate total scroll width
            const totalWidth = carousel.scrollWidth / 2;

            gsap.set(carousel, { x: 0 });
            scrollAnimation = gsap.to(carousel, {
                x: `-=${totalWidth}`,
                duration: 40,
                ease: "none",
                repeat: -1,
                modifiers: {
                    x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
                }
            });

            // Pause on hover
            carousel.addEventListener('mouseenter', () => scrollAnimation.pause());
            carousel.addEventListener('mouseleave', () => scrollAnimation.play());
        }

        return () => {
            if (scrollAnimation) scrollAnimation.kill();
        };
    }, []);

    const images = [
        '/about/taina_image_1_1772643193821.png',
        '/about/taina_image_2_1772643213821.png',
        '/about/taina_image_3_1772643253665.png',
        '/about/taina_image_4_1772643288294.png',
        '/about/taina_image_5_1772643315291.png'
    ];

    return (
        <div ref={pageRef} className="page-wrapper pt-32 px-6 md:px-12 lg:px-24 min-h-screen bg-background-light dark:bg-background-dark pb-24 transition-colors">

            {/* Minimalist Header */}
            <div className="mb-20 text-center md:text-left about-anim">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-4 block">Sobre a Florizza</span>
                <h1 className="hero-serif text-5xl md:text-7xl font-light text-slate-900 dark:text-slate-100 leading-tight">Nossa História</h1>
            </div>

            {/* Narrative & Founder Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-center mb-32">
                <div className="about-anim order-2 md:order-1 space-y-6 text-slate-600 dark:text-slate-300">
                    <p className="text-xl md:text-2xl font-light leading-relaxed hero-serif text-slate-800 dark:text-slate-200">
                        Nascida em Salvador, Bahia, a Florizza Boutique é a materialização de um sonho arquitetado com paixão e elegância.
                    </p>
                    <p className="text-sm md:text-base leading-relaxed font-normal">
                        Fundada no ano passado pela visionária Tainá Andrade, nossa loja virtual foi criada para mulheres contemporâneas que buscam
                        sofisticação sem abrir mão do conforto. Acreditamos no conceito do &quot;Quiet Luxury&quot; – a verdadeira elegância
                        não grita, ela sussurra através de cortes impecáveis, tecidos nobres e uma paleta de cores atemporal.
                    </p>
                    <p className="text-sm md:text-base leading-relaxed font-normal">
                        Cada peça é cuidadosamente curada para transcender as estações, oferecendo brilho autêntico e confiança
                        a quem veste. Nós não vendemos apenas roupas, entregamos uma nova forma de se expressar com sutileza e poder.
                    </p>

                    <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="font-display text-2xl text-slate-900 dark:text-white">Tainá Andrade</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Fundadora e Curadora</span>
                        </div>
                    </div>
                </div>

                <div className="about-anim order-1 md:order-2 relative h-[600px] w-full max-w-md mx-auto rounded-none overflow-hidden group shadow-2xl shadow-slate-200/50 dark:shadow-none">
                    <img
                        ref={mainImgRef}
                        src="/about/taina_image_1_1772643193821.png"
                        alt="Tainá Andrade - Fundadora da Florizza"
                        className="w-full h-[120%] object-cover object-center -mt-[10%] transition-transform duration-[2000ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 border border-black/5 dark:border-white/10 pointer-events-none mix-blend-overlay"></div>
                </div>
            </div>

            {/* Premium Photo Carousel (Masonry/Horizontal Mix) */}
            <div className="about-anim mb-32">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="hero-serif text-3xl text-slate-900 dark:text-white">Coleção &amp; Lifestyle</h2>
                    <div className="h-px bg-slate-200 dark:bg-white/10 flex-1 ml-8"></div>
                </div>

                {/* Scrollable Horizontal Gallery */}
                <div className="relative w-full overflow-hidden no-scrollbar">
                    <div ref={carouselRef} className="flex gap-6 w-max py-8 pl-6">
                        {images.map((img, idx) => (
                            <div key={idx} className="carousel-img relative flex-shrink-0 w-72 sm:w-80 h-[450px] shadow-xl dark:shadow-none rounded-none overflow-hidden group cursor-pointer bg-slate-100 dark:bg-zinc-800 transition-all duration-700 hover:-translate-y-4 hover:shadow-2xl z-10 hover:z-20">
                                <img
                                    src={img}
                                    alt={`Galeria ${idx + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
                            </div>
                        ))}
                    </div>
                    {/* Gradient Fades for Carousel Boundaries */}
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background-light dark:from-background-dark to-transparent z-30 pointer-events-none"></div>
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background-light dark:from-background-dark to-transparent z-30 pointer-events-none"></div>
                </div>
            </div>

            {/* Minimalist Contact Section */}
            <div className="about-anim border-t border-slate-200 dark:border-white/10 pt-16 flex flex-col items-center text-center max-w-2xl mx-auto pb-12">
                <span className="material-symbols-outlined text-4xl text-primary font-light mb-6">spa</span>
                <h3 className="hero-serif text-3xl text-slate-900 dark:text-white mb-8">Entre em Contato</h3>

                <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 w-full justify-center">
                    <a href="https://wa.me/5571982570273" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 p-6 group transition-all hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl">
                        <div className="w-12 h-12 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors text-slate-800 dark:text-slate-200">
                            <Phone size={20} className="font-light" />
                        </div>
                        <div className="text-left">
                            <span className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">WhatsApp</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">+55 71 98257-0273</span>
                        </div>
                    </a>

                    <a href="https://www.instagram.com/souflorizza/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 p-6 group transition-all hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl">
                        <div className="w-12 h-12 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors text-slate-800 dark:text-slate-200">
                            <Instagram size={20} className="font-light" />
                        </div>
                        <div className="text-left">
                            <span className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Instagram</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">@souflorizza</span>
                        </div>
                    </a>
                </div>

                <div className="mt-12 flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs tracking-widest uppercase font-bold">
                    <MapPin size={14} /> Salvador, Bahia
                </div>
            </div>

        </div>
    );
};

export default About;
