import { Calendar, MapPin, AlertTriangle, Send, History } from "lucide-react";

export default function TicketCard({
  name,
  eventName,
  status,
  price,
  date,
  place,
  image,
  type,
  buttons = [],
  onTransfer,
  onViewDetails
}) {
  // Convertir la date en string de manière sécurisée
  const formatDate = (dateInput) => {
    if (!dateInput) return 'Date inconnue';
    
    try {
      // Si c'est déjà une string, la convertir en Date
      const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      
      // Vérifier si la date est valide
      if (isNaN(dateObj.getTime())) {
        return 'Date invalide';
      }
      
      return dateObj.toLocaleDateString('fr-FR');
    } catch (error) {
      console.error('Erreur format date:', error);
      return 'Date invalide';
    }
  };

  const formattedDate = formatDate(date);
  const isExpired = new Date(date) < new Date();
  
  //  Gérer le statut "utilisé" et "en vente"
  const getStatusBadge = () => {
    if (status === "utilisé") {
      return <span className="text-red-600 font-bold text-m">• Utilisé</span>;
    } else if (status === "en vente") {
      return <span className="text-red-600 font-bold text-m">• En vente</span>;
    } else if (status === "disponible") {
      return <span className="text-blue-600 font-bold text-m">• Disponible</span>;
    }
    return null;
  };

  const getButtonStyles = (variant = 'primary') => {
    const styles = {
      primary: 'bg-purple-600 text-white hover:bg-purple-700',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      success: 'bg-green-600 text-white hover:bg-green-700'
    };
    return styles[variant] || styles.primary;
  };

  // Use legacy props if buttons array is empty
  const buttonConfig = buttons.length > 0 ? buttons : (
    onTransfer || onViewDetails ? [
      ...(onTransfer ? [{
        label: 'Transférer',
        icon: Send,
        onClick: onTransfer,
        variant: 'primary'
      }] : []),
      ...(onViewDetails ? [{
        label: 'Détails',
        icon: History,
        onClick: onViewDetails,
        variant: 'secondary'
      }] : [])
    ] : []
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden group">

      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
        />

        {/*  Prix - Afficher seulement si le ticket est en vente */}
        {status === "en vente" && price && (
          <div className="absolute bottom-2 left-2 bg-white/90 px-3 py-1 rounded-lg text-sm font-bold text-purple-600">
            {price} ETH
          </div>
        )}

        {/*  Badge pour tickets expirés OU utilisés */}
        {(isExpired || status === "utilisé") && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Non valide</span>
          </div>
        )}

        {/*  Badge pour tickets en vente */}
        {status === "en vente" && !isExpired && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-2 rounded-lg text-s font-bold">
            🏷️ En vente
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="p-4 space-y-2">
        <div className="text-lg font-bold">{name}</div>
        <div className="text-sm text-gray-600">{eventName}</div>

        {/*  Utiliser la date formatée */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
          <Calendar className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <MapPin className="w-4 h-4" />
          <span>{place}</span>
        </div>

        {/* Type du ticket */}
        <div
          className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${
            type === "vip"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {type === "vip" ? "⭐ VIP" : "🎫 STANDARD"}
        </div>

        {/*  État avec nouvelle fonction */}
        <div className="mt-2">
          {getStatusBadge()}
        </div>

        {/* Boutons d'action */}
        {buttonConfig.length > 0 && (
          <div className={`flex gap-2 mt-3 ${buttonConfig.length === 1 ? '' : ''}`}>
            {buttonConfig.map((btn, index) => {
              const ButtonIcon = btn.icon;
              return (
                <button
                  key={index}
                  onClick={btn.onClick}
                  className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-sm font-medium ${getButtonStyles(btn.variant)}`}
                >
                  {ButtonIcon && <ButtonIcon className="w-4 h-4" />}
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}