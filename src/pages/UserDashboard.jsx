import React, { useState, useEffect } from 'react';
import {Calendar, MapPin, Send, History, Ticket, TicketCheck, Locate, Map, LocationEditIcon } from 'lucide-react';
import blockchainService from '../services/blockchainService';
import TicketCard from '../components/TicketCard';
import { X, Tag, ArrowRightLeft, AlertTriangle, Info } from 'lucide-react';

const UserDashboard = () => {
  const [userTickets, setUserTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [sellPrice, setSellPrice] = useState('');
  const [transferAddress, setTransferAddress] = useState('');
  const [ticketHistory, setTicketHistory] = useState([]);

  // Charger les tickets de l'utilisateur avec tous les détails
  const loadUserTickets = async () => {
    setLoading(true);
    try {
      const tickets = await blockchainService.getUserTickets();
      
      // Charger tous les détails pour chaque ticket
      const ticketsWithDetails = await Promise.all(
        tickets.map(async (ticket) => {
          try {
            const eventDetails = await blockchainService.getEventDetails(ticket.eventId);
            const listing = await blockchainService.getListing(ticket.tokenId);
            
            return {
              ...ticket,
              eventTitle: eventDetails?.title || `Événement #${ticket.eventId}`,
              eventImage: blockchainService.getEventImageUrl(eventDetails),
              eventLocation: eventDetails?.location,
              eventDate: eventDetails?.date,
              eventDetails: eventDetails,
              maxResalePrice: eventDetails?.maxResalePriceWei,
              resaleAllowed: eventDetails?.resaleAllowed,
              isListed: listing.exists,
              listingPrice: listing.exists ? listing.priceWei : null
            };
          } catch (error) {
            console.error(`Erreur chargement ticket ${ticket.tokenId}:`, error);
            return {
              ...ticket,
              eventTitle: `Événement #${ticket.eventId}`,
              eventImage: `https://picsum.photos/400/200?random=${ticket.eventId}`,
              eventLocation: 'Inconnu',
              eventDate: null,
              maxResalePrice: null,
              resaleAllowed: true,
              isListed: false,
              listingPrice: null
            };
          }
        })
      );
      
      setUserTickets(ticketsWithDetails);
    } catch (error) {
      console.error('Erreur chargement tickets:', error);
      alert('Erreur lors du chargement des tickets');
    }
    setLoading(false);
  };

  // Charger l'historique d'un ticket avec les prix d'achat
  const loadTicketHistory = async (tokenId) => {
    try {
      const history = await blockchainService.getTicketHistory(tokenId);
      
      // Pour chaque propriétaire, récupérer le prix d'achat
      const historyWithPrices = await Promise.all(
        history.map(async (owner, index) => {
          try {
            // Si c'est le premier propriétaire (création), utiliser le prix original
            if (index === 0) {
              const categoryDetails = await blockchainService.getEventCategory(selectedTicket.eventId, selectedTicket.ticketType);
              return {
                address: owner,
                price: parseFloat(blockchainService.formatEther(categoryDetails.priceWei)).toFixed(3),
                type: "Achat initial"
              };
            } else {
              // Pour les propriétaires suivants, essayer de récupérer le prix du marketplace
              // Pour l'instant, on met un prix par défaut basé sur le type de ticket
              const defaultPrice = selectedTicket.ticketType === 1 ? "0.150" : "0.080";
              return {
                address: owner,
                price: defaultPrice,
                type: "Achat secondaire"
              };
            }
          } catch (error) {
            console.error(`Erreur récupération prix pour propriétaire ${owner}:`, error);
            return {
              address: owner,
              price: "N/A",
              type: index === 0 ? "Achat initial" : "Achat secondaire"
            };
          }
        })
      );
      
      setTicketHistory(historyWithPrices);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      setTicketHistory([]);
    }
  };

  // Ouvrir le modal du ticket
  const handleOpenTicketModal = async (ticket) => {
    setSelectedTicket(ticket);
    await loadTicketHistory(ticket.tokenId);
    setShowTicketModal(true);
  };

  // Vendre un ticket
  const handleSellTicket = async () => {
    if (!selectedTicket || !sellPrice) {
      alert('Veuillez entrer un prix de vente');
      return;
    }

    try {
      const priceWei = blockchainService.parseEther(sellPrice);
      
      // Vérifier le prix maximum
      if (selectedTicket.maxResalePrice && priceWei > selectedTicket.maxResalePrice) {
        const maxPriceEth = blockchainService.formatEther(selectedTicket.maxResalePrice);
        alert(`❌ Le prix maximum autorisé pour cet événement est ${maxPriceEth} ETH`);
        return;
      }

      // Vérifier que la revente est autorisée
      if (!selectedTicket.resaleAllowed) {
        alert('❌ La revente n\'est pas autorisée pour cet événement');
        return;
      }

      // Vérifier que le ticket n'est pas déjà en vente
      if (selectedTicket.isListed) {
        alert('❌ Ce ticket est déjà en vente !');
        return;
      }

      // Vérifier que le ticket n'est pas utilisé
      if (selectedTicket.used) {
        alert('❌ Impossible de vendre un ticket déjà utilisé !');
        return;
      }

      setLoading(true);
      await blockchainService.listToken(selectedTicket.tokenId, priceWei);
      
      alert(`✅ Ticket #${selectedTicket.tokenId} mis en vente pour ${sellPrice} ETH !`);
      setShowSellModal(false);
      setSellPrice('');
      await loadUserTickets();
      
    } catch (error) {
      console.error('Erreur vente:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Transférer un ticket
  const handleTransferTicket = async () => {
    if (!selectedTicket || !transferAddress) {
      alert('Veuillez entrer une adresse de destination');
      return;
    }

    // Validation basique de l'adresse
    if (!transferAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('❌ Adresse Ethereum invalide');
      return;
    }

    try {
      // Vérifier que le ticket n'est pas utilisé
      if (selectedTicket.used) {
        alert('❌ Impossible de transférer un ticket déjà utilisé !');
        return;
      }

      setLoading(true);
      
      // Transférer le ticket NFT
      await blockchainService.contracts.ticketNFT.transferFrom(
        blockchainService.currentAddress,
        transferAddress,
        selectedTicket.tokenId
      );
      
      alert(`✅ Ticket #${selectedTicket.tokenId} transféré à ${transferAddress} !`);
      setShowTransferModal(false);
      setTransferAddress('');
      await loadUserTickets();
      setShowTicketModal(false);
      
    } catch (error) {
      console.error('Erreur transfert:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Annuler une vente
  const handleCancelSale = async (tokenId) => {
    if (window.confirm(`Annuler la vente du ticket #${tokenId} ?`)) {
      try {
        setLoading(true);
        await blockchainService.cancelListing(tokenId);
        alert('✅ Vente annulée !');
        await loadUserTickets();
        setShowTicketModal(false);
      } catch (error) {
        console.error('Erreur annulation:', error);
        alert(`❌ Erreur: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Préparer les données pour TicketCard
  
  const getTicketCardProps = (ticket) => {
  const status = ticket.used ? "utilisé" : 
                ticket.isListed ? "en vente" : 
                "disponible";

  // const price = ticket.isListed && ticket.listingPrice ? 
  //               parseFloat(blockchainService.formatEther(ticket.listingPrice)).toFixed(3) : 
  //               "0.000";

  // ✅ NOUVEAU : Déterminer le type par le NOM de la catégorie
  const getCategoryType = () => {
    if (!ticket.eventDetails || !ticket.eventDetails.categories) {
      return "standard"; // Fallback
    }
    
    const category = ticket.eventDetails.categories[ticket.ticketType];
    if (!category) return "standard";
    
    const categoryName = category.name.toLowerCase();
    
    // ✅ Détection VIP basée sur le nom
    if (categoryName.includes('vip')) {
      return 'vip';
    }
    
    return 'standard'; // Tout le reste est Standard
  };

  return {
    name: `Ticket #${ticket.tokenId}`,
    eventName: ticket.eventTitle,
    status: status,
    // price: price,
    date: ticket.eventDate,
    place: ticket.eventLocation,
    image: ticket.eventImage,
    type: getCategoryType(), 
    onTransfer: ticket.isListed ? null : () => handleOpenTransferModal(ticket),
    onViewDetails: () => handleOpenTicketModal(ticket)
  };
};

  // Ouvrir le modal de transfert
  const handleOpenTransferModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowTransferModal(true);
    setTransferAddress('');
  };

  // Ouvrir le modal de vente
  const handleOpenSellModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowSellModal(true);
    setSellPrice('');
  };

  const formatAddress = (addr) => {
    if (!addr) return "Adresse non disponible";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  useEffect(() => {
    loadUserTickets();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <Ticket className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Chargement de vos tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes Tickets</h1>
          <p className="text-gray-600">Gérez vos tickets NFT et vos reventes</p>
        </div>

        {/* Tickets Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Mes Billets</h2>
            <div className="text-gray-600">
              {userTickets.length} ticket{userTickets.length > 1 ? 's' : ''} au total
            </div>
          </div>

          {userTickets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-gray-200">
              <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun ticket trouvé</h3>
              <p className="text-gray-600">Vous n'avez pas encore de tickets dans votre wallet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userTickets.map((ticket) => (
                <TicketCard
                  key={ticket.tokenId}
                  {...getTicketCardProps(ticket)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL : DÉTAILS DU TICKET */}
      {showTicketModal && selectedTicket && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              <div className='flex gap-2'><TicketCheck/> Détails du Ticket : id : {selectedTicket.tokenId}</div>
              
            </h3>
            
            {/* Informations du ticket */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Image */}
              <div>
                <img 
                  src={selectedTicket.eventImage || 'https://via.placeholder.com/400x200?text=Event+Image'} 
                  alt={selectedTicket.eventTitle}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              
              {/* Détails */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-primary text-lg">{selectedTicket.eventTitle}</h4>
                  <p className="text-sm text-gray-600"><div className='flex gap-2'><MapPin/>{selectedTicket.eventLocation}</div></p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><strong>Type:</strong> {selectedTicket.ticketType === 0 ? 'Standard' : 'VIP'}</p>
                  <p><strong>Date:</strong> {selectedTicket.eventDate ? new Date(selectedTicket.eventDate).toLocaleDateString('fr-FR') : 'Inconnue'}</p>
                  <p><strong>Statut:</strong> 
                    <span className={`badge ${selectedTicket.used ? 'badge-error' : 'badge-success'} ml-2`}>
                      {selectedTicket.used ? 'Utilisé' : 'Valide'}
                    </span>
                  </p>
                  <p><strong>En vente:</strong> 
                    <span className={`badge ${selectedTicket.isListed ? 'badge-warning' : 'badge-info'} ml-2`}>
                      {selectedTicket.isListed ? 'Oui' : 'Non'}
                    </span>
                  </p>
                </div>

                {selectedTicket.maxResalePrice && (
                  <div className="bg-warning text-warning-content p-2 rounded text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <strong>Prix max revente:</strong> {blockchainService.formatEther(selectedTicket.maxResalePrice)} ETH
                  </div>
                )}

                {!selectedTicket.resaleAllowed && (
                  <div className="bg-error text-error-content p-2 rounded text-sm flex items-center gap-2">
                    <X className="w-4 h-4" />
                    <strong>Revente interdite</strong> pour cet événement
                  </div>
                )}
              </div>
            </div>

            {/* HISTORIQUE DU TICKET AVEC PRIX */}
            <div className="mb-6">
              <div>   <History className="w-4 h-4" />
              <h4 className="font-semibold mb-3"> Historique des propriétaires</h4></div>   
              <div className="max-h-40 overflow-y-auto border rounded">
                {ticketHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucun historique disponible</p>
                ) : (
                  <div className="divide-y">
                    {ticketHistory.map((owner, index) => (
                      <div key={index} className="p-3 hover:bg-base-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-semibold">Propriétaire {index + 1}</p>
                            <p className="text-xs font-mono text-gray-600">{owner.address}</p>
                          </div>
                          <span className={`badge ${owner.type === "Achat initial" ? 'badge-info' : 'badge-warning'}`}>
                            {owner.type}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Prix d'achat :</span>
                          <span className="text-sm font-bold text-green-600">{owner.price} ETH</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ACTIONS */}
          {/* ACTIONS */}
<div className="modal-action justify-between">
  <div className="flex gap-2">
    {!selectedTicket.used && !selectedTicket.isListed && selectedTicket.resaleAllowed && (
      <button 
        className="btn btn-warning flex items-center gap-2"
        onClick={() => handleOpenSellModal(selectedTicket)}
      >
        <Tag className="w-4 h-4" />
        Revendre
      </button>
    )}
    
    {!selectedTicket.used && !selectedTicket.isListed && (
      <button 
        className="btn btn-info flex items-center gap-2"
        onClick={() => handleOpenTransferModal(selectedTicket)}
      >
        <ArrowRightLeft className="w-4 h-4" />
        Transférer
      </button>
    )}

    {selectedTicket.isListed && (
      <button 
        className="btn btn-error flex items-center gap-2"
        onClick={() => handleCancelSale(selectedTicket.tokenId)}
      >
        <X className="w-4 h-4" />
        Annuler vente
      </button>
    )}
  </div>
  
  <button 
    className="btn btn-ghost"
    onClick={() => setShowTicketModal(false)}
  >
    Fermer
  </button>
</div>
          </div>
        </div>
      )}

      {/* MODAL : REVENTE */}
      {showSellModal && selectedTicket && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              💰 Revendre le Ticket #{selectedTicket.tokenId}
            </h3>
            
            <div className="mb-4 p-3 bg-base-200 rounded">
              <p><strong>Événement:</strong> {selectedTicket.eventTitle}</p>
              {selectedTicket.maxResalePrice && (
                <p className="text-warning">
                  <strong>Prix maximum autorisé:</strong> {blockchainService.formatEther(selectedTicket.maxResalePrice)} ETH
                </p>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Prix de vente (ETH)</span>
              </label>
              <input 
                type="number"
                step="0.001"
                min="0.001"
                max={selectedTicket.maxResalePrice ? blockchainService.formatEther(selectedTicket.maxResalePrice) : undefined}
                className="input input-bordered"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder="0.01"
              />
            </div>

          <div className="modal-action">
  <button 
    className="btn btn-ghost"
    onClick={() => setShowSellModal(false)}
  >
    Annuler
  </button>
  <button 
    className="btn btn-warning flex items-center gap-2"
    onClick={handleSellTicket}
    disabled={loading}
  >
    <Tag className="w-4 h-4" />
    {loading ? 'Mise en vente...' : 'Mettre en vente'}
  </button>
</div>
          </div>
        </div>
      )}

      {/* MODAL : TRANSFERT */}
      {showTransferModal && selectedTicket && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              🔄 Transférer le Ticket #{selectedTicket.tokenId}
            </h3>
            
            <div className="mb-4 p-3 bg-base-200 rounded">
              <p><strong>Événement:</strong> {selectedTicket.eventTitle}</p>
              <p className="text-sm text-gray-600">
                Le ticket sera transféré définitivement à l'adresse spécifiée
              </p>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Adresse du destinataire</span>
              </label>
              <input 
                type="text"
                className="input input-bordered font-mono"
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
                placeholder="0x..."
              />
            </div>

           <div className="modal-action">
  <button 
    className="btn btn-ghost"
    onClick={() => setShowTransferModal(false)}
  >
    Annuler
  </button>
  <button 
    className="btn btn-info flex items-center gap-2"
    onClick={handleTransferTicket}
    disabled={loading}
  >
    <ArrowRightLeft className="w-4 h-4" />
    {loading ? 'Transfert...' : 'Transférer'}
  </button>
</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;