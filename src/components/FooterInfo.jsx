const FooterInfo = ({ variant = 1 }) => {
    if (variant === 1) {
        return (
            <section className="bg-white dark:bg-[#0D0D0D] py-20 px-6 lg:px-24">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center md:text-left pt-12">
                    <div className="space-y-4">
                        <span className="text-primary text-sm font-light">01</span>
                        <h4 className="hero-serif text-2xl">Natural Light Oasis</h4>
                        <div className="w-12 h-[1px] bg-primary/30 mb-4 mx-auto md:mx-0"></div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                            Inspirada pela leveza e pela arquitetura mediterrânea, nossa nova coleção abraça os tons naturais e a luz suave.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <span className="text-primary text-sm font-light">02</span>
                        <h4 className="hero-serif text-2xl">Sustentabilidade</h4>
                        <div className="w-12 h-[1px] bg-primary/30 mb-4 mx-auto md:mx-0"></div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                            Tecidos nobres e processos éticos. A elegância da Florizza nasce do respeito profundo ao meio ambiente.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <span className="text-primary text-sm font-light">03</span>
                        <h4 className="hero-serif text-2xl">Atendimento VIP</h4>
                        <div className="w-12 h-[1px] bg-primary/30 mb-4 mx-auto md:mx-0"></div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                            Consultoria de estilo personalizada em nossas flagships e curadoria exclusiva para cada cliente.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-slate-50 dark:bg-[#0D0D0D] py-12 px-6 lg:px-24">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left border-t border-slate-200 dark:border-slate-800 pt-12">
                <div>
                    <h4 className="hero-serif text-xl mb-4 italic">Natural Light Oasis</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                        Inspirada pela leveza e pela arquitetura mediterrânea, nossa nova coleção abraça os tons naturais.
                    </p>
                </div>
                <div>
                    <h4 className="hero-serif text-xl mb-4 italic">Sustentabilidade</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                        Tecidos nobres e processos éticos. A elegância da Florizza nasce do respeito ao meio ambiente.
                    </p>
                </div>
                <div>
                    <h4 className="hero-serif text-xl mb-4 italic">Atendimento VIP</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                        Consultoria de estilo personalizada online e em nossas flagships em todo o Brasil.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default FooterInfo;
