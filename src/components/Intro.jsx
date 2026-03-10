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

    const onCompleteRef = useRef(onComplete);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        let hasCompleted = false;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => {
                    if (hasCompleted) return;
                    hasCompleted = true;
                    gsap.to(containerRef.current, {
                        opacity: 0,
                        duration: 0.5,
                        ease: "power3.inOut",
                        onComplete: () => {
                            setIsVisible(false);
                            if (onCompleteRef.current) onCompleteRef.current();
                        }
                    });
                }
            });

            gsap.set(titleWrapperRef.current, { autoAlpha: 1 });
            gsap.set(titleRef.current, { y: 30, opacity: 0, scale: 0.95, filter: "blur(5px)", backgroundPosition: "200% center" });
            gsap.set([subtitleRef.current, phraseRef.current], { opacity: 0, y: 15 });
            gsap.set(glowRef.current, { scale: 0.8, opacity: 0 });

            // Entrance
            tl.to(glowRef.current, { scale: 1.2, opacity: 0.25, duration: 0.8, ease: "power2.out" }, 0);
            tl.to(titleRef.current, {
                y: 0, opacity: 1, scale: 1, filter: "blur(0px)",
                duration: 0.7, ease: "power3.out"
            }, 0.1);

            // Shimmer Pass 1 (Fast & Elegant)
            tl.to(titleRef.current, {
                backgroundPosition: "-200% center",
                duration: 1.2,
                ease: "power1.inOut",
            }, 0.3);

            // Shimmer Pass 2
            tl.set(titleRef.current, { backgroundPosition: "200% center" });
            tl.to(titleRef.current, {
                backgroundPosition: "-200% center",
                duration: 1.2,
                ease: "power1.inOut",
            });

            // Transition to solid text and reveal subtitles instantly after the 2 passes
            tl.to(titleRef.current, {
                backgroundImage: 'linear-gradient(to right, rgba(115,207,23,1) 0%, rgba(115,207,23,1) 100%)',
                duration: 0.4,
                ease: "power2.out",
            });

            tl.to([subtitleRef.current, phraseRef.current], {
                opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out"
            }, "-=0.3");

            // Pause slightly so the user registers the final brand visual before fading out
            tl.to({}, { duration: 0.5 });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    if (!isVisible) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[100] bg-[#F9F8F6] dark:bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden"
        >
            <div
                ref={glowRef}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full blur-[100px] pointer-events-none mix-blend-normal dark:mix-blend-screen"
                style={{ background: 'radial-gradient(circle, rgba(115,207,23,0.25) 0%, rgba(115,207,23,0) 70%)' }}
            />
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
                <div ref={titleWrapperRef} className="overflow-hidden pb-4">
                    <h1
                        ref={titleRef}
                        className="font-display text-5xl md:text-7xl lg:text-8xl tracking-[0.2em] font-bold mb-2 text-transparent bg-clip-text"
                        style={{
                            backgroundImage: 'linear-gradient(to right, rgba(115,207,23,1) 0%, rgba(115,207,23,0.3) 42%, rgba(255,255,255,0.95) 50%, rgba(115,207,23,0.3) 58%, rgba(115,207,23,1) 100%)',
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
