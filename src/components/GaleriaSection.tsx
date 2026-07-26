import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { Camera, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { HoverImageGallery } from '@/components/ui/hover-image-gallery';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_GRID_COUNT = 12;
const GRID_PAGE_SIZE = 12;

type GalleryPhoto = {
  id: number;
  thumb: string;
  original: string;
  caption: string;
};

type Manifest = {
  year: number;
  count: number;
  basePath: string;
  items: { name: string; thumb: string; original: string }[];
};

type GalleryModalProps = {
  children: ReactNode;
  title: string;
  portalEl: HTMLElement | null;
  modalRef: RefObject<HTMLDivElement>;
  headerRef: RefObject<HTMLDivElement>;
  closeButtonRef: RefObject<HTMLButtonElement>;
  closeLabel: string;
  onBackdropClose: () => void;
  onCloseButton: () => void;
};

const GalleryModal = ({
  children,
  title,
  portalEl,
  modalRef,
  headerRef,
  closeButtonRef,
  closeLabel,
  onBackdropClose,
  onCloseButton,
}: GalleryModalProps) => {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!portalEl) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        className="absolute inset-0 bg-black/70"
        aria-hidden="true"
        onClick={onBackdropClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      />

      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-modal-title"
        className="relative z-10 w-full max-w-[min(1200px,calc(100vw-2rem))] h-[92vh] max-h-[92vh] flex flex-col min-h-0 rounded-2xl"
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.99, y: -4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div className="p-[1px] h-full rounded-2xl bg-gradient-to-r from-[#ff2a2a] via-[#ffbd00] to-[#ff2a2a]">
          <div className="relative h-full bg-black/70 border border-white/10 rounded-2xl flex flex-col min-h-0">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/10 to-transparent rounded-t-2xl"
              aria-hidden="true"
            />

            <div ref={headerRef} className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
              <h2 id="gallery-modal-title" className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider">
                {title}
              </h2>
              <button
                ref={closeButtonRef}
                onClick={onCloseButton}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus:ring-2 focus:ring-white/40 focus:outline-none"
                aria-label={closeLabel}
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {children}
          </div>
        </div>
      </motion.div>
    </motion.div>,
    portalEl,
  );
};

export const GaleriaSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [shouldLoadGallery, setShouldLoadGallery] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [allPhotos, setAllPhotos] = useState<GalleryPhoto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [gridCount, setGridCount] = useState(INITIAL_GRID_COUNT);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [baseLoaded, setBaseLoaded] = useState(false);
  const [fadingOverlay, setFadingOverlay] = useState(false);
  // Fonte da imagem de overlay (pode ser o thumb ao abrir a viewer)
  const [overlaySrc, setOverlaySrc] = useState<string | null>(null);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  // Adia o manifesto e as imagens até a seção se aproximar do viewport.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setShouldLoadGallery(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadGallery(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px', threshold: 0.01 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Portal isolado para evitar overflow/transform em navegadores móveis.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    let el = document.getElementById('modal-root') as HTMLElement | null;
    let created = false;
    if (!el) {
      el = document.createElement('div');
      el.id = 'modal-root';
      document.body.appendChild(el);
      created = true;
    }
    setPortalEl(el);
    return () => {
      if (created && el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    };
  }, []);

  // Dev helper: abrir o modal automaticamente com hash #openGallery (somente em dev)
  useEffect(() => {
    if (import.meta.env.DEV && typeof window !== 'undefined' && window.location.hash.includes('openGallery')) {
      setShouldLoadGallery(true);
      setShowModal(true);
      setViewerOpen(false);
      setTimeout(() => modalRef.current?.scrollTo?.({ top: 0 }), 50);
    }
  }, []);

  // Carregar manifest da galeria 2025
  useEffect(() => {
    if (!shouldLoadGallery) return;

    let cancelled = false;
    const controller = new AbortController();

    const requestManifest = async (url: string, cache: RequestCache) => {
      const response = await fetch(url, { signal: controller.signal, cache });
      if (!response.ok) throw new Error(`Falha ao carregar manifest da galeria (${response.status})`);
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Manifest não é JSON (content-type inesperado)');
      }
      const manifest: Manifest = await response.json();
      if (!Array.isArray(manifest.items) || manifest.items.length === 0) {
        throw new Error('Manifest da galeria está vazio ou inválido');
      }
      return manifest;
    };

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const ts = import.meta.env.DEV ? `?ts=${Date.now()}` : '';
        const url = `${import.meta.env.BASE_URL || '/'}galeria/2025/manifest.json${ts}`.replace(/\/+/, '/');
        let manifest: Manifest;

        try {
          manifest = await requestManifest(url, import.meta.env.DEV ? 'no-store' : 'default');
        } catch (error) {
          if (!import.meta.env.DEV || controller.signal.aborted) throw error;
          manifest = await requestManifest('/galeria/2025/manifest.json', 'no-store');
        }

        if (cancelled) return;
        const photos: GalleryPhoto[] = manifest.items.map((it, idx) => ({
          id: idx + 1,
          thumb: it.thumb,
          original: it.original,
          caption: ''
        }));
        setAllPhotos(photos);
      } catch (e) {
        if (controller.signal.aborted || cancelled) return;
        console.error('Erro ao carregar manifest da galeria:', e);
        setAllPhotos([]);
        setLoadError('Não foi possível carregar as fotos agora.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [shouldLoadGallery, loadAttempt]);
  
  // Refs para foco e acessibilidade
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // Refs de layout: header e footer do modal para cálculo de altura disponível
  const headerElRef = useRef<HTMLDivElement>(null);
  const footerElRef = useRef<HTMLDivElement>(null);
  // Refs para medir e adaptar (ResizeObserver) e para swipe
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const activeImageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);

  // Derivar fotos da grid a partir do estado unificado (primeiras 6)
  const gridPhotos = allPhotos.slice(0, 6);

  const startTransitionTo = useCallback((nextIdx: number) => {
    if (!allPhotos.length) return;
    if (nextIdx === displayedIndex) return;
    // Usa a imagem atual como overlay durante a transição
    setPrevIndex(displayedIndex);
    setOverlaySrc(allPhotos[displayedIndex]?.original || null);
    setDisplayedIndex(nextIdx);
    setBaseLoaded(false);
    setFadingOverlay(false);
  }, [allPhotos, displayedIndex]);

  const nextImage = useCallback(() => {
    if (!allPhotos.length) return;
    const nextIdx = (displayedIndex + 1) % allPhotos.length;
    startTransitionTo(nextIdx);
  }, [allPhotos.length, displayedIndex, startTransitionTo]);

  const prevImage = useCallback(() => {
    if (!allPhotos.length) return;
    const prevIdx = (displayedIndex - 1 + allPhotos.length) % allPhotos.length;
    startTransitionTo(prevIdx);
  }, [allPhotos.length, displayedIndex, startTransitionTo]);

  const openModal = () => {
    setGridCount(INITIAL_GRID_COUNT);
    setShowModal(true);
    setViewerOpen(false);
  };

  const closeViewer = useCallback(() => {
    setViewerOpen(false);
    setPrevIndex(null);
    setOverlaySrc(null);
    setBaseLoaded(false);
    setFadingOverlay(false);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    closeViewer();
  }, [closeViewer]);

  const openViewerAt = (idx: number) => {
    // Exibe o thumb imediatamente como overlay enquanto carrega o original
    setDisplayedIndex(idx);
    setPrevIndex(idx);
    setOverlaySrc(allPhotos[idx]?.thumb || null);
    setBaseLoaded(false);
    setFadingOverlay(false);
    setViewerOpen(true);
  };

  // Swipe em dispositivos touch (modal)
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    touchStartTime.current = Date.now();
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = Math.abs(t.clientY - touchStartY.current);
    const dt = Date.now() - touchStartTime.current;

    const SWIPE_THRESHOLD = 50; // px
    const SWIPE_TIME = 600; // ms
    const MAX_VERTICAL_DRIFT = 80; // px

    if (Math.abs(dx) > SWIPE_THRESHOLD && dt < SWIPE_TIME && dy < MAX_VERTICAL_DRIFT) {
      if (dx < 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Adaptar altura do container da imagem com ResizeObserver (altura baseada no viewport menos header/footer)
  useEffect(() => {
    if (!showModal) return;
    const container = imageContainerRef.current;
    const modal = modalRef.current;
    if (!container) return;

    const getViewportHeight = () => window.visualViewport?.height || window.innerHeight;

    const updateFromImage = () => {
      const headerH = headerElRef.current?.getBoundingClientRect().height ?? 0;
      const footerH = footerElRef.current?.getBoundingClientRect().height ?? 0;
      const margin = 24; // folga visual menor para maximizar a área da imagem
      const viewportH = getViewportHeight();
      const maxByViewport = Math.floor(viewportH * 0.92);
      const available = Math.max(200, Math.min(viewportH - headerH - footerH - margin, maxByViewport));
      container.style.height = `${available}px`;

      // Ajusta a largura do card do modal para acompanhar a largura ideal da imagem
      const img = activeImageRef.current;
      const card = modal;
      if (img && card && img.naturalWidth && img.naturalHeight) {
        const aspect = img.naturalWidth / img.naturalHeight;
        const idealWidth = Math.min(Math.floor(available * aspect), Math.floor(window.innerWidth - 32));
        // Limite superior opcional para não exceder designs grandes
        const clamped = Math.max(280, Math.min(idealWidth, 1200));
        card.style.width = `${clamped}px`;
      }
    };

    const ro = new ResizeObserver(() => updateFromImage());
    if (activeImageRef.current) ro.observe(activeImageRef.current);

    // Ouvir mudanças de viewport visual (iOS toolbars, etc.)
    const vv = window.visualViewport;
    const onVVResize = () => updateFromImage();
    vv?.addEventListener?.('resize', onVVResize);
    vv?.addEventListener?.('scroll', onVVResize);

    window.addEventListener('resize', updateFromImage);
    // chamada inicial e após baseLoaded para garantir cálculo com dimensões reais
    updateFromImage();

    return () => {
      ro.disconnect();
      vv?.removeEventListener?.('resize', onVVResize);
      vv?.removeEventListener?.('scroll', onVVResize);
      window.removeEventListener('resize', updateFromImage);
      if (container) container.style.height = '';
      if (modal) modal.style.width = '';
    };
  }, [showModal, viewerOpen, displayedIndex, baseLoaded]);

  // Navegação por teclado e foco inicial
  useEffect(() => {
    if (!showModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          if (viewerOpen) {
            closeViewer();
          } else {
            closeModal();
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (viewerOpen) prevImage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (viewerOpen) nextImage();
          break;
      }
    };

    // Foco inicial no botão fechar para acessibilidade (apenas quando viewer NÃO está aberto)
    const focusCloseButton = () => {
      if (!viewerOpen && closeButtonRef.current) {
        closeButtonRef.current.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, { passive: false });
    
    // Timeout para garantir que o modal foi renderizado
    const focusTimeout = setTimeout(focusCloseButton, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimeout);
    };
  }, [showModal, viewerOpen, closeModal, closeViewer, nextImage, prevImage]);

  // Ao abrir o viewer (lightbox), focar o overlay para captar setas do teclado
  useEffect(() => {
    if (viewerOpen) {
      const id = requestAnimationFrame(() => overlayRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [viewerOpen]);

  // Quando a imagem base carregar, inicia fade-out do overlay (imagem anterior)
  useEffect(() => {
    if (prevIndex !== null && baseLoaded) {
      // inicia fade no próximo frame para garantir transição
      const id = requestAnimationFrame(() => setFadingOverlay(true));
      return () => cancelAnimationFrame(id);
    }
  }, [prevIndex, baseLoaded]);

  return (
    <section ref={sectionRef} id="galeria" aria-labelledby="galeria-title" className="cv-auto-lg bg-black py-20 px-6">
      <div className="max-w-6xl mx-auto py-16 px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 id="galeria-title" className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-[#f0f0f0] text-center drop-shadow-[0_0_4px_#ff2a2a] mb-4">
            Nossa Última Edição
          </h2>
          <p className="text-center text-white/80 max-w-3xl mx-auto text-lg md:text-xl mb-10">
            O Estação Rock Festival 2025 foi um sucesso! Confira nas imagens.
          </p>
          
          {/* Hover Image Gallery - Seção Especial */}
          <div className="mb-16 flex flex-col items-center">
            <h3 className="text-3xl lg:text-4xl font-bold uppercase tracking-wide text-[#ffbd00] text-center mb-2">
              GALERIA INTERATIVA
            </h3>
            <p className="text-[#f0f0f0] text-center text-sm uppercase font-medium mb-8 opacity-80">
              Passe o mouse (desktop) ou toque/arraste (mobile) para navegar
            </p>
            <div className="flex justify-center">
              {allPhotos.length > 0 ? (
                <HoverImageGallery images={allPhotos.slice(0, 5).map((photo) => photo.thumb)} />
              ) : (
                <div className="flex aspect-square w-[92vw] max-w-[560px] items-center justify-center rounded-lg border border-white/10 bg-white/5 px-6 text-center text-white/70">
                  {loadError ? (
                    <div className="space-y-4">
                      <p>{loadError}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setShouldLoadGallery(true);
                          setLoadAttempt((attempt) => attempt + 1);
                        }}
                        className="rounded bg-white/10 px-4 py-2 text-sm font-bold uppercase text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  ) : (
                    <span className={isLoading ? 'animate-pulse' : ''}>
                      {isLoading ? 'Carregando galeria…' : 'A galeria será carregada ao se aproximar desta seção.'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8">
            {gridPhotos.map((photo) => (
              <div 
                key={photo.id}
                className="relative border border-white/10 bg-[#111] rounded-md overflow-hidden shadow-md transition hover:scale-[1.01]"
              >
                {/* Fitas Adesivas Decorativas */}
                <div className="absolute top-0 left-1/4 w-8 h-4 bg-[#ffbd00] transform -rotate-[6deg] z-10 opacity-80"></div>
                <div className="absolute bottom-0 right-1/3 w-6 h-3 bg-[#ffbd00] transform rotate-[3deg] z-10 opacity-80"></div>

                {/* Photo */}
                <img 
                  src={photo.thumb}
                  alt={photo.caption || `Foto ${photo.id}`}
                  className="w-full h-auto object-cover aspect-square"
                  loading="lazy"
                  decoding="async"
                />

                {/* Removido: botões de curtir nas thumbs */}
              </div>
            ))}
          </div>

          {/* Ver Mais Button */}
          {allPhotos.length > 0 && (
            <div className="text-center mt-12">
              <button
                type="button"
                onClick={openModal}
                className="bg-[#ff2a2a] text-[#f0f0f0] px-6 py-3 rounded-lg uppercase font-bold border border-white/10 hover:bg-[#e02121] transition-all hover:scale-105 focus:ring-2 focus:ring-white/30 focus:outline-none flex items-center gap-2 mx-auto"
                aria-label="Abrir galeria completa com todas as fotos"
              >
                <Camera className="w-5 h-5" />
                VER MAIS FOTOS
              </button>
            </div>
          )}

          {/* Modal do Carrossel */}
          <AnimatePresence initial={false} mode="wait">
            {showModal && (
              <GalleryModal
                title="Galeria Completa"
                portalEl={portalEl}
                modalRef={modalRef}
                headerRef={headerElRef}
                closeButtonRef={closeButtonRef}
                closeLabel={viewerOpen ? 'Fechar visualização e voltar ao grid' : 'Fechar galeria (pressione ESC)'}
                onBackdropClose={closeModal}
                onCloseButton={() => {
                  if (viewerOpen) {
                    closeViewer();
                  } else {
                    closeModal();
                  }
                }}
              >
                <div className="relative flex flex-col flex-1 min-h-0">
                  {/* GRID de thumbs rolável */}
                  <div data-testid="gallery-grid-scroll" className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-3 pt-3 pb-4 [contain:paint]" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
                    {allPhotos.length === 0 ? (
                      <div className="text-center text-white/70 py-10">Carregando fotos…</div>
                    ) : (
                      <ul
                        role="list"
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
                      >
                        {allPhotos.slice(0, gridCount).map((p, idx) => (
                            <li key={p.original}>
                              <button
                                type="button"
                                onClick={() => openViewerAt(idx)}
                                className="group w-full h-full block focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/60 rounded-md overflow-hidden border border-white/10 bg-black/30"
                              >
                                <div className="relative aspect-[16/10] overflow-hidden">
                                  <img
                                    src={p.thumb}
                                    alt={p.caption || `Foto ${idx + 1}`}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                              </button>
                            </li>
                        ))}
                      </ul>
                    )}
                    {allPhotos.length > gridCount && (
                      <div className="pt-4 flex justify-center">
                        <button
                          type="button"
                          className="px-4 py-2 text-sm rounded bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                          onClick={() => setGridCount((count) => Math.min(allPhotos.length, count + GRID_PAGE_SIZE))}
                        >
                          Carregar mais 12
                        </button>
                      </div>
                    )}
                  </div>

                  {/* LIGHTBOX overlay dentro do modal */}
                  {viewerOpen && (
                    <div
                      ref={overlayRef}
                      className="absolute inset-0 z-20 bg-black/60"
                      onMouseDown={() => overlayRef.current?.focus()}
                      onClick={() => overlayRef.current?.focus()}
                      tabIndex={0}
                    >
                      <div className="absolute inset-0 flex flex-col">
                        <div
                          ref={imageContainerRef}
                          className="relative flex items-center justify-center w-full flex-1 px-2 md:px-4"
                          onTouchStart={handleTouchStart}
                          onTouchEnd={handleTouchEnd}
                        >
                          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-full text-xs md:text-sm font-medium shadow-md z-10">
                            {displayedIndex + 1} / {allPhotos.length}
                          </div>

                          <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-black/70 text-white hover:bg-black/90 transition-all duration-200 focus:ring-2 focus:ring-white/30 focus:outline-none shadow-lg"
                            aria-label="Imagem anterior"
                            style={{ minWidth: '44px', minHeight: '44px' }}
                            type="button"
                          >
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                          </button>

                          <img
                            ref={activeImageRef}
                            src={allPhotos[displayedIndex]?.original}
                            alt={allPhotos[displayedIndex]?.caption || `Foto ${displayedIndex + 1}`}
                            className="w-auto h-auto max-h-full max-w-full object-contain shadow-2xl select-none"
                            decoding="async"
                            onLoad={() => setBaseLoaded(true)}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                            draggable={false}
                          />

                          {prevIndex !== null && (
                            <div
                              className={`absolute inset-0 grid place-items-center transition-opacity duration-300 ease-in-out pointer-events-none ${fadingOverlay ? 'opacity-0' : 'opacity-100'}`}
                              onTransitionEnd={() => { setPrevIndex(null); setFadingOverlay(false); setOverlaySrc(null); }}
                            >
                              <img
                                src={overlaySrc || allPhotos[prevIndex]?.original}
                                alt={allPhotos[prevIndex!]?.caption || `Foto ${prevIndex + 1}`}
                                className="w-auto h-auto max-h-full max-w-full object-contain shadow-2xl select-none"
                                decoding="async"
                                draggable={false}
                              />
                            </div>
                          )}

                          <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-black/70 text-white hover:bg-black/90 transition-all duration-200 focus:ring-2 focus:ring-white/30 focus:outline-none shadow-lg"
                            aria-label="Próxima imagem"
                            style={{ minWidth: '44px', minHeight: '44px' }}
                            type="button"
                          >
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                          </button>
                        </div>

                        <div ref={footerElRef} className="p-3 md:p-4 border-t border-white/10 bg-black/70">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-white/90 font-medium text-sm md:text-base leading-relaxed">
                                {allPhotos[displayedIndex]?.caption}
                              </p>
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={closeViewer}
                                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-white/40 focus:outline-none"
                                aria-label="Fechar visualização"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </GalleryModal>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

// Removido: LinkPreview (Wikipedia) e dependências associadas
