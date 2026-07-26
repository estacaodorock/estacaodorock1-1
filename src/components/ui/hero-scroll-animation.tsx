"use client"; // eslint-disable-line @typescript-eslint/no-unused-expressions

import { useScroll, useTransform, motion, MotionValue, useReducedMotion } from 'framer-motion';
import React, { useRef, forwardRef, useEffect, useState, useCallback } from 'react';
import { SHOW_EXTENDED_FOOTER } from '@/config/featureFlags';

interface SectionProps {
  scrollYProgress: MotionValue<number>;
  animateOnScroll?: boolean;
}

interface HeroScrollProps {
  linkHref?: string;
  linkTarget?: '_self' | '_blank';
  linkAriaLabel?: string;
}

// ---------- Componente de fita adesiva ----------
const Tape: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br'; color?: string }> = ({
  position,
  color = '#ffbd00',
}) => {
  const positions: Record<string, string> = {
    tl: 'top-0 left-0 -translate-x-1/3 -translate-y-1/3 -rotate-6',
    tr: 'top-0 right-0 translate-x-1/3 -translate-y-1/3 rotate-6',
    bl: 'bottom-0 left-0 -translate-x-1/3 translate-y-1/3 rotate-6',
    br: 'bottom-0 right-0 translate-x-1/3 translate-y-1/3 -rotate-6',
  };

  return (
    <div
      className={`absolute w-16 h-4 ${positions[position]}`}
      style={{
        backgroundColor: color,
        boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
      }}
    />
  );
};

// ---------- SECTION 1 (Pôster 1) ----------
const Section1: React.FC<SectionProps> = ({ scrollYProgress, animateOnScroll = true }) => {
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, -10]);

  return (
    <motion.section
      style={animateOnScroll ? { scale, rotate } : undefined}
      className='sticky top-0 h-screen flex flex-col items-center justify-center
                 bg-black overflow-hidden'
    >
      <div className="relative bg-[#111111] border-2 border-white/20 rounded-md px-6 py-12
                      text-center shadow-xl max-w-3xl mx-auto">
        
        {/* Fitas adesivas */}
        <Tape position="tl" color="#ffbd00" />
        <Tape position="tr" color="#ff2a2a" />
        <Tape position="bl" color="#ff2a2a" />
        <Tape position="br" color="#ffbd00" />

        <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold uppercase leading-tight text-[#f0f0f0]'>
          VOCÊ CHEGOU <br /> AO FIM... MAS O SHOW NÃO PARA!
        </h1>
      </div>
    </motion.section>
  );
};

// ---------- SECTION 2 (Pôster 2) ----------
const Section2: React.FC<SectionProps> = ({ scrollYProgress }) => {
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [10, 0]);

  return (
    <motion.section
      style={{ scale, rotate }}
      className='relative h-screen bg-[#111111] flex flex-col items-center justify-center'
    >
      <div className="relative bg-black border-2 border-white/20 rounded-md px-6 py-12
                      text-center shadow-xl max-w-3xl mx-auto">

        {/* Fitas adesivas */}
        <Tape position="tl" color="#ff2a2a" />
        <Tape position="tr" color="#ffbd00" />
        <Tape position="bl" color="#ffbd00" />
        <Tape position="br" color="#ff2a2a" />

        <h2 className='text-2xl md:text-4xl lg:text-5xl font-bold uppercase leading-snug text-[#f0f0f0]'>
          Este site foi turbinado pelo caos criativo da...
        </h2>
       </div>
     </motion.section>
   );
 };

// ---------- COMPONENT PRINCIPAL ----------
const HeroScrollAnimation = forwardRef<HTMLElement, HeroScrollProps>(({ linkHref, linkTarget = '_self', linkAriaLabel }, ref) => {
  const container = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [hasPlayed, setHasPlayed] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [showVideoSection, setShowVideoSection] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  // Observa o footer e exibe vídeo quando estiver no viewport
  useEffect(() => {
    if (!SHOW_EXTENDED_FOOTER || !footerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting; // menos restritivo para mobile
        setIsFooterVisible(isVisible);
        if (isVisible) {
          setShowVideoSection(true);
        }
      },
      { root: null, threshold: 0, rootMargin: '0px 0px 50% 0px' }
    );

    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  const playVideo = useCallback(async () => {
    if (hasPlayed) return;
    const video = videoRef.current;
    if (!video) return;

    try {
      // Garantir atributos e estado antes do play (Safari iOS)
      video.controls = false;
      video.loop = false;
      video.playsInline = true;
      video.muted = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('muted', '');
      video.setAttribute('autoplay', '');
      // Não chamar video.load() aqui para não reiniciar o buffer quando já há dados
      await video.play();
      setHasPlayed(true);
    } catch (e) {
      // Segunda tentativa após próximo frame (alguns navegadores precisam de um tick)
      try {
        await new Promise(requestAnimationFrame);
        await video.play();
        setHasPlayed(true);
      } catch (err) {
        console.warn('Erro ao reproduzir vídeo:', err);
      }
    }
  }, [hasPlayed]);

  // Auto-play quando vídeo aparecer
  useEffect(() => {
    if (showVideoSection && !hasPlayed) {
      const timer = setTimeout(() => {
        playVideo();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showVideoSection, hasPlayed, playVideo]);

  // Fallback: primeiro gesto do usuário (iOS pode exigir gesto em alguns cenários específicos)
  useEffect(() => {
    if (!showVideoSection || hasPlayed) return;
    const handler = () => { void playVideo(); };
    document.addEventListener('touchstart', handler, { once: true, passive: true });
    document.addEventListener('pointerdown', handler, { once: true });
    document.addEventListener('click', handler, { once: true });
    return () => {
      document.removeEventListener('touchstart', handler as any);
      document.removeEventListener('pointerdown', handler as any);
      document.removeEventListener('click', handler as any);
    };
  }, [showVideoSection, hasPlayed, playVideo]);

  // Fallback: quando a aba volta a ficar visível
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && showVideoSection && !hasPlayed) {
        void playVideo();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [showVideoSection, hasPlayed, playVideo]);

  // Handler para quando o vídeo termina - remove scroll lock
  const handleVideoEnded = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('overflow-hidden');
    }
  }, []);

  // Handler para erros e abortos do vídeo - remove scroll lock 
  const handleVideoError = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('overflow-hidden');
    }
  }, []);

  const handleVideoAbort = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('overflow-hidden');
    }
  }, []);

  // Teclas acessíveis no vídeo (Play/Pause com Espaço)
  const onVideoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault();
      const video = videoRef.current;
      if (video) {
        if (video.paused) {
          void playVideo();
        } else {
          video.pause();
        }
      }
    }
  };

  return (
    <main
      ref={container}
      className={`relative overflow-x-hidden ${SHOW_EXTENDED_FOOTER ? 'h-[200vh]' : 'h-screen'}`}
    >
      <Section1 scrollYProgress={scrollYProgress} animateOnScroll={SHOW_EXTENDED_FOOTER} />

      {SHOW_EXTENDED_FOOTER && (
        <>
          <Section2 scrollYProgress={scrollYProgress} />

          <footer ref={footerRef} className='bg-black py-16 flex justify-center items-center' aria-hidden="true">
          </footer>

          {/* Seção de vídeo inline full-width quando chegar ao footer */}
          {showVideoSection && (
            <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full bg-black py-8"
        >
          <div className="max-w-full mx-auto px-4">
            <div className="text-center mb-6">
              <h3 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-[#ff2a2a] drop-shadow-[4px_4px_0_#000] mb-2 font-queenrocker">
                O SHOW CONTINUA!
              </h3>
              {/* Removido conforme solicitação: Assista ao vídeo exclusivo do festival */}
            </div>
            
            {/* Container do vídeo em full-width */}
            <div className="w-full max-w-6xl mx-auto">
              <div className="relative w-full pb-[56.25%] bg-black shadow-lg">
                <video
                  ref={videoRef}
                  preload="auto"
                  playsInline
                  // @ts-ignore: atributo legado necessário para iOS Safari inline
                  webkit-playsinline
                  // @ts-ignore: atributo para navegadores baseados em X5 (Android)
                  x5-playsinline
                  muted
                  autoPlay
                  disableRemotePlayback
                  poster="/banner2.png"
                  onPlay={() => { if (!hasPlayed) setHasPlayed(true); }}
                  onLoadedMetadata={() => { if (!hasPlayed) void playVideo(); }}
                  onLoadedData={() => { if (!hasPlayed) void playVideo(); }}
                  onCanPlay={() => { if (!hasPlayed) void playVideo(); }}
                  onEnded={handleVideoEnded}
                  onError={handleVideoError}
                  onAbort={handleVideoAbort}
                  onKeyDown={onVideoKeyDown}
                  className="absolute inset-0 w-full h-full object-cover no-native-controls"
                  aria-label="Vídeo Armagedon do Estação do Rock Festival"
                  src="/video/armagedon.mp4"
                >
                  Seu navegador não suporta vídeo HTML5.
                </video>
                {/* Link overlay clicável sobre o vídeo (após iniciar) */}
                {linkHref && (
                  <a
                    href={linkHref}
                    target={linkTarget}
                    rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
                    aria-label={linkAriaLabel || 'Abrir página relacionada ao vídeo'}
                    className="absolute inset-0 z-30 pointer-events-auto cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400/60"
                    tabIndex={0}
                  />
                )}
                
                {/* Overlay play button se não iniciou ainda */}
                {!hasPlayed && (
                  <button
                    onClick={playVideo}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 hover:bg-black/30 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
                    aria-label="Reproduzir vídeo"
                  >
                    <div className="w-20 h-20 bg-[#ff2a2a] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <svg 
                        width="32" 
                        height="32" 
                        viewBox="0 0 24 24" 
                        fill="white" 
                        className="ml-1"
                      >
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </button>
                )}
              </div>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-white/60 text-sm">
                © Copyright 2025 Estação do Rock. Todos os direitos reservados.
              </p>
            </div>
          </div>
            </motion.section>
          )}
        </>
      )}
    </main>
  );
});

HeroScrollAnimation.displayName = 'HeroScrollAnimation';
export default HeroScrollAnimation;
