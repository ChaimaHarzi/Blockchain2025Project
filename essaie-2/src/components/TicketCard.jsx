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
  onTransfer,
  onViewDetails
}) {

  const isExpired = new Date(date) < new Date();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden group">

      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
        />

        {/* Prix */}
        <div className="absolute bottom-2 left-2 bg-white/90 px-3 py-1 rounded-lg text-sm font-bold text-purple-600">
          {price} ETH
        </div>

        {/* Ticket expiré */}
        {isExpired && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Non valide</span>
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="p-4 space-y-2">
        <div className="text-lg font-bold">{name}</div>
        <div className="text-sm text-gray-600">{eventName}</div>

        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
          <Calendar className="w-4 h-4" />
          <span>{date}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <MapPin className="w-4 h-4" />
          <span>{place}</span>
        </div>

        {/* Type du ticket */}
        <div
          className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${
            type === "premium"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {type.toUpperCase()}
        </div>

        {/* État */}
        <div className="mt-2">
          {status === "en vente" ? (
            <span className="text-green-600 font-semibold text-sm">
              • En vente
            </span>
          ) : (
            <span className="text-gray-500 text-sm">Non vendu</span>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex space-x-2 mt-3">
          <button
            onClick={onTransfer}
            className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1 text-sm font-medium"
          >
            <Send className="w-4 h-4" />
            <span>Transférer</span>
          </button>
          
          <button
            onClick={onViewDetails}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1 text-sm font-medium"
          >
            <History className="w-4 h-4" />
            <span>Détails</span>
          </button>
        </div>
      </div>
    </div>
  );
}