import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Profil utilisateur</h1>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
                <p className="mt-1 text-lg text-gray-900">{user?.username}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-lg text-gray-900">{user?.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <p className="mt-1 text-lg text-gray-900">{user?.first_name || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <p className="mt-1 text-lg text-gray-900">{user?.last_name || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Rôle</label>
                <p className="mt-1 text-lg text-gray-900">{user?.role}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Département</label>
                <p className="mt-1 text-lg text-gray-900">{user?.department_detail?.name || 'N/A'}</p>
              </div>
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

export default ProfilePage;
