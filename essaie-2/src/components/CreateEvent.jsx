import React, { useState } from 'react';
import { X, Upload, Trash2, Plus } from 'lucide-react';

const CreateEvent = ({ isOpen, onClose }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [ticketCategories, setTicketCategories] = useState([
    { type: 'Standard', price: '', quantity: '' },
  ]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewImage(url);
  };

  const addCategory = () => {
    setTicketCategories([
      ...ticketCategories,
      { type: 'Standard', price: '', quantity: '' },
    ]);
  };

  const removeCategory = (index) => {
    if (ticketCategories.length > 1) {
      setTicketCategories(ticketCategories.filter((_, i) => i !== index));
    }
  };

  const updateCategory = (index, field, value) => {
    const newCats = [...ticketCategories];
    newCats[index][field] = value;
    setTicketCategories(newCats);
  };

  const createEvent = () => {
    alert('Événement créé ! (bientôt Web3)');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl z-10">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-3xl font-bold text-gray-900">
            Créer un nouvel événement
          </h2>
          <p className="text-gray-600 mt-1">
            Remplissez les informations de votre événement
          </p>
        </div>

        <div className="p-8 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Image de l'événement
            </label>
            <div className="relative">
              {previewImage ? (
                <div className="relative w-full h-64 rounded-xl overflow-hidden group">
                  <img
                    src={previewImage}
                    alt="Prévisualisation"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                      Changer l'image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition-all">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <span className="text-gray-600 font-medium">
                    Cliquez pour uploader une image
                  </span>
                  <span className="text-gray-400 text-sm mt-1">
                    PNG, JPG jusqu'à 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Event Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Nom de l'événement
            </label>
            <input
              type="text"
              placeholder="Ex: Concert Coldplay 2025"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Date and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Date de l'événement
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Lieu de l'événement
              </label>
              <input
                type="text"
                placeholder="Ex: Paris - Accor Arena"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Description
            </label>
            <textarea
              placeholder="Décrivez votre événement..."
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Ticket Categories */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Catégories de tickets
                </h3>
                <p className="text-sm text-gray-600">
                  Définissez les différents types de billets
                </p>
              </div>
              <button
                onClick={addCategory}
                className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>

            <div className="space-y-4">
              {ticketCategories.map((cat, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Type
                        </label>
                        <select
                          value={cat.type}
                          onChange={(e) =>
                            updateCategory(index, 'type', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        >
                          <option value="VIP">VIP</option>
                          <option value="Premium">Premium</option>
                          <option value="Standard">Standard</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Prix (ETH)
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.05"
                          value={cat.price}
                          onChange={(e) =>
                            updateCategory(index, 'price', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Quantité
                        </label>
                        <input
                          type="number"
                          placeholder="100"
                          value={cat.quantity}
                          onChange={(e) =>
                            updateCategory(
                              index,
                              'quantity',
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                    {ticketCategories.length > 1 && (
                      <button
                        onClick={() => removeCategory(index)}
                        className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={createEvent}
            className="w-full bg-linear-to-r from-purple-600 to-blue-500 text-white py-4 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 font-semibold text-lg"
          >
            Créer l'événement
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;