import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const LoaderModal = ({ 
  isOpen, 
  message = 'Chargement en cours...', 
  type = 'loading',
  onClose 
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500 animate-pulse" />;
      case 'warning':
        return <AlertCircle className="w-16 h-16 text-amber-500 animate-pulse" />;
      default:
        return <Loader2 className="w-16 h-16 text-purple-600 animate-spin" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'success':
        return 'from-green-500 to-emerald-600';
      case 'error':
        return 'from-red-500 to-rose-600';
      case 'warning':
        return 'from-amber-500 to-orange-600';
      default:
        return 'from-purple-600 to-blue-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className={`absolute inset-0 ${type === 'error' ? 'bg-black/30 backdrop-blur-md' : 'bg-black/30 backdrop-blur-md'}`}
        onClick={type !== 'loading' ? onClose : undefined}
      />
      
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${getGradient()}`} />
        
        <div className="p-8 text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative mb-6 flex justify-center">
            <div className={`absolute inset-0 bg-gradient-to-r ${getGradient()} rounded-full opacity-20 blur-xl`} />
            {getIcon()}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {type === 'loading' && 'Chargement...'}
            {type === 'success' && 'Succès !'}
            {type === 'error' && 'Erreur'}
            {type === 'warning' && 'Attention'}
          </h3>
          
          <p className="text-gray-600 leading-relaxed">{message}</p>
          
          {type === 'loading' && (
            <div className="flex justify-center space-x-2 mt-6">
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          )}
          
          {type !== 'loading' && onClose && (
            <button
              onClick={onClose}
              className={`mt-6 w-full bg-gradient-to-r ${getGradient()} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300`}
            >
              {type === 'success' ? 'Continuer' : 'Fermer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};