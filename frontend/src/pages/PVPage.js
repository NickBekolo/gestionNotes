import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

export const PVPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Procès-verbaux (PV)</h1>
            <p className="text-gray-600">
              {user?.role === 'agent' 
                ? 'Ici vous pouvez imprimer et consulter les procès-verbaux.'
                : 'Ici vous pouvez gérer et valider les procès-verbaux.'}
            </p>
            <div className="mt-8 text-center">
              <p className="text-gray-500">Fonctionnalité en développement...</p>
            </div>
            
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                ← Retour
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PVPage;
