import React, { useState } from 'react';
import { X, Clock, MapPin } from 'lucide-react';

const DetailsEvent = ({ isOpen, event, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="relative h-64 overflow-hidden">
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              {event.name}
            </h2>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="flex items-center text-purple-600 mb-1">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Date</span>
              </div>
              <p className="font-semibold text-gray-900">
                {event.date}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-center text-blue-600 mb-1">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Lieu</span>
              </div>
              <p className="font-semibold text-gray-900">
                {event.location}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {event.description ||
                'Aucune description disponible pour cet événement.'}
            </p>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Royalities
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {event.royalties ||
                'Aucune royalties disponible pour cet événement.'}
            </p>
          </div>

          {/* Ticket Categories Section */}
          <div className="bg-linear-to-r from-purple-50 to-blue-50 p-6 rounded-xl mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Types de billets
            </h3>

            <div className="space-y-3">
              {event.ticketCategories?.map((cat, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedCategory(cat.type)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all
                    ${selectedCategory === cat.type
                      ? 'border-purple-500 bg-white shadow-md'
                      : 'border-gray-200 hover:border-purple-400 bg-white/50'
                    }
                  `}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">{cat.type}</p>
                      <p className="text-xl font-bold text-gray-900">
                        {cat.price} ETH
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">Disponibles</p>
                      <p className="text-xl font-bold text-gray-900">
                        {cat.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="w-full bg-linear-to-r from-green-600 to-emerald-500 text-white py-4 rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 font-semibold text-lg"
            onClick={() => {
              if (!selectedCategory) {
                alert('Veuillez sélectionner un type de billet.');
                return;
              }
              alert(`Achat du billet ${selectedCategory} déclenché !`);
            }}
          >
            Acheter maintenant
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsEvent;