import React, { useState } from 'react';
import { X, Clock, MapPin, Ticket, Send, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

const Marketplace = ({ isOpen, onClose }) => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [transferMode, setTransferMode] = useState('transfer');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [resalePrice, setResalePrice] = useState('');

  const myTickets = [
    {
      id: 'TKT-001',
      eventName: 'Concert Coldplay 2025',
      eventDate: '21 Mars 2025',
      eventLocation: 'Paris - Accor Arena',
      ticketType: 'VIP',
      purchasePrice: 0.08,
      purchaseDate: '15 Nov 2024',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
      maxResalePrice: 0.12,
      royaltyPercentage: 10,
    },
    {
      id: 'TKT-002',
      eventName: 'Festival Summer Vibes',
      eventDate: '10 Juillet 2025',
      eventLocation: 'Nice - Beach Arena',
      ticketType: 'Standard',
      purchasePrice: 0.05,
      purchaseDate: '18 Nov 2024',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
      maxResalePrice: 0.075,
      royaltyPercentage: 10,
    },
  ];

  const openTransferDialog = (ticket) => {
    setSelectedTicket(ticket);
    setTransferMode('transfer');
    setRecipientAddress('');
    setResalePrice('');
  };

  const handleTransfer = () => {
    if (!selectedTicket || !recipientAddress) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    alert(`Transfert du billet ${selectedTicket.id} vers ${recipientAddress}`);
    onClose();
  };

  const handleResale = () => {
    if (!selectedTicket || !resalePrice) {
      alert('Veuillez définir un prix de revente');
      return;
    }
    const maxPrice = selectedTicket.maxResalePrice || selectedTicket.purchasePrice * 1.5;
    if (parseFloat(resalePrice) > maxPrice) {
      alert(`Prix maximum autorisé: ${maxPrice} ETH`);
      return;
    }
    alert(`Mise en vente du billet ${selectedTicket.id} pour ${resalePrice} ETH`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl z-10">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-3xl font-bold text-gray-900">
            Transférer / Revendre mes billets
          </h2>
          <p className="text-gray-600 mt-1">
            Gérez vos billets NFT en toute sécurité
          </p>
        </div>

        <div className="p-8">
          {!selectedTicket ? (
            <>
              {/* My Tickets Grid */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Mes billets disponibles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myTickets
                    .filter((t) => t.status === 'active')
                    .map((ticket) => (
                      <div
                        key={ticket.id}
                        className="group bg-linear-to-br from-white to-purple-50/30 rounded-xl border-2 border-gray-200 hover:border-purple-400 p-5 transition-all duration-300 hover:shadow-lg cursor-pointer"
                        onClick={() => openTransferDialog(ticket)}
                      >
                        <div className="flex gap-4">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                            <img
                              src={ticket.image}
                              alt={ticket.eventName}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                              {ticket.ticketType}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 mb-1 truncate group-hover:text-purple-600 transition-colors">
                              {ticket.eventName}
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Clock className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
                                <span>{ticket.eventDate}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
                                <span className="truncate">
                                  {ticket.eventLocation}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-sm font-semibold text-purple-600">
                                {ticket.purchasePrice} ETH
                              </span>
                              <span className="text-xs text-gray-500">
                                ID: {ticket.id}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                {myTickets.filter((t) => t.status === 'active').length ===
                  0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun billet disponible</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Selected Ticket Details */}
              <div className="mb-6">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="flex items-center text-purple-600 hover:text-purple-700 mb-4 font-medium"
                >
                  ← Retour à mes billets
                </button>
                <div className="bg-linear-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
                  <div className="flex gap-6">
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={selectedTicket.image}
                        alt={selectedTicket.eventName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            {selectedTicket.eventName}
                          </h3>
                          <span className="inline-block bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                            {selectedTicket.ticketType}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            Prix d'achat
                          </p>
                          <p className="text-2xl font-bold bg-linear-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                            {selectedTicket.purchasePrice} ETH
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center text-gray-700">
                          <Clock className="w-4 h-4 mr-2 text-purple-500" />
                          <span>{selectedTicket.eventDate}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                          <span>{selectedTicket.eventLocation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Tabs */}
              <div className="mb-6">
                <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl">
                  <button
                    onClick={() => setTransferMode('transfer')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${transferMode === 'transfer'
                      ? 'bg-white text-purple-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <Send className="w-5 h-5" />
                    Transférer
                  </button>
                  <button
                    onClick={() => setTransferMode('resale')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${transferMode === 'resale'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <DollarSign className="w-5 h-5" />
                    Revendre
                  </button>
                </div>
              </div>

              {/* Transfer Form */}
              {transferMode === 'transfer' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">
                        Transfert sécurisé
                      </p>
                      <p>
                        Le transfert sera enregistré sur la blockchain.
                        Assurez-vous que l'adresse du destinataire est
                        correcte.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Adresse du destinataire
                    </label>
                    <input
                      type="text"
                      placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Le billet sera transféré gratuitement au destinataire
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Récapitulatif du transfert
                    </h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Billet</span>
                      <span className="font-semibold text-gray-900">
                        {selectedTicket.id}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Événement</span>
                      <span className="font-semibold text-gray-900">
                        {selectedTicket.eventName}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type</span>
                      <span className="font-semibold text-gray-900">
                        {selectedTicket.ticketType}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 my-2 pt-2 flex justify-between">
                      <span className="text-gray-600 font-medium">
                        Frais de transfert
                      </span>
                      <span className="font-bold text-green-600">
                        Gratuit
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleTransfer}
                    className="w-full bg-linear-to-r from-purple-600 to-blue-500 text-white py-4 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Confirmer le transfert
                  </button>
                </div>
              )}

              {/* Resale Form */}
              {transferMode === 'resale' && (
                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-1">
                        Règles de revente
                      </p>
                      <p>
                        Prix maximum autorisé:{' '}
                        <strong>{selectedTicket.maxResalePrice} ETH</strong>
                      </p>
                      <p>
                        Royalties organisateur:{' '}
                        <strong>{selectedTicket.royaltyPercentage}%</strong>
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Prix de revente (ETH)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        placeholder="0.10"
                        value={resalePrice}
                        onChange={(e) => setResalePrice(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg font-semibold"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        ETH
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="text-gray-500">
                        Prix d'achat: {selectedTicket.purchasePrice} ETH
                      </span>
                      <span className="text-gray-500">
                        Max: {selectedTicket.maxResalePrice} ETH
                      </span>
                    </div>
                  </div>

                  {/* Price Calculator */}
                  {resalePrice && parseFloat(resalePrice) > 0 && (
                    <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        Calcul des revenus
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">
                            Prix de vente
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            {parseFloat(resalePrice).toFixed(3)} ETH
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            Royalties organisateur (
                            {selectedTicket.royaltyPercentage}%)
                          </span>
                          <span className="font-semibold text-red-600">
                            -
                            {(
                              (parseFloat(resalePrice) *
                                (selectedTicket.royaltyPercentage || 0)) /
                              100
                            ).toFixed(3)}{' '}
                            ETH
                          </span>
                        </div>
                        <div className="border-t-2 border-blue-300 pt-3 flex justify-between items-center">
                          <span className="text-gray-900 font-bold">
                            Vous recevrez
                          </span>
                          <span className="text-2xl font-bold text-green-600">
                            {(
                              parseFloat(resalePrice) *
                              (1 -
                                (selectedTicket.royaltyPercentage || 0) /
                                100)
                            ).toFixed(3)}{' '}
                            ETH
                          </span>
                        </div>
                        {parseFloat(resalePrice) >
                          (selectedTicket.maxResalePrice || 0) && (
                          <div className="bg-red-100 border border-red-300 rounded-lg p-3 flex items-start gap-2 text-sm text-red-800">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>Prix supérieur au maximum autorisé!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleResale}
                    disabled={!resalePrice || parseFloat(resalePrice) <= 0}
                    className="w-full bg-linear-to-r from-blue-600 to-indigo-500 text-white py-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <DollarSign className="w-5 h-5" />
                    Mettre en vente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;