import React, { useState, useEffect } from 'react';
import { User, Wallet, LogOut, ChevronDown, Calendar, Ticket, ArrowRightLeft, Sparkles, Shield, TrendingUp, Users , LogIn} from 'lucide-react';
import UserDashboard from './pages/UserDashboard';
import TicketMarketplace from './pages/TicketMarketplace';
import EventManagement from './pages/EventManagement';
import blockchainService from './services/blockchainService';
import './index.css';
import MyEvents from './pages/MyEvents';

function App() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const connectWallet = async () => {
    setLoading(true);
    try {
      const account = await blockchainService.connectWallet();
      setCurrentAccount(account);
    } catch (error) {
      console.error('Erreur connexion:', error);
      alert('Erreur: ' + error.message);
    }
    setLoading(false);
  };

  const switchAccount = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });
    } catch (error) {
      console.error('Erreur changement de compte:', error);
    }
  };

  const handleSignOut = () => {
    setCurrentAccount('');
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          blockchainService.connectWallet(); 
        } else {
          setCurrentAccount('');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navigation réduite */}
      <nav className="bg-white shadow-sm border-b border-gray-100 px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo plus compact */}
          <div className='flex items-center space-x-2'>
            <div className='w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center shadow-md shadow-purple-500/30'>
              <Ticket className='w-4 h-4 text-white' />
            </div>
            <span className='text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent'>
              NFT Ticketing
            </span>
          </div>

          {/* Menu navigation compact */}
          {currentAccount && (
            <div className='flex items-center space-x-1'>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-all text-sm ${
                  activeTab === 'dashboard'
                    ? "text-purple-600 bg-purple-100"
                    : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                }`}>
                <User className='w-4 h-4' />
                <span className='font-medium hidden sm:inline'>Mes billets</span>
              </button>

              <button
                onClick={() => setActiveTab('myevents')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-all text-sm ${
                  activeTab === 'myevents'
                    ? "text-purple-600 bg-purple-100"
                    : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                }`}>
                <Calendar className='w-4 h-4' />
                <span className='font-medium hidden sm:inline'>Mes Evénements</span>
              </button>

              <button
                onClick={() => setActiveTab('marketplace')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-all text-sm ${
                  activeTab === 'marketplace'
                    ? "text-purple-600 bg-purple-100"
                    : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                }`}>
                <ArrowRightLeft className='w-4 h-4' />
                <span className='font-medium hidden sm:inline'>Marché</span>
              </button>

              <button
                onClick={() => setActiveTab('events')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-all text-sm ${
                  activeTab === 'events'
                    ? "text-purple-600 bg-purple-100"
                    : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                }`}>
                <Calendar className='w-4 h-4' />
                <span className='font-medium hidden sm:inline'>Evénements</span>
              </button>

              {/* Profile Dropdown compact */}
              <div className='relative ml-1'>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className='flex items-center space-x-1 px-2 py-1.5 text-gray-700 hover:bg-purple-50 rounded-md transition-all focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm'>
                  <div className='w-7 h-7 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center shadow-md'>
                    <User className='w-3.5 h-3.5 text-white' />
                  </div>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div className='absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50'>
                    <div className="px-3 py-1.5 text-xs text-gray-500 border-b border-gray-100">
                      {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
                    </div>
                    <button
                      onClick={() => setIsDropdownOpen(false)}
                      className='w-full flex items-center space-x-2 px-3 py-1.5 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors text-sm'>
                    </button>
                    <button
                      onClick={switchAccount}
                      className='w-full flex items-center space-x-2 px-3 py-1.5 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-sm'>
                      <LogOut className='w-3.5 h-3.5' />
                      <span>Changer compte</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Contenu principal */}
      <main>
        {!currentAccount ? (
          <>
            {/* Section Hero plus compacte */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="text-center mb-12">
                <div className="inline-flex items-center space-x-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium mb-4 animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  <span>Blockchain Ethereum</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                  Bienvenue sur
                  <span className="block bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mt-1">
                    Billetterie NFT
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                  Achetez, vendez et échangez vos billets en toute sécurité
                </p>

                <button 
                  className="btn btn-primary btn-md"
                  onClick={connectWallet}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <> <LogIn className="w-3 h-3" />Connecter MetaMask </>
                  
                  )}
                </button>
              </div>

              {/* Features Grid plus compact */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                <div className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-md shadow-purple-500/30">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">100% Sécurisé</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Billets stockés sur blockchain Ethereum. Infalsifiables et traçables.
                  </p>
                </div>

                <div className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-md shadow-blue-500/30">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Revente Sécurisée</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Revente légale avec prix plafonnés et royalties automatiques.
                  </p>
                </div>

                <div className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-pink-200 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-md shadow-pink-500/30">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Échange Direct</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Échangez vos billets sans intermédiaire.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {activeTab === 'dashboard' && <UserDashboard />}
            {activeTab === 'myevents' && <MyEvents />}
            {activeTab === 'marketplace' && <TicketMarketplace />}
            {activeTab === 'events' && <EventManagement />}
          </>
        )}
      </main>

      {/* Footer plus compact */}
      <footer className="footer footer-center p-3 bg-base-300 text-base-content mt-8 text-sm">
        <aside>
          <p>TicketNFT Platform - Billetterie décentralisée Ethereum</p>
        </aside>
      </footer>
    </div>
  );
}

export default App;