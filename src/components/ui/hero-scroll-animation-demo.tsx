"use client";

import React from 'react';
import HeroScrollAnimation from '@/components/ui/hero-scroll-animation';

export function DemoHeroScroll() {
  return (
    <HeroScrollAnimation
      linkHref="https://www.instagram.com/epicoeric/"
      linkTarget="_blank"
      linkAriaLabel="Abrir Instagram do Épico Eric em nova aba"
    />
  );
}
