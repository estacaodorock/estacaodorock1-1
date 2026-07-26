import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Info, 
  Music, 
  Calendar, 
  Image, 
  MapPin, 
  Heart,
  Menu,
  X,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SHOW_SUPPORT_SECTION } from '@/config/featureFlags';
import './rock-styles.css';

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAppearing, setIsAppearing] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);
  const appearTimeoutRef = useRef<number | null>(null);

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };
  const clearAppearTimeout = () => {
    if (appearTimeoutRef.current) {
      clearTimeout(appearTimeoutRef.current);
      appearTimeoutRef.current = null;
    }
  };

  const navigationItems = [
    { id: 'hero', label: 'Início', icon: Home },
    { id: 'lineup', label: 'Programação', icon: Calendar },
    { id: 'artistas', label: 'Artistas', icon: Music },
    { id: 'atracoes', label: 'Atrações', icon: Zap },
    { id: 'mapa', label: 'Mapa', icon: MapPin },
    { id: 'interatividade', label: 'Interatividade', icon: Zap },
    { id: 'galeria', label: 'Galeria', icon: Image },
    { id: 'sobre', label: 'Sobre', icon: Info },
    ...(SHOW_SUPPORT_SECTION ? [{ id: 'apoio', label: 'Apoio', icon: Heart }] : []),
    { id: 'fale-conosco', label: 'Contato', icon: Info },
  ];

  // Apenas para efeito visual do header compacto (sem cálculos pesados no scroll)
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll as EventListener);
  }, []);

  // Detectar seção ativa com IntersectionObserver (evita cálculos a cada scroll)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sectionIds = navigationItems.map((i) => i.id);
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    if (sections.length === 0) return;

    // Mapa de interseção por seção
    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          // Usar o intersectionRatio como proxy de visibilidade
          ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
          changed = true;
        }
        if (changed) {
          // Seleciona a seção com maior interseção
          let maxId = activeSection;
          let maxRatio = -1;
          for (const [id, ratio] of ratios.entries()) {
            if (ratio > maxRatio) {
              maxRatio = ratio;
              maxId = id;
            }
          }
          if (maxId && maxId !== activeSection) setActiveSection(maxId);
        }
      },
      {
        // Considera visível quando cruza a região central da viewport
        root: null,
        rootMargin: '-45% 0px -45% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Zona de hover no topo
  useEffect(() => {
    const hoverZone = document.getElementById('nav-hover-zone');
    if (!hoverZone) return;

    const onEnter = () => {
      clearHideTimeout();
      setIsVisible(true);
    };
    const onLeave = () => {
      if (!isOpen) {
        clearHideTimeout();
        hideTimeoutRef.current = window.setTimeout(() => setIsVisible(false), 4000);
      }
    };

    hoverZone.addEventListener('mouseenter', onEnter);
    hoverZone.addEventListener('mouseleave', onLeave);
    return () => {
      hoverZone.removeEventListener('mouseenter', onEnter);
      hoverZone.removeEventListener('mouseleave', onLeave);
    };
  }, [isOpen]);

  // Sempre mostrar enquanto menu mobile estiver aberto
  useEffect(() => {
    if (isOpen) setIsVisible(true);
  }, [isOpen]);

  // Em dispositivos sem hover (touch), manter a navbar visível
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(hover: none), (pointer: coarse)');
      if (mq.matches) setIsVisible(true);
    }
  }, []);

  // Controla estado de "aparecendo" para transparência inicial
  useEffect(() => {
    clearAppearTimeout();
    if (isVisible) {
      setIsAppearing(true);
      appearTimeoutRef.current = window.setTimeout(() => setIsAppearing(false), 600);
    } else {
      setIsAppearing(false);
    }
    return () => {
      clearAppearTimeout();
    };
  }, [isVisible]);

  useEffect(() => {
    return () => {
      clearHideTimeout();
      clearAppearTimeout();
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = 88; // compensar altura da navbar
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      const targetY = Math.max(elementTop - yOffset, 0);
      window.scrollTo({ top: targetY, behavior: 'smooth' });

      // Acessibilidade: focar a seção após o scroll
      const prevTabIndex = element.getAttribute('tabindex');
      element.setAttribute('tabindex', '-1');
      setTimeout(() => {
        try { element.focus({ preventScroll: true }); } catch { /* noop */ }
        if (prevTabIndex === null) {
          // Remover apenas se não existia previamente
          element.removeAttribute('tabindex');
        } else {
          element.setAttribute('tabindex', prevTabIndex);
        }
      }, 450);

      // Fechar menu mobile ao navegar
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Zona invisível de hover no topo */}
      <div
        id="nav-hover-zone"
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-10 z-40"
        style={{ pointerEvents: 'auto' }}
      />

      {/* Main Navigation */}
      <nav
        aria-label="Navegação principal"
        onMouseEnter={() => { clearHideTimeout(); setIsVisible(true); }}
        onMouseLeave={() => { if (!isOpen) { clearHideTimeout(); hideTimeoutRef.current = window.setTimeout(() => setIsVisible(false), 4000); } }}
        onFocus={() => { clearHideTimeout(); setIsVisible(true); }}
        onBlur={() => { if (!isOpen) { clearHideTimeout(); hideTimeoutRef.current = window.setTimeout(() => setIsVisible(false), 4000); } }}
        className={`fixed top-0 left-0 w-full z-50 border-b border-white/10 transition-all duration-500 ease-out ${isVisible ? 'translate-y-0' : '-translate-y-full'} ${isAppearing ? 'bg-transparent backdrop-blur-0' : (isScrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-black/60 backdrop-blur')}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <a href="/" className="flex items-center gap-4">
             <img 
               src="/estacao-logo.svg"
               alt="Estação Rock Logo"
               className="h-16 w-auto drop-shadow-[0_0_12px_#ff2a2a] animate-heartbeat"
             />
           </a>

          {/* Menu Desktop */}
          <ul className="hidden md:flex gap-8 text-white uppercase text-sm font-bold tracking-wider">
            {navigationItems.map((item) => {
              const isActive = activeSection === item.id;
              
              return (
                <li key={item.id}>
                  <a 
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.id);
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      "hover:text-[#ffbd00] transition-colors duration-200",
                      isActive ? "text-[#ffbd00]" : "text-white"
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Menu Mobile (hamburger) */}
          <button 
            className="md:hidden text-white text-3xl hover:text-[#ff2a2a] transition-colors duration-200"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Alternar menu"
            aria-expanded={isOpen}
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
         <div className="md:hidden fixed inset-0 z-40 bg-black/95 backdrop-blur-md" onMouseEnter={() => setIsVisible(true)}>
           <div className="pt-32 px-6">
            <div className="space-y-4">
              {navigationItems.map((item) => {
                const isActive = activeSection === item.id;
                
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.id);
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      "block w-full text-left p-4 text-lg font-bold uppercase tracking-wider transition-all duration-300 border-l-4",
                      isActive 
                        ? "text-[#ffbd00] border-[#ffbd00] bg-[#ffbd00]/10" 
                        : "text-white border-transparent hover:text-[#ffbd00] hover:border-[#ffbd00] hover:bg-[#ffbd00]/5"
                    )}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>

            {/* Mobile Footer */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="text-center text-sm text-white/60 font-bold uppercase tracking-wider">
                Estação Rock 2025
              </div>
              <div className="text-center text-xs text-white/40 mt-2">
                15, 16 e 17 de Agosto • São Paulo
              </div>
            </div>
          </div>
        </div>
      )}


    </>
  );
}

export default Navigation;
