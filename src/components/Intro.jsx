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
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => {
                    gsap.to(containerRef.current, {
                        opacity: 0,
                        duration: 0.5,
                        ease: "power2.inOut",
                        onComplete: () => {
                            setIsVisible(false);
                            if (onComplete) onComplete();
                        }
                    });
                }
            });

            gsap.set(titleWrapperRef.current, { autoAlpha: 1 });
            gsap.set(titleRef.current, { y: 40, opacity: 0, scale: 0.97, filter: "blur(6px)", backgroundPosition: "200% center" });
            gsap.set([subtitleRef.current, phraseRef.current], { opacity: 0, y: 10 });
            gsap.set(glowRef.current, { scale: 0.8, opacity: 0 });

            // Glow background
            tl.to(glowRef.current, { scale: 1.3, opacity: 0.4, duration: 0.6, ease: "power2.out" }, 0);

            // Title entrance — fast
            tl.to(titleRef.current, {
                y: 0, opacity: 1, scale: 1, filter: "blur(0px)",
                duration: 0.5, ease: "power3.out"
            }, 0.1);

            // Shimmer pass — 2 passes, each ~0.8s = 1.6s total, starts at 0.4s
            tl.to(titleRef.current, {
                backgroundPosition: "-200% center",
                duration: 0.8,
                ease: "power1.inOut",
                repeat: 1
            }, 0.4);

            // Subtitle + phrase
            tl.to([subtitleRef.current, phraseRef.current], {
                opacity: 1, y: 0, duration: 0.4, stagger: 0.15, ease: "power2.out"
            }, 0.6);

            // Brief hold so user sees it
            tl.to({}, { duration: 0.5 });
        }, containerRef);

        return () => ctx.revert();
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[100] bg-[#F9F8F6] dark:bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden"
        >
            <div
                ref={glowRef}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full blur-[100px] pointer-events-none mix-blend-normal dark:mix-blend-screen"
                style={{ background: 'radial-gradient(circle, rgba(115,207,23,0.3) 0%, rgba(115,207,23,0) 70%)' }}
            />
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
                <div ref={titleWrapperRef} className="overflow-hidden pb-4">
                    <h1
                        ref={titleRef}
                        className="font-display text-5xl md:text-7xl lg:text-8xl tracking-[0.2em] font-bold mb-2 text-transparent bg-clip-text"
                        style={{
                            backgroundImage: 'linear-gradient(to right, rgba(115,207,23,1) 0%, rgba(115,207,23,0.4) 45%, rgba(255,255,255,1) 50%, rgba(115,207,23,0.4) 55%, rgba(115,207,23,1) 100%)',
                            backgroundSize: '200% auto',
                            color: 'transparent'
                        }}
                    >
                        FLORIZZA
                    </h1>
                </div>
                <h2 ref={subtitleRef} className="text-[10px] md:text-xs uppercase tracking-[0.6em] font-bold text-slate-800 dark:text-slate-300 mt-4 mb-6">
                    @souflorizza
                </h2>
                <div className="overflow-hidden">
                    <p ref={phraseRef} className="font-display italic text-lg md:text-2xl text-slate-600 dark:text-slate-400 font-light">
                        Elegância que traduz quem você é.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Intro;
