import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getRoleDescription = (role) => {
    const descriptions = {
      admin: 'Accès administrateur complet - Gestion utilisateurs, audit, validations finales',
      adjoint_admin: 'Accès administratif temporaire - Suivi notes et audit complet',
      point_focal: 'Import et validation préliminaire des notes départementales',
      agent: 'Impression/corrections mineures - Accès limité aux PV',
      vice_doyen: 'Visa corrections et validations hiérarchiques',
      student: 'Consultation de vos notes si vous êtes solvable',
    };
    return descriptions[role] || 'Accès standard';
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Bienvenue */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Bienvenue, {user?.first_name}! 
            </h1>
            <p className="text-gray-600 text-lg mb-4">
              {getRoleDescription(user?.role)}
            </p>
          </div>

          {/* Menu de navigation rapide */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user?.role === 'point_focal' && (
              <>
                <MenuCard
                  title=" Saisir une note"
                  description="Ajouter une nouvelle note pour votre département"
                  onClick={() => navigate('/point-focal?saisie=1')}
                />
                <MenuCard
                  title=" Voir mes notes"
                  description="Consulter toutes les notes de votre département"
                  onClick={() => navigate('/point-focal?notes=1')}
                />
                <MenuCard
                  title=" Demander validation"
                  description="Demander la validation des notes en brouillon"
                  onClick={() => navigate('/point-focal?validation=1')}
                />
                <MenuCard
                  title=" Historique de mes actions"
                  description="Voir l'historique de vos actions sur les notes"
                  onClick={() => navigate('/point-focal?historique=1')}
                />
              </>
            )}

            {(['admin', 'adjoint_admin'].includes(user?.role)) && (
              <>
                <MenuCard
                  title=" Tableau de Bord Admin"
                  description="Gestion système, délégations, supervision"
                  onClick={() => navigate('/admin-dashboard')}
                />
                <MenuCard
                  title=" Gestion utilisateurs"
                  description="Créer et gérer les utilisateurs du système"
                  onClick={() => navigate('/users')}
                />
                <MenuCard
                  title=" Audit logs"
                  description="Consulter l'historique complet des actions"
                  onClick={() => navigate('/audit-logs')}
                />
                <MenuCard
                  title=" Gestion étudiants"
                  description="Consulter et modifier la liste des étudiants"
                  onClick={() => navigate('/students')}
                />
              </>
            )}

            {user?.role === 'vice_doyen' && (
              <>
                <MenuCard
                  title=" Procès-verbaux"
                  description="Valider les procès-verbaux"
                  onClick={() => navigate('/pvs')}
                />
                <MenuCard
                  title=" Validation notes"
                  description="Valider ou rejeter les notes"
                  onClick={() => navigate('/notes')}
                />
              </>
            )}

            {user?.role === 'agent' && (
              <>
                <MenuCard
                  title=" Procès-verbaux"
                  description="Imprimer et consulter les PV"
                  onClick={() => navigate('/pvs')}
                />
                <MenuCard
                  title=" Consulter notes"
                  description="Consulter les notes validées"
                  onClick={() => navigate('/notes')}
                />
              </>
            )}

            {user?.role === 'student' && (
              <MenuCard
                title=" Mes notes"
                description="Consulter vos notes"
                onClick={() => navigate('/notes')}
              />
            )}

            <MenuCard
              title=" Profil"
              description="Gérer votre profil utilisateur"
              onClick={() => navigate('/profile')}
            />
          </div>

          {/* Quick Stats */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Informations rapides</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="px-4 py-5 bg-gray-50 shadow rounded-lg">
                  <dt className="text-sm font-medium text-gray-500 truncate">Rôle</dt>
                  <dd className="mt-1 text-3xl font-extrabold text-gray-900">{user?.role}</dd>
                </div>
                <div className="px-4 py-5 bg-gray-50 shadow rounded-lg">
                  <dt className="text-sm font-medium text-gray-500 truncate">Département</dt>
                  <dd className="mt-1 text-3xl font-extrabold text-gray-900">
                    {user?.department_detail?.name || 'N/A'}
                  </dd>
                </div>
                <div className="px-4 py-5 bg-gray-50 shadow rounded-lg">
                  <dt className="text-sm font-medium text-gray-500 truncate">Email</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">{user?.email}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const MenuCard = ({ title, description, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-transform text-left"
  >
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </button>
);

export default DashboardPage;
