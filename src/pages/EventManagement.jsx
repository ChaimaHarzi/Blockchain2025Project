import React, { useState, useEffect } from 'react';
import {
  User,
  LogOut,
  Wallet,
  Calendar,
  ChevronDown,
  Ticket,
  ArrowRightLeft,
  Plus,
  X,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import blockchainService from '../services/blockchainService';

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  //  Vérifier si l'événement est passé
  const isEventPassed = (eventDate) => {
    if (!eventDate) return true;
    return new Date(eventDate) < new Date();
  };

  //  Vérifier si l'événement est bientôt (dans les 7 jours)
  const isEventSoon = (eventDate) => {
    if (!eventDate) return false;
    const eventTime = new Date(eventDate).getTime();
    const now = new Date().getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return eventTime > now && eventTime <= now + sevenDays;
  };

  //  Obtenir le statut de l'événement
  const getEventStatus = (event) => {
    if (isEventPassed(event.date)) {
      return {
        type: 'passed',
        text: 'Terminé',
        icon: <AlertCircle className="w-3 h-3" />,
        color: 'bg-red-100 text-red-800 border-red-200'
      };
    }
    
    if (isEventSoon(event.date)) {
      return {
        type: 'soon', 
        text: 'Bientôt',
        icon: <Clock className="w-3 h-3" />,
        color: 'bg-orange-100 text-orange-800 border-orange-200'
      };
    }
    
    return {
      type: 'upcoming',
      text: 'À venir',
      icon: <CheckCircle className="w-3 h-3" />,
      color: 'bg-green-100 text-green-800 border-green-200'
    };
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (blockchainService.isConnected) {
      setConnected(true);
      loadEvents();
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      await blockchainService.connectWallet();
      setConnected(true);
      await loadEvents();
    } catch (error) {
      alert(`Erreur de connexion: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    if (!blockchainService.isConnected) return;
    
    setLoading(true);
    try {
      const eventsData = await blockchainService.getEvents('all');
      
      const validEvents = eventsData.filter(event => 
        event.exists && event.title && event.categories
      );
      
      console.log(`✅ ${validEvents.length}/${eventsData.length} événements valides`);
      setEvents(validEvents);
      
    } catch (error) {
      console.error('Erreur chargement événements:', error);
      alert('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const getEventImageUrl = (event) => {
    return blockchainService.getEventImageUrl(event);
  };

  const EventImage = ({ event }) => {
    const [imgError, setImgError] = useState(false);
    
    const imageUrl = getEventImageUrl(event);
    
    if (imgError) {
      return (
        <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white">
          <div className="text-center">
            <div className="text-4xl mb-2">🎪</div>
            <div className="text-sm font-medium">{event.title}</div>
            <div className="text-xs opacity-80 mt-1">Image non disponible</div>
          </div>
        </div>
      );
    }

    return (
      <img 
        src={imageUrl}
        alt={event.title}
        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        onError={() => setImgError(true)}
      />
    );
  };

  const handleBuyTicket = async (eventId, categoryIdx, priceWei) => {
    try {
      if (!blockchainService.isConnected) {
        alert('❌ Connectez d\'abord votre wallet!');
        return;
      }

      const event = events.find(e => e.eventId === eventId);
      if (event && isEventPassed(event.date)) {
        alert('❌ Cet événement est déjà terminé');
        return;
      }

      const priceEth = blockchainService.formatEther(priceWei);
      if (!window.confirm(`Acheter ce ticket pour ${priceEth} ETH ?`)) {
        return;
      }

      const result = await blockchainService.buyTicket(
        eventId, 
        categoryIdx, 
        priceWei
      );

      if (result.success) {
        alert('✅ Ticket acheté avec succès!');
        loadEvents();
      }

    } catch (error) {
      console.error('❌ Erreur:', error);
      
      if (error.message.includes('user rejected')) {
        alert('❌ Transaction annulée');
      } else if (error.message.includes('insufficient funds')) {
        alert('❌ Pas assez d\'ETH pour acheter');
      } else {
        alert(`❌ Erreur: ${error.message}`);
      }
    }
  };

  // EventCard Component intégré
  const EventCard = ({ event, onOpenDialog }) => {
    const [imgError, setImgError] = useState(false);
    const imageUrl = getEventImageUrl(event);
    const eventStatus = getEventStatus(event);
    const isPassed = isEventPassed(event.date);

    return (
      <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100">
        <div className="relative overflow-hidden">
          {imgError ? (
            <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-4xl mb-2">🎪</div>
                <div className="text-sm font-medium">{event.title}</div>
              </div>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={event.title}
              className="w-full h-36 object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-purple-600">
            {event.categories?.[0]?.priceEth || '0.01'} ETH
          </div>

          {/* 🔥 Badge de statut */}
          <div className="absolute top-3 left-3">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${eventStatus.color}`}>
              {eventStatus.icon}
              <span>{eventStatus.text}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
            {event.title}
          </h3>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600 text-sm">
              <Clock className="w-4 h-4 mr-2 text-purple-500" />
              <span>{event.date ? new Date(event.date).toLocaleDateString('fr-FR') : 'Date non définie'}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-2 text-purple-500" />
              <span>{event.location || 'Lieu non défini'}</span>
            </div>
          </div>

          {event.availableTickets !== undefined && event.totalTickets !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Billets disponibles</span>
                <span className="font-semibold text-gray-900">
                  {event.availableTickets}/{event.totalTickets}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${(event.availableTickets / event.totalTickets) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          <button
            onClick={() => onOpenDialog(event)}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 font-medium"
          >
            Voir détails
          </button>
        </div>
      </div>
    );
  };

  // DetailsEvent Component intégré - VERSION OPTIMISÉE
  const DetailsEvent = ({ isOpen, event, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const isPassed = event ? isEventPassed(event.date) : false;
    const eventStatus = event ? getEventStatus(event) : null;

    if (!isOpen || !event) return null;

    const handleBuyClick = () => {
      if (isPassed) {
        alert('❌ Cet événement est déjà terminé');
        return;
      }
      
      if (!selectedCategory) {
        alert('Veuillez sélectionner un type de billet.');
        return;
      }
      handleBuyTicket(event.eventId, selectedCategory.index, selectedCategory.priceWei);
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          <div className="relative h-56 overflow-hidden">
            <EventImage event={event} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold text-white mb-1">
                {event.title}
              </h2>

              {/* 🔥 Badge de statut dans le header */}
              {eventStatus && (
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${eventStatus.color} inline-flex`}>
                  {eventStatus.icon}
                  <span>{eventStatus.text}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Organisateur */}
            <div className="flex items-center justify-between bg-gray-200 p-3 rounded-lg mb-4">
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Organisateur</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-semibold text-gray-900 mr-2">
                  {event.organizer ? 
                    `${event.organizer}` : 
                    'Inconnu'
                  }
                </span>
                {event.organizer?.toLowerCase() === blockchainService.currentAddress?.toLowerCase() && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    Vous
                  </span>
                )}
              </div>
            </div>

            {/* Grid avec 2 colonnes pour Date et Lieu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center text-purple-600 mb-1">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Date</span>
                </div>
                <p className="font-semibold text-gray-900 text-sm">
                  {event.date ? new Date(event.date).toLocaleDateString('fr-FR') : 'Non définie'}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center text-blue-600 mb-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Lieu</span>
                </div>
                <p className="font-semibold text-gray-900 text-sm">
                  {event.location || 'Non défini'}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {event.description || 'Aucune description disponible pour cet événement.'}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900 mb-2">
                Royalties
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {(event.royaltyBps / 100).toFixed(1)}%
              </p>
            </div>

            {/* Ticket Categories Section */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-50 p-4 rounded-xl mb-4">
              <h3 className="text-base font-bold text-gray-900 mb-3">
                Types de billets
              </h3>

              <div className="space-y-2">
                {event.categories?.map((category, index) => (
                  category.available > 0 && (
                    <div
                      key={index}
                      onClick={() => !isPassed && setSelectedCategory({...category, index})}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        isPassed 
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                          : selectedCategory?.index === category.index
                            ? 'border-purple-500 bg-white shadow-sm cursor-pointer'
                            : 'border-gray-200 hover:border-purple-400 bg-white/50 cursor-pointer'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">{category.name}</p>
                          <p className="text-lg font-bold text-gray-900">
                            {category.priceEth} ETH
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-600">Disponibles</p>
                          <p className="text-lg font-bold text-gray-900">
                            {category.available}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>

            <button
              onClick={handleBuyClick}
              disabled={isPassed || !selectedCategory}
              className={`w-full py-3 rounded-lg hover:shadow-md transition-all duration-200 font-semibold text-base ${
                isPassed 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : !selectedCategory
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:shadow-green-500/30'
              }`}
            >
              {isPassed ? 'Événement terminé' : !selectedCategory ? 'Sélectionnez un billet' : 'Acheter maintenant'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const openDialog = (event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center p-6">
        <div className="hero bg-base-200 rounded-2xl shadow-xl max-w-md w-full">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 mx-auto mb-6">
                <Ticket className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
                Événements
              </h1>
              <p className="py-6 text-gray-600">
                Connectez votre wallet pour voir tous les événements disponibles
              </p>
              <button 
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 font-medium mx-auto"
                onClick={connectWallet}
                disabled={loading}
              >
                {loading ? 'Connexion...' : (
                  <>
                    <Wallet className="w-5 h-5" />
                    <span>Connecter Wallet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
  
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Events Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Tous les Événements
              </h2>
              <p className="text-gray-600 mt-1">
                Découvrez tous les événements disponibles
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <span className="ml-4 text-gray-600">Chargement des événements...</span>
            </div>
          ) : (
            <div>
              <div className="mb-4 text-sm text-gray-500">
                {events.length} événement(s) trouvé(s) • Tous les événements
              </div>

              {events.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-lg text-gray-500">
                    Aucun événement disponible
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map(event => (
                    <EventCard
                      key={event.eventId}
                      event={event}
                      onOpenDialog={openDialog}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Event Details Modal */}
      <DetailsEvent
        isOpen={isDialogOpen}
        event={selectedEvent}
        onClose={closeDialog}
      />
    </div>
  );
};

export default AllEvents;