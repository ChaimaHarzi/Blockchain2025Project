import React from 'react';
import { Clock, MapPin } from 'lucide-react';

const EventCard = ({ event, onOpenDialog }) => {
  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      <div className="relative overflow-hidden">
        <img
          src={event.image}
          alt={event.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-purple-600">
          {event.minPrice} ETH
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
          {event.name}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <Clock className="w-4 h-4 mr-2 text-purple-500" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-purple-500" />
            <span>{event.location}</span>
          </div>
        </div>

        {event.ticketsAvailable && event.totalTickets && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">
                Billets disponibles
              </span>
              <span className="font-semibold text-gray-900">
                {event.ticketsAvailable}/{event.totalTickets}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-linear-to-r from-purple-600 to-blue-500 h-2 rounded-full transition-all"
                style={{
                  width: `${(event.ticketsAvailable / event.totalTickets) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        <button
          onClick={() => onOpenDialog(event)}
          className="w-full bg-linear-to-r from-purple-600 to-blue-500 text-white py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 font-medium"
        >
          Voir détails
        </button>
      </div>
    </div>
  );
};

export default EventCard;