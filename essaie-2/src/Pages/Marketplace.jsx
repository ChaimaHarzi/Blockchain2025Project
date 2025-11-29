import { useState } from 'react';
import { Store, Filter, SlidersHorizontal, TrendingUp, Ticket, X, Search, Calendar, DollarSign, Tag, History, ShoppingCart, XCircle, MapPin } from 'lucide-react';
import TicketCard from '../components/TicketCard';
import { LoaderModal } from '../components/loader';
import ConfirmationModal from '../components/ConfirmationModal';

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState('marche'); // marche, mes-ventes
  const [subTab, setSubTab] = useState('en-vente'); // en-vente, disponibles
  const [showFilters, setShowFilters] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [priceInput, setPriceInput] = useState('');
  const [loader, setLoader] = useState({ isOpen: false, message: '', type: 'loading' });
  const [confirmation, setConfirmation] = useState({ isOpen: false, title: '', message: '', action: null, actionData: null });
  
  // Filtres
  const [filters, setFilters] = useState({
    dateSort: 'recent', // recent, ancien
    priceSort: 'croissant', // croissant, decroissant
    typeFilter: 'tous', // tous, standard, premium
    searchQuery: ''
  });

  // Données mock
  const marketTickets = [
    {
      id: 'TKT-001',
      name: 'Billet VIP #234',
      eventName: 'Concert Coldplay 2025',
      status: 'en vente',
      price: 0.08,
      date: '2025-03-21',
      place: 'Paris - Accor Arena',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop',
      type: 'premium',
      seller: '0x1234...5678',
      owners: ['0xabcd...ef01', '0x9876...5432', '0x1234...5678']
    },
    {
      id: 'TKT-002',
      name: 'Billet Standard #445',
      eventName: 'Festival Summer Vibes',
      status: 'en vente',
      price: 0.05,
      date: '2025-07-10',
      place: 'Nice - Beach Arena',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop',
      type: 'standard',
      seller: '0x5678...9012',
      owners: ['0x5678...9012']
    },
    {
      id: 'TKT-003',
      name: 'Billet Premium #112',
      eventName: 'Salon Tech Innov',
      status: 'en vente',
      price: 0.03,
      date: '2024-12-05',
      place: 'Berlin - Tech Expo',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
      type: 'premium',
      seller: '0xdef0...1234',
      owners: ['0xaaa1...2222', '0xdef0...1234']
    }
  ];

  const myTicketsForSale = [
    {
      id: 'TKT-004',
      name: 'Mon Billet VIP #789',
      eventName: 'Match PSG vs OM',
      status: 'en vente',
      price: 0.12,
      date: '2025-04-15',
      place: 'Paris - Parc des Princes',
      image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=300&fit=crop',
      type: 'premium',
      owners: ['0x1111...2222', '0x3333...4444', 'Vous']
    }
  ];

  const myAvailableTickets = [
    {
      id: 'TKT-005',
      name: 'Mon Billet Standard #990',
      eventName: 'Concert Metallica',
      status: 'disponible',
      price: 0.06,
      date: '2025-06-20',
      place: 'Lyon - Groupama Stadium',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop',
      type: 'standard',
      owners: ['Vous']
    },
    {
      id: 'TKT-006',
      name: 'Mon Billet Premium #223',
      eventName: 'Festival Rock en Seine',
      status: 'disponible',
      price: 0.09,
      date: '2025-08-25',
      place: 'Paris - Domaine National',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop',
      type: 'premium',
      owners: ['0x7777...8888', 'Vous']
    }
  ];

  // Fonction de filtrage
  const filterTickets = (tickets) => {
    let filtered = [...tickets];

    // Filtre par recherche
    if (filters.searchQuery) {
      filtered = filtered.filter(t => 
        t.eventName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        t.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Filtre par type
    if (filters.typeFilter !== 'tous') {
      filtered = filtered.filter(t => t.type === filters.typeFilter);
    }

    // Tri par date
    if (filters.dateSort === 'recent') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Tri par prix
    if (filters.priceSort === 'croissant') {
      filtered.sort((a, b) => a.price - b.price);
    } else {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  };

  const handleBuyTicket = (ticket) => {
    setSelectedTicket(ticket);
    setConfirmation({
      isOpen: true,
      title: 'Confirmer l\'achat',
      message: `Voulez-vous acheter "${ticket.name}" pour ${ticket.price} ETH ?`,
      action: 'buy',
      actionData: ticket
    });
  };

  const handlePutOnSale = () => {
    if (!priceInput || parseFloat(priceInput) <= 0) {
      setLoader({ isOpen: true, message: 'Veuillez entrer un prix valide', type: 'error' });
      setTimeout(() => {
        setLoader({ isOpen: false, message: '', type: 'loading' });
      }, 2000);
      return;
    }

    setShowPriceModal(false);
    setConfirmation({
      isOpen: true,
      title: 'Mettre en vente',
      message: `Confirmer la mise en vente de "${selectedTicket.name}" pour ${priceInput} ETH ?`,
      action: 'putOnSale',
      actionData: { ticket: selectedTicket, price: priceInput }
    });
  };

  const handleCancelSale = (ticket) => {
    setSelectedTicket(ticket);
    setConfirmation({
      isOpen: true,
      title: 'Annuler la vente',
      message: `Êtes-vous sûr de vouloir annuler la vente de "${ticket.name}" ?`,
      action: 'cancelSale',
      actionData: ticket,
      type: 'danger'
    });
  };

  const executeAction = async () => {
    setConfirmation({ ...confirmation, isOpen: false });

    switch (confirmation.action) {
      case 'buy':
        await executeBuy(confirmation.actionData);
        break;
      case 'putOnSale':
        await executePutOnSale(confirmation.actionData.ticket, confirmation.actionData.price);
        break;
      case 'cancelSale':
        await executeCancelSale(confirmation.actionData);
        break;
      default:
        break;
    }
  };

  const executeBuy = async (ticket) => {
    setLoader({ isOpen: true, message: 'Traitement de votre achat...', type: 'loading' });
    
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLoader({ isOpen: true, message: `Billet "${ticket.name}" acheté avec succès ! 🎉`, type: 'success' });
      
      setTimeout(() => {
        setLoader({ isOpen: false, message: '', type: 'loading' });
      }, 2000);
    } catch (error) {
      setLoader({ isOpen: true, message: 'Erreur lors de l\'achat. Veuillez réessayer.', type: 'error' });
      setTimeout(() => {
        setLoader({ isOpen: false, message: '', type: 'loading' });
      }, 2000);
    }
  };

  const executePutOnSale = async (ticket, price) => {
    setLoader({ isOpen: true, message: 'Mise en vente du billet...', type: 'loading' });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLoader({ isOpen: true, message: `"${ticket.name}" mis en vente pour ${price} ETH !`, type: 'success' });
      setPriceInput('');
      
      setTimeout(() => {
        setLoader({ isOpen: false, message: '', type: 'loading' });
      }, 2000);
    } catch (error) {
      setLoader({ isOpen: true, message: 'Erreur lors de la mise en vente.', type: 'error' });
      setTimeout(() => {
        setLoader({ isOpen: false, message: '', type: 'loading' });
      }, 2000);
    }
  };

  const executeCancelSale = async (ticket) => {
    setLoader({ isOpen: true, message: 'Annulation de la vente...', type: 'loading' });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLoader({ isOpen: true, message: `La vente de "${ticket.name}" a été annulée`, type: 'success' });
      
      setTimeout(() => {
        setLoader({ isOpen: false, message: '', type: 'loading' });
      }, 2000);
    } catch (error) {
      setLoader({ isOpen: true, message: 'Erreur lors de l\'annulation.', type: 'error' });
      setTimeout(() => {
        setLoader({ isOpen: false, message: '', type: 'loading' });
      }, 2000);
    }
  };

  const openHistoryModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowHistoryModal(true);
  };

  const openPriceModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowPriceModal(true);
    setPriceInput('');
  };

  const getCurrentTickets = () => {
    if (activeTab === 'marche') {
      return filterTickets(marketTickets);
    } else {
      if (subTab === 'en-vente') {
        return filterTickets(myTicketsForSale);
      } else {
        return filterTickets(myAvailableTickets);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
              <p className="text-gray-600">Achetez et vendez des billets NFT</p>
            </div>
          </div>
        </div>

        {/* Tabs Principal */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('marche')}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'marche'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Store className="w-5 h-5" />
              <span>Marché</span>
            </button>
            <button
              onClick={() => setActiveTab('mes-ventes')}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'mes-ventes'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Ticket className="w-5 h-5" />
              <span>Mes Ventes</span>
            </button>
          </div>

          {/* Sub-tabs pour Mes Ventes */}
          {activeTab === 'mes-ventes' && (
            <div className="flex bg-gray-50 border-b border-gray-200">
              <button
                onClick={() => setSubTab('en-vente')}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                  subTab === 'en-vente'
                    ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                En vente ({myTicketsForSale.length})
              </button>
              <button
                onClick={() => setSubTab('disponibles')}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                  subTab === 'disponibles'
                    ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Disponibles ({myAvailableTickets.length})
              </button>
            </div>
          )}
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un événement ou billet..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Bouton Filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                showFilters
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filtres</span>
            </button>
          </div>

          {/* Panneau de filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtre par date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>Trier par date</span>
                </label>
                <select
                  value={filters.dateSort}
                  onChange={(e) => setFilters({ ...filters, dateSort: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="recent">Plus récent</option>
                  <option value="ancien">Plus ancien</option>
                </select>
              </div>

              {/* Filtre par prix */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  <span>Trier par prix</span>
                </label>
                <select
                  value={filters.priceSort}
                  onChange={(e) => setFilters({ ...filters, priceSort: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="croissant">Prix croissant</option>
                  <option value="decroissant">Prix décroissant</option>
                </select>
              </div>

              {/* Filtre par type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-purple-600" />
                  <span>Type de billet</span>
                </label>
                <select
                  value={filters.typeFilter}
                  onChange={(e) => setFilters({ ...filters, typeFilter: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="tous">Tous les types</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
          )}
        </div>



        {/* Grille de billets */}
        {getCurrentTickets().length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentTickets().map((ticket) => {
              let buttonConfig = [];

              // Determine buttons based on context
              if (activeTab === 'marche') {
                buttonConfig = [
                  {
                    label: 'Acheter',
                    icon: ShoppingCart,
                    onClick: () => handleBuyTicket(ticket),
                    variant: 'success'
                  },
                  {
                    label: 'Historique',
                    icon: History,
                    onClick: () => openHistoryModal(ticket),
                    variant: 'secondary'
                  }
                ];
              } else if (activeTab === 'mes-ventes' && subTab === 'en-vente') {
                buttonConfig = [
                  {
                    label: 'Annuler',
                    icon: XCircle,
                    onClick: () => handleCancelSale(ticket),
                    variant: 'danger'
                  },
                  {
                    label: 'Historique',
                    icon: History,
                    onClick: () => openHistoryModal(ticket),
                    variant: 'secondary'
                  }
                ];
              } else if (activeTab === 'mes-ventes' && subTab === 'disponibles') {
                buttonConfig = [
                  {
                    label: 'Mettre en vente',
                    icon: TrendingUp,
                    onClick: () => openPriceModal(ticket),
                    variant: 'primary'
                  },
                  {
                    label: 'Historique',
                    icon: History,
                    onClick: () => openHistoryModal(ticket),
                    variant: 'secondary'
                  }
                ];
              }

              return (
                <TicketCard
                  key={ticket.id}
                  name={ticket.name}
                  eventName={ticket.eventName}
                  status={ticket.status}
                  price={ticket.price}
                  date={ticket.date}
                  place={ticket.place}
                  image={ticket.image}
                  type={ticket.type}
                  buttons={buttonConfig}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-md border border-gray-100">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun billet trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos filtres de recherche</p>
          </div>
        )}
      </div>

      {/* Modal Prix */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Mettre en vente</h3>
                <button
                  onClick={() => setShowPriceModal(false)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <p className="text-gray-600 mt-1">Définissez le prix de vente</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="font-semibold text-gray-900 mb-1">{selectedTicket?.name}</div>
                <div className="text-sm text-gray-600">{selectedTicket?.eventName}</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Prix de vente (ETH)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.00"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-semibold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    ETH
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Prix d'achat initial: {selectedTicket?.price} ETH
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Royalties:</span> 10% du prix seront versés à l'organisateur
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowPriceModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handlePutOnSale}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Historique */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <History className="w-6 h-6 text-purple-600" />
                  <span>Historique</span>
                </h3>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <p className="text-gray-600 mt-1">Propriétaires successifs</p>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border-2 border-purple-200 mb-6">
                <div className="font-semibold text-gray-900 mb-1">{selectedTicket?.name}</div>
                <div className="text-sm text-gray-600">{selectedTicket?.eventName}</div>
              </div>

              <div className="space-y-3">
                {selectedTicket?.owners?.map((owner, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-mono text-sm font-semibold text-gray-900">
                        {owner}
                      </div>
                      <div className="text-xs text-gray-500">
                        {index === selectedTicket.owners.length - 1 ? 'Propriétaire actuel' : `Propriétaire #${index + 1}`}
                      </div>
                    </div>
                    {index === selectedTicket.owners.length - 1 && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        confirmText="Confirmer"
        cancelText="Annuler"
        type={confirmation.type === 'danger' ? 'danger' : 'info'}
        onConfirm={executeAction}
        onCancel={() => setConfirmation({ ...confirmation, isOpen: false })}
      />

      {/* Loader Modal */}
      <LoaderModal
        isOpen={loader.isOpen}
        message={loader.message}
        type={loader.type}
        onClose={() => setLoader({ ...loader, isOpen: false })}
      />
    </div>
  );
}