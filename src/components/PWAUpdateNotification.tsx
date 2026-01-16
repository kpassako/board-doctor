import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function PWAUpdateNotification() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error: Error) {
      console.log('SW registration error', error);
    },
  });

  const [show, setShow] = useState(false);

  useEffect(() => {
    if (needRefresh) {
      setShow(true);
    }
  }, [needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setShow(false);
    setNeedRefresh(false);
  };

  if (!show) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-600 text-white rounded-lg shadow-2xl p-4 z-50 animate-slide-down">
      <div className="flex items-start space-x-3">
        <RefreshCw className="w-6 h-6 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1">
          <h3 className="font-semibold mb-1">
            Mise à jour disponible
          </h3>
          <p className="text-sm text-blue-100 mb-3">
            Une nouvelle version de Board Doctor est disponible
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={handleUpdate}
              className="flex-1 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              Mettre à jour
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-white hover:text-blue-100 transition-colors text-sm"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>   </div>
  );
}
