import { useState, useEffect } from 'react';
import { Copy, LogOut, Wallet as WalletIcon, Ticket, Eye, EyeOff, X, Send, User, Calendar } from 'lucide-react';
import TicketCard from '../components/TicketCard';
import { LoaderModal } from '../components/loader';
import ConfirmationModal from '../components/ConfirmationModal';

export default function Wallet({ address, balance, onDisconnect }) {
  const [tickets, setTickets] = useState([]);
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // États pour les modals
  const [transferModal, setTransferModal] = useState({ open: false, ticket: null });
  const [detailsModal, setDetailsModal] = useState({ open: false, ticket: null });
  const [recipientAddress, setRecipientAddress] = useState('');
  const [confirmation, setConfirmation] = useState({ isOpen: false, title: '', message: '', action: null, actionData: null });
  
  // États pour le loader
  const [loaderState, setLoaderState] = useState({
    isOpen: false,
    message: '',
    type: 'loading'
  });

  // Données simulées pour les tickets
  useEffect(() => {
    const mockTickets = [
      {
        id: "1",
        name: "Ticket VIP",
        eventName: "Festival Electro 2024",
        status: "en vente",
        price: 0.15,
        date: "2024-08-15",
        place: "Paris, France",
        image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400",
        type: "premium",
        owners: [
          { address: "0x742d35Cc6634C0532925a3b8D...", date: "2024-06-01", type: "Achat initial" },
          { address: "0x89205A0A3b8D0532925a3b8D...", date: "2024-05-15", type: "Création" }
        ]
      },
      {
        id: "2",
        name: "Entrée Standard",
        eventName: "Concert Jazz Night",
        status: "nothing",
        price: 0.08,
        date: "2024-07-20",
        place: "Lyon, France",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
        type: "standard",
        owners: [
          { address: "0x89205A0A3b8D0532925a3b8D...", date: "2024-05-20", type: "Achat initial" }
        ]
      }
    ];
    
    // Simulation du chargement
    setTimeout(() => {
      setTickets(mockTickets);
      setLoading(false);
    }, 1000);
  }, []);

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return "Adresse non disponible";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Fonction sécurisée pour formater le prix
  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(price)) {
      return "0.00";
    }
    return parseFloat(price).toFixed(4);
  };

  // Fonction sécurisée pour calculer la valeur totale
  const calculateTotalValue = () => {
    if (!tickets || tickets.length === 0) return 0;
    const total = tickets.reduce((sum, ticket) => {
      const price = ticket?.price || 0;
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    return total;
  };

  // Gestion du transfert
  const handleTransfer = (ticket) => {
    setTransferModal({ open: true, ticket });
  };

  const handleViewDetails = (ticket) => {
    setDetailsModal({ open: true, ticket });
  };

  const openTransferConfirmation = () => {
    if (!recipientAddress) {
      setLoaderState({
        isOpen: true,
        message: 'Veuillez saisir une adresse de destinataire',
        type: 'error'
      });
      setTimeout(() => {
        setLoaderState({ isOpen: false, message: '', type: 'loading' });
      }, 2000);
      return;
    }

    setTransferModal({ open: false, ticket: null });
    setConfirmation({
      isOpen: true,
      title: 'Confirmer le transfert',
      message: `Êtes-vous sûr de vouloir transférer "${transferModal.ticket.name}" à ${formatAddress(recipientAddress)} ?`,
      action: 'transfer',
      actionData: { ticket: transferModal.ticket, recipient: recipientAddress },
      type: 'info'
    });
  };

  const executeAction = async () => {
    setConfirmation({ ...confirmation, isOpen: false });

    if (confirmation.action === 'transfer') {
      await executeTransfer(confirmation.actionData.ticket, confirmation.actionData.recipient);
    }
  };

  const executeTransfer = async (ticket, recipient) => {
    setLoaderState({
      isOpen: true,
      message: 'Transfert du ticket en cours...',
      type: 'loading'
    });
    
    try {
      // Simulation d'un transfert avec délai
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler un succès (80% de chance de succès)
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        setLoaderState({
          isOpen: true,
          message: `Ticket transféré avec succès à ${formatAddress(recipient)}`,
          type: 'success'
        });
        
        // Mettre à jour les tickets (supprimer le ticket transféré)
        setTickets(prev => prev.filter(t => t.id !== ticket.id));
      } else {
        setLoaderState({
          isOpen: true,
          message: 'Erreur lors du transfert. Veuillez réessayer.',
          type: 'error'
        });
      }
    } catch (error) {
      setLoaderState({
        isOpen: true,
        message: 'Une erreur est survenue lors du transfert.',
        type: 'error'
      });
    }
    
    setRecipientAddress('');
    
    setTimeout(() => {
      setLoaderState({ isOpen: false, message: '', type: 'loading' });
    }, 2500);
  };

  const closeLoader = () => {
    setLoaderState({
      isOpen: false,
      message: '',
      type: 'loading'
    });
  };

  const totalTickets = tickets?.length || 0;
  const ticketsForSale = tickets?.filter(ticket => ticket?.status === "en vente").length || 0;
  const totalValue = calculateTotalValue();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <WalletIcon className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Chargement de votre wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mon Wallet</h1>
          <p className="text-gray-600">Gérez vos tickets et votre solde Ethereum</p>
        </div>

        {/* Wallet Info Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            {/* Balance Section */}
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <WalletIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {showBalance ? `${formatPrice(balance)} ETH` : '•••••'}
                  </span>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {showBalance ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                  </button>
                </div>
                <p className="text-gray-600 text-sm">Solde actuel</p>
              </div>
            </div>

            {/* Address Section */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Adresse du wallet</p>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                    {formatAddress(address)}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                    disabled={!address}
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                    {copied && (
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                        Copié!
                      </span>
                    )}
                  </button>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Tickets Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Mes Tickets</h2>
            <div className="text-gray-600">
              {totalTickets} ticket{totalTickets > 1 ? 's' : ''} au total
            </div>
          </div>

          {!tickets || tickets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-gray-200">
              <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun ticket trouvé</h3>
              <p className="text-gray-600">Vous n'avez pas encore de tickets dans votre wallet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  name={ticket.name || "Ticket sans nom"}
                  eventName={ticket.eventName || "Événement inconnu"}
                  status={ticket.status || "nothing"}
                  price={ticket.price || 0}
                  date={ticket.date || "2024-01-01"}
                  place={ticket.place || "Lieu inconnu"}
                  image={ticket.image || "https://via.placeholder.com/400x200?text=Image+non+disponible"}
                  type={ticket.type || "standard"}
                  onTransfer={() => handleTransfer(ticket)}
                  onViewDetails={() => handleViewDetails(ticket)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Transfert */}
      {transferModal.open && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
              <button
                onClick={() => setTransferModal({ open: false, ticket: null })}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
              <h2 className="text-xl font-bold text-gray-900">
                Transférer le ticket
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {transferModal.ticket?.name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Adresse du destinataire
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                onClick={openTransferConfirmation}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 font-semibold flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Confirmer le transfert</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal des Détails et Historique */}
      {detailsModal.open && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
              <button
                onClick={() => setDetailsModal({ open: false, ticket: null })}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
              <h2 className="text-xl font-bold text-gray-900">
                Historique du ticket
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {detailsModal.ticket?.name}
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">Propriétaires successifs :</h3>
                
                {detailsModal.ticket?.owners?.map((owner, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <User className="w-5 h-5 text-purple-600" />
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {formatAddress(owner.address)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{owner.date}</span>
                      <span className="mx-2">•</span>
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                        {owner.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loader Modal */}
      <LoaderModal
        isOpen={loaderState.isOpen}
        message={loaderState.message}
        type={loaderState.type}
        onClose={loaderState.type !== 'loading' ? closeLoader : undefined}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        confirmText="Confirmer"
        cancelText="Annuler"
        type={confirmation.type}
        onConfirm={executeAction}
        onCancel={() => setConfirmation({ ...confirmation, isOpen: false })}
      />
    </div>
  );
}