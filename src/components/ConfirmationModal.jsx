import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
  type = 'warning' // warning, danger, info
}) {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          gradient: 'from-red-600 to-rose-500',
          icon: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200'
        };
      case 'info':
        return {
          gradient: 'from-blue-600 to-indigo-500',
          icon: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200'
        };
      default: // warning
        return {
          gradient: 'from-amber-600 to-orange-500',
          icon: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center z-50 p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Decorative gradient bar */}
        <div className={`h-2 bg-linear-to-r ${colors.gradient}`} />

        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 ${colors.border}`}>
            <AlertTriangle className={`w-8 h-8 ${colors.icon}`} />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 text-center leading-relaxed mb-8">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-6 py-3 bg-linear-to-r ${colors.gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}