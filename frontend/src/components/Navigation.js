import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Navigation = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    const roles = {
      admin: 'Administrateur',
      adjoint_admin: 'Adjoint Admin',
      point_focal: 'Point Focal',
      agent: 'Agent',
      vice_doyen: 'Vice-Doyen',
      student: 'Étudiant',
    };
    return roles[role] || role;
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">📚 Gestion des Notes</h1>
          </div>

          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold">{user?.first_name} {user?.last_name}</p>
                <p className="text-sm text-blue-200">{getRoleLabel(user?.role)}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition"
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
