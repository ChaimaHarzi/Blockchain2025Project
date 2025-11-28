import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConnectWallet from '../components/ConnectWallet';
import { Ticket, Sparkles, Shield, TrendingUp, Users } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const handleWalletConnected = (address) => {
    setIsConnected(true);
    setWalletAddress(address);
    setShowWalletModal(false);
  };

  const goToEvents = () => {
    navigate('/events');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                NFT Ticketing
              </span>
            </div>

            {/* Bouton Connexion */}
            {!isConnected ? (
              <button
                onClick={() => setShowWalletModal(true)}
                className="flex items-center space-x-2 bg-linear-to-r from-purple-600 to-blue-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 font-semibold"
              >
                <span>Connecter Wallet</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                <div className="w-8 h-8 bg-linear-to-br from-purple-600 to-blue-500 rounded-full" />
                <span className="font-mono text-sm text-gray-700">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>Propulsé par la Blockchain Ethereum</span>
          </div>

          {/* Titre Principal */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Bienvenue sur la
            <span className="block bg-linear-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mt-2">
              Billetterie NFT
            </span>
          </h1>

          {/* Sous-titre */}
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12">
            Achetez, vendez et échangez vos billets en toute sécurité sur la blockchain
          </p>

          {/* CTA Button */}
          {!isConnected ? (
            <button
              onClick={() => setShowWalletModal(true)}
              className="group relative inline-flex items-center space-x-3 bg-linear-to-r from-purple-600 to-blue-500 text-white px-8 py-4 rounded-2xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 font-bold text-lg"
            >
              <span>Connecter mon Wallet</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <div className="inline-flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-6 py-3 rounded-xl border-2 border-green-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">Wallet Connecté</span>
              </div>
              <button 
                onClick={goToEvents}
                className="text-purple-600 hover:text-purple-700 font-semibold flex items-center space-x-1 group"
              >
                <span>Découvrir les événements</span>
                <svg 
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {/* Feature 1 */}
          <div className="group bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300">
            <div className="w-14 h-14 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">100% Sécurisé</h3>
            <p className="text-gray-600 leading-relaxed">
              Vos billets sont stockés sur la blockchain Ethereum. Infalsifiables et traçables.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
            <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Revente Sécurisée</h3>
            <p className="text-gray-600 leading-relaxed">
              Revendez vos billets en toute légalité avec des prix plafonnés et des royalties automatiques.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-xl hover:border-pink-200 transition-all duration-300">
            <div className="w-14 h-14 bg-linear-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/30">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Échange Direct</h3>
            <p className="text-gray-600 leading-relaxed">
              Échangez vos billets avec d'autres utilisateurs sans intermédiaire.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
            <p className="text-xl text-gray-600">Trois étapes simples pour commencer</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Connectez votre Wallet</h3>
                <p className="text-gray-600">
                  Utilisez MetaMask ou tout autre wallet compatible Ethereum pour vous connecter.
                </p>
              </div>
              {/* Arrow */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-purple-300">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Achetez votre Billet</h3>
                <p className="text-gray-600">
                  Parcourez les événements et achetez vos billets NFT en quelques clics.
                </p>
              </div>
              {/* Arrow */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-blue-300">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accédez à l'Événement</h3>
              <p className="text-gray-600">
                Présentez votre QR code ou wallet à l'entrée. Simple et rapide !
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Ticket className="w-6 h-6 text-purple-400" />
            <span className="text-xl font-bold">NFT Ticketing</span>
          </div>
          <p className="text-gray-400 mb-6">La billetterie du futur, aujourd'hui.</p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">À propos</a>
            <a href="#" className="hover:text-white transition-colors">Aide</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">CGU</a>
          </div>
          <div className="mt-8 text-sm text-gray-500">
            © 2025 NFT Ticketing. Tous droits réservés.
          </div>
        </div>
      </footer>

      {/* Modal Connexion Wallet */}
      {showWalletModal && (
        <ConnectWallet
          onClose={() => setShowWalletModal(false)}
          onConnected={handleWalletConnected}
        />
      )}
    </div>
  );
}