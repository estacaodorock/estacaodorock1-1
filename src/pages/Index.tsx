import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import { GaleriaSection } from '@/components/GaleriaSection';
import HeroScrollAnimation from '@/components/ui/hero-scroll-animation';
import { motion, useReducedMotion } from 'framer-motion';
import { FloatingPanel } from '@/components/ui/FloatingPanel';
import LineupPoster from '@/components/LineupPoster';
import BandBiosSection from '@/components/BandBiosSection';
import AttractionsSection from '@/components/AttractionsSection';
import MapSection from '@/components/MapSection';
import InteractivitySection from '@/components/InteractivitySection';
import { TapeCorner } from '@/components/ui/tape-element';
import { LogoCarousel } from '@/components/LogoCarousel';
import SocialLinksSection from '@/components/SocialLinksSection';
import { SHOW_SUPPORT_SECTION } from '@/config/featureFlags';

const Index = () => {
  const prefersReducedMotion = useReducedMotion();
  const [modal, setModal] = useState<
    | null
    | 'mapa'
    | 'playlist'
    | 'mural'
    | 'quem'
  >(null);

  const closeModal = () => setModal(null);

  const FloatingCard = ({
    children,
    delay = 0,
    className = '',
    as: As = 'button',
    onClick,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    as?: any;
    onClick?: () => void;
    'aria-label'?: string;
  }) => (
    <motion.div
      animate={prefersReducedMotion ? {} : { y: [-10, 10, -10] }}
      transition={prefersReducedMotion ? {} : { duration: 7 + delay, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      className={`backdrop-blur-sm rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.35)] border border-white/10 ${className}`}
    >
      <As
        onClick={onClick}
        className="w-full h-full flex items-center justify-center text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400/60 transition-transform duration-200 hover:scale-105 active:scale-95"
        aria-label={ariaLabel}
      >
        {children}
      </As>
    </motion.div>
  );

  const Modal = ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeModal}
        aria-hidden="true"
      />
      <div className="relative z-10 w-[90vw] max-w-4xl max-h-[85vh] overflow-y-auto bg-black/80 border border-white/10 rounded-2xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 id="modal-title" className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider">
            {title}
          </h2>
          <button
            onClick={closeModal}
            className="px-3 py-1 rounded bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Fechar"
          >
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background Video Galaxy */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        >
          <source src="/video/galaxy-pb.mp4" type="video/mp4" />
          Seu navegador não suporta vídeo HTML5.
        </video>
        {/* Overlay para melhor contraste */}
        <div className="absolute inset-0 bg-black/35"></div>
      </div>

      {/* Content - Floating Sections */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Navigation />
        </motion.div>

        {/* Topo / Hero - fixo/fade-in */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mt-6 md:mt-10"
        >
          <div className="animate-float">
            <HeroSection />
          </div>
        </motion.div>


        {/* Lineup Poster - imediatamente após a HeroSection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 md:mt-10"
        >
          <FloatingPanel>
            <LineupPoster />
          </FloatingPanel>
        </motion.div>


        {/* Band Bios Section - Pilha interativa (Stagger Testimonials) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 md:mt-10"
        >
          <BandBiosSection />
        </motion.div>
        <div className="mt-8" />
        <div className="cv-auto"><AttractionsSection /></div>
        {/* Removido cv-auto para evitar adiamento do iframe (Safari/iOS) */}
        <MapSection />
        {/* Removido cv-auto para evitar adiamento do iframe (Safari/iOS) */}
        <InteractivitySection />
        {/* Mural do Caos - imediatamente abaixo da seção Interativa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 md:mt-10"
        >
          <div className="relative">
            <FloatingPanel>
              <GaleriaSection />
            </FloatingPanel>
            {/* Fitas adesivas para estética de pôster */}
            <TapeCorner corner="top-left" className="z-20 opacity-90" />
            <TapeCorner corner="top-right" className="z-20 opacity-90" />
          </div>
        </motion.div>

        {/* Seção Sobre (logo abaixo do Mural) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="mt-6 md:mt-10"
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Card Esquerda: Sobre */}
              <div className="relative">
                <FloatingPanel>
                  <section id="sobre" aria-labelledby="sobre-title">
                    <h2
                      id="sobre-title"
                      className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-[#ff2a2a] drop-shadow-[4px_4px_0_#000] mb-4"
                    >
                      Sobre
                    </h2>
                    <div className="text-white/80 leading-relaxed space-y-4 text-sm md:text-base">
                      <p>
                        O Estação Rock Festival é mais que um evento, é fruto de uma mobilização comunitária liderada pela comissão Ramal do Rock. 👐🏽
                      </p>
                      <p>
                        Formada por voluntários, agentes culturais, representantes da Secretaria da Cultura, Prefeitura e donos de bares locais com experiência no cenário musical e eventos, essa comissão une esforços para planejar e realizar o festival. 🎸
                      </p>
                      <p>
                        O nome simboliza a conexão entre poder público, iniciativa privada e comunidade. O grupo promove o acesso à cultura, valoriza bandas independentes e ocupa espaços urbanos com arte. 🤘🏽
                      </p>
                    </div>
                  </section>
                </FloatingPanel>
                <TapeCorner corner="top-left" className="z-20 opacity-90" />
                <TapeCorner corner="top-right" className="z-20 opacity-90" />
              </div>

              {/* Card Direita: Uma Co-Realização */}
              <div className="relative">
                <FloatingPanel>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-white drop-shadow-[4px_4px_0_#000]">
                      Uma Co-Realização:
                    </h2>
                    <div className="mt-3 md:mt-4 w-full flex items-center justify-center">
                      <img
                        src="/sponsors/4.svg"
                        alt="Brasão da Prefeitura Municipal de Bernardino de Campos"
                        loading="lazy"
                        className="h-[12.5rem] md:h-[15rem] w-auto drop-shadow-[4px_4px_0_rgba(0,0,0,0.6)]"
                      />
                    </div>
                    <h2 className="text-center text-xl md:text-2xl font-semibold text-white mt-3">
                      Prefeitura Municipal de Bernardino de Campos
                    </h2>
                  </div>
                </FloatingPanel>
                <TapeCorner corner="top-left" className="z-20 opacity-90" />
                <TapeCorner corner="top-right" className="z-20 opacity-90" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controlada por SHOW_SUPPORT_SECTION em src/config/featureFlags.ts */}
        {SHOW_SUPPORT_SECTION && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="mt-6 md:mt-10"
          >
            <div className="max-w-7xl mx-auto px-4">
              <div className="relative">
                <FloatingPanel>
                  <section id="apoio" aria-labelledby="apoio-title">
                    <div className="rounded-2xl border border-white/15 bg-black p-4 md:p-6">
                      <h2
                        id="apoio-title"
                        className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-white mb-2"
                      >
                        Apoio
                      </h2>
                      <p className="text-white/80 text-sm md:text-base mb-4">Marcas que impulsionam este projeto</p>
                      <LogoCarousel
                        className="py-2"
                        logos={[
                          { id: '1', name: 'Sponsor 1', logo: '/sponsors/1.svg', url: '#' },
                          { id: '2', name: 'Sponsor 2', logo: '/sponsors/2.svg', url: '#' },
                          { id: '3', name: 'Sponsor 3', logo: '/sponsors/3.svg', url: '#' },
                          { id: '4', name: 'Sponsor 4', logo: '/sponsors/4.svg', url: '#' },
                          { id: '5', name: 'Sponsor 5', logo: '/sponsors/5.svg', url: '#' },
                          { id: '6', name: 'Sponsor 6', logo: '/sponsors/6.svg', url: '#' },
                          { id: '7', name: 'Sponsor 7', logo: '/sponsors/7.svg', url: '#' },
                          { id: '8', name: 'Sponsor 8', logo: '/sponsors/8.svg', url: '#' },
                          { id: '9', name: 'Sponsor 9', logo: '/sponsors/9.svg', url: '#' },
                          { id: '10', name: 'Sponsor 10', logo: '/sponsors/10.svg', url: '#' },
                          { id: '11', name: 'Sponsor 11', logo: '/sponsors/11.svg', url: '#' },
                          { id: '12', name: 'Sponsor 12', logo: '/sponsors/12.svg', url: '#' },
                          { id: '13', name: 'Sponsor 13', logo: '/sponsors/13.svg', url: '#' },
                          { id: '14', name: 'Sponsor 14', logo: '/sponsors/14.svg', url: '#' },
                          { id: '15', name: 'Sponsor 15', logo: '/sponsors/15.svg', url: '#' },
                          { id: '16', name: 'Sponsor 16', logo: '/sponsors/16.svg', url: '#' },
                          { id: '17', name: 'Sponsor 17', logo: '/sponsors/17.svg', url: '#' },
                          { id: '18', name: 'Sponsor 18', logo: '/sponsors/18.svg', url: '#' },
                          { id: '19', name: 'Sponsor 19', logo: '/sponsors/19.svg', url: '#' },
                          { id: '20', name: 'Sponsor 20', logo: '/sponsors/20.svg', url: '#' },
                          { id: '21', name: 'Sponsor 21', logo: '/sponsors/21.svg', url: '#' },
                          { id: '22', name: 'Sponsor 22', logo: '/sponsors/22.svg', url: '#' },
                          { id: '23', name: 'Sponsor 23', logo: '/sponsors/23.svg', url: '#' },
                          { id: '24', name: 'Sponsor 24', logo: '/sponsors/24.svg', url: '#' },
                          { id: '25', name: 'Sponsor 25', logo: '/sponsors/25.svg', url: '#' },
                          { id: '26', name: 'Sponsor 26', logo: '/sponsors/26.svg', url: '#' },
                          { id: '27', name: 'Sponsor 27', logo: '/sponsors/27.svg', url: '#' },
                        ]}
                      />
                    </div>
                  </section>
                </FloatingPanel>
                <TapeCorner corner="top-left" className="z-20 opacity-90" />
                <TapeCorner corner="top-right" className="z-20 opacity-90" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Redes Sociais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        >
          <SocialLinksSection />
        </motion.div>


        {/* Modais das seções */}


        {modal === 'playlist' && (
          <Modal title="Playlist">
            <div className="p-4 text-white text-center">
              <p className="text-sm opacity-80 mb-4">
                Curta nossa playlist oficial do Estação Rock Festival
              </p>
              <a
                href="https://open.spotify.com/playlist/6KGq7v4JGz9Z2k1YPkF8Xm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition"
              >
                Abrir no Spotify
              </a>
            </div>
          </Modal>
        )}

        {modal === 'mural' && (
          <Modal title="Mural">
            <GaleriaSection />
          </Modal>
        )}


        
        
        
        {/* Seções completas abaixo dos cards para SEO e navegação */}
        <div className="relative z-20 mt-16">
          
          
          
          <HeroScrollAnimation 
            linkHref="https://www.instagram.com/epicoeric/"
            linkTarget="_blank"
            linkAriaLabel="Abrir Instagram @epicoeric em nova aba"
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
