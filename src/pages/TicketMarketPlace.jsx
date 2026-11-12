import React, { useState, useEffect } from 'react';
import { Store, Filter, SlidersHorizontal, TrendingUp, Ticket, X, Search, Calendar, DollarSign, Tag, History, ShoppingCart, XCircle, MapPin, AlertTriangle } from 'lucide-react';
import blockchainService from '../services/blockchainService';
import TicketCard from '../components/TicketCard';
import { LoaderModal } from '../components/loader';
import ConfirmationModal from '../components/ConfirmationModal';

const TicketMarketplace = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userTickets, setUserTickets] = useState([]);
  const [showSellForm, setShowSellForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [sellPrice, setSellPrice] = useState('0.01');
  const [activeTab, setActiveTab] = useState('marketplace');
  const [selectedListing, setSelectedListing] = useState(null);
  const [ticketHistory, setTicketHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // États pour le nouveau design
  const [showFilters, setShowFilters] = useState(false);
  const [loader, setLoader] = useState({ isOpen: false, message: '', type: 'loading' });
  const [confirmation, setConfirmation] = useState({ isOpen: false, title: '', message: '', action: null, actionData: null });

  const [filters, setFilters] = useState({
    ticketType: 'all',
    priceRange: 'all',
    status: 'all',
    dateRange: 'all',
    searchQuery: '',
    dateSort: 'recent',
    priceSort: 'croissant',
    typeFilter: 'tous'
  });

  // ✅ AJOUTER cette fonction AVANT loadAllData()
const getCategoryType = (eventDetails, ticketType) => {
  if (!eventDetails || !eventDetails.categories) {
    return "standard"; // Fallback
  }
  
  const category = eventDetails.categories[ticketType];
  if (!category) return "standard";
  
  const categoryName = category.name.toLowerCase();
  
  // ✅ Détection VIP basée sur le nom (identique à UserDashboard)
  if (categoryName.includes('vip')) {
    return 'vip';
  }
  
  return 'standard'; // Tout le reste est Standard
};

// ✅ CHARGEMENT SYNCHRONISÉ DES DONNÉES - CORRIGÉ
const loadAllData = async () => {
  setLoading(true);
  try {
    console.log("🔄 Chargement synchronisé des données...");
    
    const [allListings, userTicketsData] = await Promise.all([
      blockchainService.getAllListings(),
      blockchainService.getUserTickets()
    ]);

    console.log("📊 Listings chargés:", allListings.length);
    console.log("🎫 Tickets utilisateur:", userTicketsData.length);

    // Traiter les listings avec images - AVEC DÉTECTION PAR NOM DE CATÉGORIE
    const processedListings = await Promise.all(
      allListings.map(async (listing) => {
        try {
          const eventDetails = await blockchainService.getEventDetails(listing.eventId);
          
          return {
            ...listing,
            ticketType: getCategoryType(eventDetails, listing.ticketType), // ✅ Utilise la nouvelle fonction
            priceEth: parseFloat(blockchainService.formatEther(listing.priceWei)),
            eventImage: blockchainService.getEventImageUrl(eventDetails),
            eventTitle: eventDetails?.title || `Événement #${listing.eventId}`,
            eventLocation: eventDetails?.location || 'Lieu inconnu',
            eventDate: eventDetails?.date || new Date(),
            name: `Billet #${listing.tokenId}`,
            place: eventDetails?.location || 'Lieu inconnu',
            status: listing.used ? 'utilisé' : 'en vente'
          };
        } catch (error) {
          console.error(`Erreur traitement listing ${listing.tokenId}:`, error);
          return {
            ...listing,
            ticketType: listing.ticketType === 0 ? 'standard' : 'vip', // Fallback
            priceEth: parseFloat(blockchainService.formatEther(listing.priceWei)),
            eventImage: `https://picsum.photos/400/200?random=${listing.eventId}`,
            eventTitle: `Événement #${listing.eventId}`,
            eventLocation: 'Lieu inconnu',
            eventDate: new Date(),
            name: `Billet #${listing.tokenId}`,
            place: 'Lieu inconnu',
            status: listing.used ? 'utilisé' : 'en vente'
          };
        }
      })
    );

    setListings(processedListings);

    // ✅ FILTRER : seulement les tickets NON en vente - CORRIGÉ
    const myAddress = await blockchainService.getCurrentAddress();
    const listedTokenIds = new Set(
      allListings
        .filter(listing => listing.seller.toLowerCase() === myAddress.toLowerCase())
        .map(listing => listing.tokenId)
    );

    const availableTickets = await Promise.all(
      userTicketsData
        .filter(ticket => 
          !ticket.used && 
          new Date(ticket.eventDate) > new Date() &&
          !listedTokenIds.has(ticket.tokenId)
        )
        .map(async (ticket) => {
          try {
            const eventDetails = await blockchainService.getEventDetails(ticket.eventId);
            
            return {
              ...ticket,
              name: `Billet #${ticket.tokenId}`,
              eventName: ticket.eventTitle || `Événement #${ticket.eventId}`,
              eventImage: ticket.eventImage || `https://picsum.photos/400/200?random=${ticket.eventId}`,
              place: ticket.eventLocation || 'Lieu inconnu',
              status: 'disponible',
              type: getCategoryType(eventDetails, ticket.ticketType) // ✅ Utilise la nouvelle fonction
            };
          } catch (error) {
            console.error(`Erreur traitement ticket ${ticket.tokenId}:`, error);
            return {
              ...ticket,
              name: `Billet #${ticket.tokenId}`,
              eventName: ticket.eventTitle || `Événement #${ticket.eventId}`,
              eventImage: ticket.eventImage || `https://picsum.photos/400/200?random=${ticket.eventId}`,
              place: ticket.eventLocation || 'Lieu inconnu',
              status: 'disponible',
              type: ticket.ticketType === 0 ? 'standard' : 'vip' // Fallback
            };
          }
        })
    );

    console.log("✅ Tickets disponibles pour vente:", availableTickets.length);
    setUserTickets(availableTickets);

  } catch (error) {
    console.error('❌ Erreur chargement données:', error);
    setLoader({ isOpen: true, message: 'Erreur lors du chargement des données', type: 'error' });
    setTimeout(() => setLoader({ isOpen: false, message: '', type: 'loading' }), 2000);
  }
  setLoading(false);
};

  // ✅ FONCTIONS DE FILTRAGE CORRIGÉES
  const getMyListings = () => {
    const myAddress = blockchainService.currentAddress;
    if (!myAddress) return [];
    
    const myListings = listings.filter(listing => 
      listing.seller.toLowerCase() === myAddress.toLowerCase()
    );
    
    console.log("📋 MES TICKETS EN VENTE:", myListings);
    
    return myListings;
  };

  const getMarketListings = () => {
    const myAddress = blockchainService.currentAddress;
    if (!myAddress) return [];
    
    const otherListings = listings.filter(listing => 
      listing.seller.toLowerCase() !== myAddress.toLowerCase()
    );

    const filteredListings = otherListings.filter(listing => {
      if (filters.ticketType !== 'all' && listing.ticketType !== filters.ticketType) return false;
      if (filters.status !== 'all') {
        if (filters.status === 'valid' && listing.used) return false;
        if (filters.status === 'used' && !listing.used) return false;
      }
      if (filters.priceRange !== 'all') {
        switch (filters.priceRange) {
          case 'cheap': return listing.priceEth < 0.05;
          case 'medium': return listing.priceEth >= 0.05 && listing.priceEth <= 0.2;
          case 'expensive': return listing.priceEth > 0.2;
        }
      }
      if (filters.dateRange !== 'all') {
        const eventDate = new Date(listing.eventDate);
        const today = new Date();
        if (filters.dateRange === 'future' && eventDate <= today) return false;
        if (filters.dateRange === 'past' && eventDate > today) return false;
      }
      return true;
    });

    // Appliquer les filtres de recherche et tri
    let finalListings = [...filteredListings];

    // Filtre par recherche
    if (filters.searchQuery) {
      finalListings = finalListings.filter(t => 
        t.eventTitle?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        t.name?.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Filtre par type - ADAPTER POUR 'vip'
    if (filters.typeFilter !== 'tous') {
      finalListings = finalListings.filter(t => {
        if (filters.typeFilter === 'standard') return t.ticketType === 'standard';
        if (filters.typeFilter === 'premium') return t.ticketType === 'vip'; // ✅ 'premium' dans filtre = 'vip' en réalité
        return true;
      });
    }

    // Tri par date
    if (filters.dateSort === 'recent') {
      finalListings.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
    } else {
      finalListings.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
    }

    // Tri par prix
    if (filters.priceSort === 'croissant') {
      finalListings.sort((a, b) => a.priceEth - b.priceEth);
    } else {
      finalListings.sort((a, b) => b.priceEth - a.priceEth);
    }

    return finalListings;
  };

  // ✅ METTRE EN VENTE - OPTIMISÉ
  const handleSellTicket = async () => {
    if (!selectedTicket || !sellPrice) {
      setLoader({ isOpen: true, message: 'Veuillez sélectionner un ticket et un prix', type: 'error' });
      setTimeout(() => setLoader({ isOpen: false, message: '', type: 'loading' }), 2000);
      return;
    }

    try {
      setLoading(true);
      setLoader({ isOpen: true, message: 'Mise en vente du billet...', type: 'loading' });
      
      const ticketStillAvailable = userTickets.some(t => t.tokenId === selectedTicket.tokenId);
      if (!ticketStillAvailable) {
        setLoader({ isOpen: true, message: 'Ce ticket n\'est plus disponible pour la vente', type: 'error' });
        setTimeout(() => setLoader({ isOpen: false, message: '', type: 'loading' }), 2000);
        await loadAllData();
        return;
      }

      const isAlreadyListed = await blockchainService.isTicketListed(selectedTicket.tokenId);
      if (isAlreadyListed) {
        setLoader({ isOpen: true, message: 'Ce ticket est déjà en vente !', type: 'error' });
        setTimeout(() => setLoader({ isOpen: false, message: '', type: 'loading' }), 2000);
        await loadAllData();
        return;
      }

      const priceWei = blockchainService.parseEther(sellPrice);
      
      await blockchainService.listToken(selectedTicket.tokenId, priceWei);
      
      setLoader({ isOpen: true, message: `Ticket #${selectedTicket.tokenId} mis en vente pour ${sellPrice} ETH !`, type: 'success' });
      
      const currentAddress = await blockchainService.getCurrentAddress();
      
      setListings(prevListings => [...prevListings, {
        tokenId: selectedTicket.tokenId,
        seller: currentAddress,
        priceWei: priceWei,
        priceEth: parseFloat(sellPrice),
        ...selectedTicket
      }]);
      
      setUserTickets(prevTickets => prevTickets.filter(ticket => ticket.tokenId !== selectedTicket.tokenId));
      
      setShowSellForm(false);
      setSelectedTicket(null);
      setSellPrice('0.01');
      
      setTimeout(() => setLoader({ isOpen: false, message: '', type: 'loading' }), 2000);
      
    } catch (error) {
      console.error('❌ Erreur mise en vente:', error);
      setLoader({ isOpen: true, message: `Erreur: ${error.message}`, type: 'error' });
      setTimeout(() => setLoader({ isOpen: false, message: '', type: 'loading' }), 2000);
      await loadAllData();
    } finally {
      setLoading(false);
    }
  };

  // ✅ ANNULER VENTE - OPTIMISÉ
  const handleCancelListing = async (tokenId) => {
    setSelectedTicket(listings.find(l => l.tokenId === tokenId));
    setConfirmation({
      isOpen: true,
      title: 'Annuler la vente',
      message: `Êtes-vous sûr de vouloir annuler la vente de ce ticket ?`,
      action: 'cancelSale',
      actionData: tokenId,
      type: 'danger'
    });
  };

  const executeCancelSale = async (tokenId) => {
    try {
      setLoading(true);
      setLoader({ isOpen: true, message: 'Annulation de la vente...', type: 'loading' });
      
      await blockchainService.cancelListing(tokenId);
      
      setLoader({ isOpen: true, message: 'Vente annulée !', type: 'success' });
      
      const canceledListing = listings.find(l => l.tokenId === tokenId);
      setListings(prevListings => prevListings.filter(listing => listing.tokenId !== tokenId));
      
      if (canceledListing) {
        setUserTickets(prevTickets => [...prevTickets, {
          ...canceledListing,
          status: 'disponible'
        }]);
      }
      
      setTimeout(() => setLoader({ isOpen: false, message: '', type: 'loading' }), 2000);
      
    } catch (error) {
      console.error('❌ Erreur annulation:', error);
      setLoader({ isOpen: true, message: `Erreur: ${error.message}`, type: 'error' });
      setTimeout(() => setLoader({ isOpen: false, message: '', type: 'loading' }), 2000);
      await loadAllData();
    } finally {
      setLoading(false);
    }
  };

  // ✅ ACHETER TICKET - OPTIMISÉ
  const handleBuyTicket = async (tokenId, priceWei) => {
    const listing = listings.find(l => l.tokenId === tokenId);
    setSelectedTicket(listing);
    setConfirmation({
      isOpen: true,
      title: 'Confirmer l\'achat',
      message: `Voulez-vous acheter "${listing?.name}" pour ${listing?.priceEth} ETH ?`,
      action: 'buy',
      actionData: { tokenId, priceWei }
    });
  };

  const executeBuy = async (tokenId, priceWei) => {
    try {
      setLoading(true);
      setLoader({ isOpen: true, message: 'Traitement de votre achat...', type: 'loading' });

      const listing = await blockchainService.getListing(tokenId);
      if (!listing.exists) {
        setLoader({ isOpen: true, message: 'Ce ticket n\'est plus en vente !', type: 'error' });
        setTimeout(() => setLoader({ isOpen: false, message: '', type: 'loading' }), 2000);
        await loadAllData();
        return;
      }

      await blockchainService.buyToken(tokenId, priceWei);
      
      setLoader({ isOpen: true, message: `Ticket #${tokenId} acheté avec succès ! 🎉`, type: 'success' });
      
      setListings(prevListings => prevListings.filter(listing => listing.tokenId !== tokenId));
      
      setTimeout(() => setLoader({ isOpen: false, message: '', type: 'loading' }), 2000);
      
    } catch (error) {
      console.error('❌ Erreur achat:', error);
      setLoader({ isOpen: true, message: `Erreur lors de l'achat: ${error.message}`, type: 'error' });
      setTimeout(() => setLoader({ isOpen: false, message: '', type: 'loading' }), 2000);
      await loadAllData();
    } finally {
      setLoading(false);
    }
  };

  // ✅ CHARGER L'HISTORIQUE - CORRIGÉ
  const loadTicketHistory = async (tokenId) => {
    try {
      setLoading(true);
      const history = await blockchainService.getTicketHistory(tokenId);
      setTicketHistory(history);
      setSelectedListing(listings.find(l => l.tokenId === tokenId));
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      setLoader({ 
        isOpen: true, 
        message: `Erreur lors du chargement de l'historique: ${error.message}`, 
        type: 'error' 
      });
      setTimeout(() => setLoader({ isOpen: false, message: '', type: 'loading' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  // ✅ EXÉCUTION DES ACTIONS DE CONFIRMATION
  const executeAction = async () => {
    setConfirmation({ ...confirmation, isOpen: false });

    switch (confirmation.action) {
      case 'buy':
        await executeBuy(confirmation.actionData.tokenId, confirmation.actionData.priceWei);
        break;
      case 'cancelSale':
        await executeCancelSale(confirmation.actionData);
        break;
      default:
        break;
    }
  };

  // ✅ CHARGEMENT INITIAL
  useEffect(() => {
    loadAllData();
  }, []);

  // 🔥 CORRECTION : Calculer les listings APRÈS le rendu initial
  const myListings = getMyListings();
  const marketListings = getMarketListings();

 // Préparer les données pour TicketCard - CORRIGÉ
const prepareTicketData = (tickets, context) => {
  return tickets.map(ticket => ({
    id: ticket.tokenId,
    name: ticket.name || `Billet #${ticket.tokenId}`,
    eventName: ticket.eventTitle || ticket.eventName,
    status: ticket.status || (ticket.used ? 'utilisé' : 'en vente'),
    price: ticket.priceEth,
    date: ticket.eventDate,
    place: ticket.eventLocation || ticket.place,
    image: ticket.eventImage,
    type: ticket.type || ticket.ticketType, // ✅ Prend en compte les deux propriétés
    seller: ticket.seller,
    used: ticket.used,
    tokenId: ticket.tokenId,
    priceWei: ticket.priceWei,
    buttons: getButtonConfig(ticket, context)
  }));
};

  const getButtonConfig = (ticket, context) => {
    if (context === 'marketplace') {
      return [
        {
          label: 'Acheter',
          icon: ShoppingCart,
          onClick: () => handleBuyTicket(ticket.tokenId, ticket.priceWei),
          variant: 'success'
        },
        {
          label: 'Historique',
          icon: History,
          onClick: () => loadTicketHistory(ticket.tokenId),
          variant: 'secondary'
        }
      ];
    } else if (context === 'myListings') {
      return [
        {
          label: 'Annuler',
          icon: XCircle,
          onClick: () => handleCancelListing(ticket.tokenId),
          variant: 'danger'
        },
        {
          label: 'Historique',
          icon: History,
          onClick: () => loadTicketHistory(ticket.tokenId),
          variant: 'secondary'
        }
      ];
    } else if (context === 'availableTickets') {
      return [
        {
          label: 'Mettre en vente',
          icon: TrendingUp,
          onClick: () => {
            setSelectedTicket(ticket);
            setShowSellForm(true);
          },
          variant: 'primary'
        },
        {
          label: 'Historique',
          icon: History,
          onClick: () => loadTicketHistory(ticket.tokenId),
          variant: 'secondary'
        }
      ];
    }
    return [];
  };

  const marketTicketsData = prepareTicketData(marketListings, 'marketplace');
  const myListingsData = prepareTicketData(myListings, 'myListings');
  const availableTicketsData = prepareTicketData(userTickets, 'availableTickets');

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
              <h1 className="text-3xl font-bold text-gray-900">Marketplace Secondaire</h1>
              <p className="text-gray-600">Achetez et vendez des billets NFT</p>
            </div>
          </div>

          {/* Indicateur de statut */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-gray-100 mt-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <span><strong>{marketListings.length}</strong> tickets disponibles</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span><strong>{myListings.length}</strong> mes ventes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                <span><strong>{userTickets.length}</strong> tickets à vendre</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Principal */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'marketplace'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Store className="w-5 h-5" />
              <span>Marché ({marketListings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('myListings')}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'myListings'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Ticket className="w-5 h-5" />
              <span>Mes Ventes ({myListings.length})</span>
            </button>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        {activeTab === 'marketplace' && (
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

                {/* Filtre par type - ADAPTER POUR 'vip' */}
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
                    <option value="premium">VIP</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contenu des onglets */}
        {activeTab === 'marketplace' ? (
          /* Onglet Marché */
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <span className="ml-4 text-gray-600">Chargement...</span>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  🎟️ Tickets disponibles sur le marché ({marketTicketsData.length})
                </h3>
                
                {marketTicketsData.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-md border border-gray-100">
                    <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun billet trouvé</h3>
                    <p className="text-gray-600">Essayez de modifier vos filtres de recherche</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {marketTicketsData.map(ticket => (
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
                        buttons={ticket.buttons}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Onglet Mes Ventes */
          <div className="space-y-6">
            {/* Section: Mes Tickets en Vente */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  🏷️ Mes Tickets en Vente ({myListingsData.length})
                </h3>
                <div className="text-sm text-gray-500">
                   Ces tickets sont actuellement en vente sur le marketplace
                </div>
              </div>
              
              {myListingsData.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-gray-500">Aucun ticket en vente</p>
                  <p className="text-sm text-gray-400 mt-2">Mettez vos tickets en vente dans la section ci-dessous</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myListingsData.map(ticket => (
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
                      buttons={ticket.buttons}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Section: Mes Tickets Disponibles pour Vente */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  🎟️ Mes Tickets Disponibles pour Vente ({availableTicketsData.length})
                </h3>
               
              </div>

              {availableTicketsData.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {myListingsData.length > 0 
                    ? "🎉 Tous vos tickets valides sont déjà en vente !" 
                    : "📭 Aucun ticket disponible à la vente"
                  }
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableTicketsData.map(ticket => (
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
                      buttons={ticket.buttons}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Vente */}
        {showSellForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">
                    💰 Mettre en vente {selectedTicket ? `"${selectedTicket.name}"` : ''}
                  </h3>
                  <button
                    onClick={() => {
                      setShowSellForm(false);
                      setSelectedTicket(null);
                    }}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <p className="text-gray-600 mt-1">Définissez le prix de vente</p>
              </div>

              <div className="p-6 space-y-4">
                {selectedTicket && (
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border-2 border-purple-200">
                    <div className="font-semibold text-gray-900 mb-1">{selectedTicket.name}</div>
                    <div className="text-sm text-gray-600">{selectedTicket.eventTitle || selectedTicket.eventName}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      📅 {new Date(selectedTicket.eventDate).toLocaleDateString('fr-FR')}
                    </div>
                    {selectedTicket.maxResalePriceWei && (
                      <div className="text-amber-600 text-xs font-semibold mt-2">
                        ⚠️ Prix max: {blockchainService.formatEther(selectedTicket.maxResalePriceWei)} ETH
                      </div>
                    )}
                    {!selectedTicket.resaleAllowed && (
                      <div className="text-red-600 text-xs font-semibold mt-2">
                        🚫 Revente interdite pour cet événement
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Prix de vente (ETH)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      max={selectedTicket?.maxResalePriceWei ? blockchainService.formatEther(selectedTicket.maxResalePriceWei) : undefined}
                      placeholder="0.01"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-semibold"
                      disabled={!selectedTicket?.resaleAllowed}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      ETH
                    </span>
                  </div>
                  {!selectedTicket?.resaleAllowed && (
                    <p className="text-red-600 text-xs mt-2">
                      La revente est interdite pour cet événement
                    </p>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">Royalties:</span> 10% du prix seront versés à l'organisateur
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowSellForm(false);
                    setSelectedTicket(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSellTicket}
                  disabled={loading || !selectedTicket?.resaleAllowed}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Mise en vente...' : 'Confirmer'}
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
                  <div className="font-semibold text-gray-900 mb-1">
                    {selectedListing?.name || `Ticket #${selectedListing?.tokenId}`}
                  </div>
                  <div className="text-sm text-gray-600">{selectedListing?.eventTitle}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    🎫 {selectedListing?.ticketType === 'vip' ? '⭐ VIP' : '🎫 Standard'}
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {ticketHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Aucun historique disponible pour ce ticket
                    </p>
                  ) : (
                    ticketHistory.map((owner, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-mono text-sm font-semibold text-gray-900 break-all">
                            {owner}
                          </div>
                          <div className="text-xs text-gray-500">
                            {index === ticketHistory.length - 1 ? 'Propriétaire actuel' : `Propriétaire #${index + 1}`}
                          </div>
                        </div>
                        {index === ticketHistory.length - 1 && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </div>
                    ))
                  )}
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
    </div>
  );
};

export default TicketMarketplace;