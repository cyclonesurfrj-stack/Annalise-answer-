import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const dismiss = () => {
    setIsVisible(false);
  };

  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 left-6 right-6 z-[9999] md:left-auto md:right-6 md:w-96"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">Instalar Aplicativo</h3>
                  <p className="text-zinc-400 text-sm">Nexus Dissonance</p>
                </div>
              </div>
              <button
                onClick={dismiss}
                className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-zinc-300 text-sm mb-5 leading-relaxed">
              Instale o aplicativo oficial da Black Shark Innovation para uma experiência mais fluida, rápida e com acesso offline.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Sem necessidade de loja de aplicativos</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Acesso instantâneo na tela inicial</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Interface otimizada para mobile</span>
              </div>
            </div>

            <button
              onClick={handleInstall}
              className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/5"
            >
              <Download className="w-5 h-5" />
              INSTALAR AGORA
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
