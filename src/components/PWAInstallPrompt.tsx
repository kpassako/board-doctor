import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Ne pas afficher si déjà installé
  if (!showPrompt || window.matchMedia('(display-mode: standalone)').matches) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
   >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
          <Download className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            Installer Board Doctor
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Installez l'application pour un accès rapide et hors ligne
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-blue-600 text-white px-4 p-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Installer
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
