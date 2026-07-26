import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FloatingPanel } from '@/components/ui/FloatingPanel';
import { TapeCorner } from '@/components/ui/tape-element';

interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
  description: string;
}

interface SocialLinksSectionProps {
  className?: string;
}

const InstagramIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-8 h-8"
    aria-hidden="true"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const EmailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-8 h-8"
    aria-hidden="true"
  >
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

export const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({
  className = ''
}) => {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const prefersReducedMotion = useReducedMotion();

  const socialLinks: SocialLink[] = [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/estacaorock.oficial/',
      icon: <InstagramIcon />,
      description: 'Siga nosso Instagram para fotos e novidades'
    },
    {
      name: 'Email',
      url: 'mailto:estacao.rock@hotmail.com',
      icon: <EmailIcon />,
      description: 'Entre em contato conosco por email'
    }
  ];

  const linkVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className={`mt-6 md:mt-10 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative">
          <FloatingPanel>
            <section id="fale-conosco" aria-labelledby="contato-title">
              <div className="rounded-2xl border border-white/15 bg-transparent p-4 md:p-6">
                <h1
                  id="contato-title"
                  className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-[#ff2a2a] mb-2"
                >
                  Fale Conosco
                </h1>
                <p className="text-white/80 text-sm md:text-base mb-6">
                  Conecte-se conosco nas plataformas digitais
                </p>
                
                <div 
                  className="flex items-center justify-center gap-8 py-4"
                  role="list"
                  aria-label="Links das redes sociais"
                >
                  {socialLinks.map((social) => (
                    <motion.div
                      key={social.name}
                      className={`relative cursor-pointer px-6 py-4 transition-opacity duration-200 ${
                        hoveredSocial && hoveredSocial !== social.name
                          ? 'opacity-50'
                          : 'opacity-100'
                      }`}
                      variants={linkVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.2 }}
                      whileHover={
                        prefersReducedMotion
                          ? undefined
                          : { y: -2, transition: { duration: 0.2 } }
                      }
                      onMouseEnter={() => {
                        setHoveredSocial(social.name);
                        setRotation(Math.random() * 20 - 10);
                      }}
                      onMouseLeave={() => setHoveredSocial(null)}
                      role="listitem"
                    >
                      <a
                        href={social.url}
                        target={social.name === 'Email' ? '_self' : '_blank'}
                        rel={social.name === 'Email' ? undefined : 'noopener noreferrer'}
                        className="block text-lg md:text-xl font-medium text-white hover:text-yellow-400 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-md px-2 py-1"
                        aria-label={social.description}
                      >
                        {social.name}
                      </a>
                      
                      <AnimatePresence>
                        {hoveredSocial === social.name && !prefersReducedMotion && (
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 flex h-full w-full items-center justify-center pointer-events-none"
                          >
                            <motion.div
                              key={social.name}
                              className="text-yellow-400 drop-shadow-lg"
                              initial={{ y: -40, rotate: 0, opacity: 0, filter: 'blur(2px)' }}
                              animate={{ y: -50, opacity: 1, filter: 'blur(0px)', rotate: rotation, transition: { duration: 0.2 } }}
                              exit={{ y: -40, opacity: 0, filter: 'blur(2px)', transition: { duration: 0.2 } }}
                              aria-hidden="true"
                            >
                              {social.icon}
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </FloatingPanel>
          {/* Fitas adesivas em torno da seção */}
          <TapeCorner corner="top-left" className="z-20 opacity-90" />
          <TapeCorner corner="top-right" className="z-20 opacity-90" />
          <TapeCorner corner="bottom-left" className="z-20 opacity-90" />
          <TapeCorner corner="bottom-right" className="z-20 opacity-90" />
        </div>
      </div>
    </motion.div>
  );
};

export default SocialLinksSection;
