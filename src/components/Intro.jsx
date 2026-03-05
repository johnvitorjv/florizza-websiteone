import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const Intro = ({ onComplete }) => {
    const containerRef = useRef(null);
    const glowRef = useRef(null);
    const titleWrapperRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const phraseRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                // Smoothly fade out the entire intro screen
                gsap.to(containerRef.current, {
                    opacity: 0,
                    duration: 1.2,
                    ease: "power2.inOut",
                    onComplete: () => {
                        setIsVisible(false);
                        if (onComplete) onComplete();
                    }
                });
            }
        });

        // 1. Setup initial states
        // Hide elements initially
        gsap.set(titleWrapperRef.current, { autoAlpha: 1 });
        // The text will be revealed from bottom to top using clipPath
        gsap.set(titleRef.current, { y: 100, opacity: 0, scale: 0.95, filter: "blur(10px)" });
        gsap.set([subtitleRef.current, phraseRef.current], { opacity: 0, y: 20 });
        gsap.set(glowRef.current, { scale: 0.8, opacity: 0 });

        // 2. Ambient Glow Animation
        // A breathtaking glowing orb that moves and breathes slowly
        tl.to(glowRef.current, {
            scale: 1.5,
            opacity: 0.4, // subtle glow
            duration: 3,
            ease: "power2.out"
        }, 0);

        // Continuous floating animation for the glow (not blocking the timeline)
        gsap.to(glowRef.current, {
            y: -50,
            x: 30,
            rotation: 10,
            duration: 4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        // 3. Cinematic Title Reveal
        // Title rises up, scales slightly, and unblurs
        tl.to(titleRef.current, {
            y: 0,
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.8,
            ease: "power3.out"
        }, 0.5); // Starts a bit after the glow

        // Light sweep across the text using background-position
        tl.fromTo(titleRef.current,
            { backgroundPosition: "200% center" },
            { backgroundPosition: "-200% center", duration: 2.5, ease: "power1.inOut" },
            1.0 // Starts during the title reveal
        );

        // 4. Subtitle and Phrase elegant fade in
        tl.to([subtitleRef.current, phraseRef.current], {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.3,
            ease: "power2.out"
        }, 1.5);

        // 5. Hold period to admire the beauty
        tl.to({}, { duration: 2.0 });

        return () => {
            tl.kill();
            gsap.killTweensOf(glowRef.current);
        };
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[100] bg-[#F9F8F6] dark:bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Ambient Background Glow Effect */}
            <div
                ref={glowRef}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full blur-[100px] pointer-events-none mix-blend-normal dark:mix-blend-screen"
                style={{
                    background: 'radial-gradient(circle, rgba(115,207,23,0.3) 0%, rgba(115,207,23,0) 70%)'
                }}
            ></div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">

                {/* Title */}
                <div ref={titleWrapperRef} className="overflow-hidden pb-4">
                    <h1
                        ref={titleRef}
                        className="font-display text-5xl md:text-7xl lg:text-8xl tracking-[0.2em] font-bold mb-2 text-transparent bg-clip-text"
                        style={{
                            backgroundImage: 'linear-gradient(to right, rgba(115,207,23,1) 0%, rgba(115,207,23,0.4) 45%, rgba(255,255,255,1) 50%, rgba(115,207,23,0.4) 55%, rgba(115,207,23,1) 100%)',
                            backgroundSize: '200% auto',
                            color: 'transparent' // Fallback handled by tailwind classes usually, but explicit here
                        }}
                    >
                        FLORIZZA
                    </h1>
                </div>

                {/* Subtitle */}
                <h2
                    ref={subtitleRef}
                    className="text-[10px] md:text-xs uppercase tracking-[0.6em] font-bold text-slate-800 dark:text-slate-300 mt-6 mb-8"
                >
                    @souflorizza
                </h2>

                {/* Phrase */}
                <div className="overflow-hidden">
                    <p
                        ref={phraseRef}
                        className="font-display italic text-lg md:text-2xl text-slate-600 dark:text-slate-400 font-light"
                    >
                        Elegância que traduz quem você é.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Intro;
