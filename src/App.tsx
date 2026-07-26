"use client";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalStateProvider } from "@/hooks/use-global-state";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { AudioProvider } from "@/contexts/AudioContext";
import { SkipLinks } from "@/components/SkipLinks";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import PreHome from "./pages/PreHome";
import PageLoader from "./components/PageLoader";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { SHOW_PREHOME } from "./config/featureFlags";

const queryClient = new QueryClient();

const App = () => {
  const [step, setStep] = useState<"prehome" | "loader" | "main">(
    SHOW_PREHOME ? "prehome" : "loader",
  );
  const [userGesture, setUserGesture] = useState<boolean>(false);

  const handleEnter = () => {
    setUserGesture(false); // Transição automática da PreHome, sem gesto do usuário
    setStep("loader");
  };

  const handleSkip = () => {
    setStep("main"); // Pular direto sem música
  };

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStateProvider>
        <AccessibilityProvider>
          <AudioProvider>
            {step === "prehome" && <PreHome onEnter={handleEnter} />}

            {step === "loader" && (
              <PageLoader onFinish={() => setStep("main")} userGesture={userGesture} />
            )}

            {step === "main" && (
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <SkipLinks />
                  <PWAInstallPrompt />
                  <PWAUpdatePrompt />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/festival" element={<Index />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Analytics />
                  <SpeedInsights />
                </BrowserRouter>
              </TooltipProvider>
            )}
          </AudioProvider>
        </AccessibilityProvider>
      </GlobalStateProvider>
    </QueryClientProvider>
  );
};

export default App;
