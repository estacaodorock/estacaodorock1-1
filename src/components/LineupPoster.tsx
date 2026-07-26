"use client"

import { motion } from 'framer-motion'
import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { GrungeNoise } from '@/components/ui/grunge-noise'
import { TapeElement } from '@/components/ui/tape-element'

// Dados do lineup conforme arte de referência
const lineupData = [
  { time: '14:00', band: 'Cavalo de Aço', variant: 'red' as const, rotate: -2 },
  { time: '15:00', band: 'Carina Longband', variant: 'pink' as const, rotate: 1 },
  { time: '16:00', band: 'Coquetel AZT', badge: 'Tributo Barão Vermelho', variant: 'red' as const, rotate: -1 },
  { time: '17:00', band: 'Deck66', variant: 'pink' as const, rotate: 2 },
  { time: '18:00', band: 'Pearl Jam Cover', badge: 'Ribeirão', variant: 'red' as const, rotate: -3 },
  { time: '19:30', band: 'No Fate', variant: 'pink' as const, rotate: 1 },
  { time: '20:30', band: 'Salamancas', variant: 'red' as const, rotate: -1 },
  { time: '22:00', band: 'Raimundos', variant: 'orange' as const, rotate: 2 },
]

type Variant = 'red' | 'pink' | 'orange'

const getBgColor = (variant: Variant) => {
  switch (variant) {
    case 'red':
      return 'bg-red-600'
    case 'pink':
      return 'bg-[#f19695]'
    case 'orange':
      return 'bg-orange-500'
    default:
      return 'bg-neutral-700'
  }
}

const getRotateClass = (rotate: number) => {
  switch (rotate) {
    case -3:
      return '-rotate-3'
    case -2:
      return '-rotate-2'
    case -1:
      return '-rotate-1'
    case 1:
      return 'rotate-1'
    case 2:
      return 'rotate-2'
    case 3:
      return 'rotate-3'
    default:
      return ''
  }
}

export default function LineupPoster() {
  const containerRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    // Performance: only apply GSAP on desktop to save resources
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches
    if (isTouch) return

    const items = itemRefs.current.filter(Boolean)
    if (!items.length) return

    // GSAP microinteractions for each card
    items.forEach((item, index) => {
      if (!item) return

      const handleMouseEnter = () => {
        gsap.to(item, {
          scale: 1.05,
          rotation: lineupData[index]?.rotate * 1.5 || 0,
          y: -8,
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.2)',
          duration: 0.4,
          ease: 'power2.out',
        })
        // Subtle shake effect for grunge feel
        gsap.to(item, {
          x: '+=2',
          duration: 0.1,
          repeat: 1,
          yoyo: true,
          ease: 'power2.inOut',
        })
      }

      const handleMouseLeave = () => {
        gsap.to(item, {
          scale: 1,
          rotation: lineupData[index]?.rotate || 0,
          y: 0,
          x: 0,
          boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
          duration: 0.5,
          ease: 'power2.out',
        })
      }

      const handleFocus = handleMouseEnter
      const handleBlur = handleMouseLeave

      item.addEventListener('mouseenter', handleMouseEnter)
      item.addEventListener('mouseleave', handleMouseLeave)
      item.addEventListener('focus', handleFocus)
      item.addEventListener('blur', handleBlur)

      return () => {
        item.removeEventListener('mouseenter', handleMouseEnter)
        item.removeEventListener('mouseleave', handleMouseLeave)
        item.removeEventListener('focus', handleFocus)
        item.removeEventListener('blur', handleBlur)
      }
    })
  }, [])

  return (
    <motion.section
      id="lineup"
      ref={containerRef}
      aria-labelledby="lineup-poster-title"
      className="relative w-full flex flex-col items-center justify-center px-2 sm:px-4 py-6 sm:py-8 overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      {/* Background Grunge Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <GrungeNoise 
          patternSize={3}
          patternScaleX={1.2}
          patternScaleY={1.2}
          patternRefreshInterval={4}
          patternAlpha={0.08}
          className="absolute inset-0 mix-blend-multiply"
        />
      </div>

      {/* Decorative Tape Elements - moved to section edges to avoid overlap */}
      <TapeElement 
        variant="diagonal"
        color="yellow"
        size="sm"
        rotation={20}
        className="absolute top-2 left-2 z-10"
      />
      {/* Removido o TapeElement branco que causava o artefato visual próximo ao título */}
      {/* <TapeElement 
        variant="horizontal"
        color="white"
        size="md"
        rotation={-10}
        className="absolute top-4 right-2 z-10"
      /> */}
      <TapeElement 
        variant="vertical"
        color="red"
        size="sm"
        rotation={15}
        className="absolute bottom-4 left-2 z-10"
      />


      
      {/* Visible Section Header */}
      <div className="relative z-20 text-center mb-6 sm:mb-8">
        <h2
          id="lineup-poster-title"
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase text-white tracking-wider"
          style={{ textShadow: '3px 3px 0px #ff2a2a, 6px 6px 10px rgba(255, 42, 42, 0.3)' }}
        >
          Line-up
        </h2>
      </div>

      <div className="relative space-y-5 sm:space-y-6 md:space-y-7 w-full max-w-md z-20">
        {lineupData.map((item, idx) => (
          <motion.div
            key={`${item.band}-${idx}`}
            ref={(el) => (itemRefs.current[idx] = el)}
            initial={{ opacity: 0, y: 20, rotateZ: item.rotate }}
            animate={{ opacity: 1, y: 0, rotateZ: item.rotate }}
            transition={{ 
              delay: idx * 0.1, 
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuart for smooth entrance
            }}
            className="relative group will-change-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-md"
            tabIndex={0}
            role="button"
            aria-label={`Banda ${item.band} às ${item.time}`}
          >


            <div className="relative flex items-center shadow-xl transform will-change-transform pointer-events-auto overflow-hidden">
              {/* Subtle grunge noise overlay per card */}
              <GrungeNoise 
                patternSize={1}
                patternScaleX={0.8}
                patternScaleY={0.8}
                patternRefreshInterval={6}
                patternAlpha={0.05}
                className="absolute inset-0 mix-blend-overlay z-10 pointer-events-none"
              />

              {/* Time container */}
              <div
                className="relative bg-yellow-400 text-black font-bold px-3 py-2 text-sm rounded-l-md w-20 text-center select-none z-20"
                aria-hidden="false"
              >
                {/* Subtle distressed texture */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1 left-2 w-4 h-0.5 bg-black/20 rotate-12"></div>
                  <div className="absolute bottom-1 right-1 w-3 h-0.5 bg-black/15 -rotate-6"></div>
                </div>
                <span className="relative">{item.time}</span>
              </div>

              {/* Band name container */}
              <div
                className={[
                  'relative flex-1 text-white px-4 py-3 text-lg tracking-tight rounded-r-md font-queenrocker z-20',
                  getBgColor(item.variant),
                ].join(' ')}
              >
                {/* Subtle distressed marks */}
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                  <div className="absolute top-2 left-6 w-8 h-0.5 bg-black/30 rotate-6"></div>
                  <div className="absolute bottom-3 right-8 w-6 h-0.5 bg-white/20 -rotate-12"></div>
                </div>
                <div className="relative flex flex-wrap items-center gap-2 drop-shadow-sm">
                  <span>{item.band}</span>
                  {item.badge && (
                    <span className="inline-flex items-center rounded-sm border border-black/20 bg-yellow-400 px-2 py-0.5 text-[10px] font-bold uppercase leading-tight tracking-wide text-black shadow-sm sm:text-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional decorative elements - aligned to edge */}
      <TapeElement 
        variant="diagonal"
        color="yellow"
        size="md"
        rotation={-20}
        className="absolute bottom-2 right-2 z-10"
      />
    </motion.section>
  )
}
