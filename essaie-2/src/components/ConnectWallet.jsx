import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

export default function ConnectWallet({ onClose, onConnected }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('connecting');

  // Connexion automatique au chargement du composant
  useEffect(() => {
    connectMetaMask();
  }, []);

  const connectMetaMask = async () => {
    setIsConnecting(true);
    setError('');
    setStep('connecting');

    try {
      // Vérifier si MetaMask est installé
      if (!window.ethereum) {
        throw new Error('MetaMask n\'est pas installé. Veuillez l\'installer pour continuer.');
      }

      // Demander la connexion
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('Aucun compte trouvé');
      }

      const address = accounts[0];

      // Vérifier le réseau (optionnel)
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('ChainId connecté:', chainId);

      // Succès
      setStep('success');
      setTimeout(() => {
        onConnected(address);
      }, 1500);

    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(err.message || 'Erreur lors de la connexion');
      setStep('error');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-md"
        onClick={step !== 'connecting' ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Decorative gradient bar */}
        <div className="h-2 bg-gradient-to-r from-purple-600 to-blue-500" />

        {/* Close button */}
        {step === 'error' && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Content */}
        <div className="p-8">
          {/* Connecting State */}
          {step === 'connecting' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30">
                <span className="text-4xl animate-pulse">🦊</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Connexion à MetaMask...</h3>
              <p className="text-gray-600 mb-6">
                Veuillez confirmer la connexion dans votre wallet MetaMask
              </p>
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}

          {/* Success State */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30 animate-bounce">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Connexion Réussie !</h3>
              <p className="text-gray-600">
                Votre wallet MetaMask est maintenant connecté
              </p>
            </div>
          )}

          {/* Error State */}
          {step === 'error' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Erreur de Connexion</h3>
              <p className="text-gray-600 mb-6">{error}</p>

              {/* Actions pour erreur */}
              <div className="space-y-3">
                {!window.ethereum && (
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all font-semibold"
                  >
                    Installer MetaMask
                  </a>
                )}
                <button
                  onClick={connectMetaMask}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all font-semibold"
                >
                  Réessayer
                </button>
                <button
                  onClick={onClose}
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}