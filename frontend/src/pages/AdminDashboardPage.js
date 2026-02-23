import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
// Ajout import pour departmentService
import { departmentService } from '../services/api';
import { userService, auditLogService } from '../services/api';

export const AdminDashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [delegationModal, setDelegationModal] = useState(false);
  const [delegationReason, setDelegationReason] = useState('');
  const [delegationDuration, setDelegationDuration] = useState(7);
  const [selectedLog, setSelectedLog] = useState(null);
  const [logDetailsModal, setLogDetailsModal] = useState(false);

  // Ajout state pour les départements
  const [departments, setDepartments] = useState([]);
  const [newUserDepartment, setNewUserDepartment] = useState('');
    // Ajout pour création de département
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [departmentCreationError, setDepartmentCreationError] = useState('');
    const handleCreateDepartment = async () => {
      if (!newDepartmentName.trim()) {
        setDepartmentCreationError('Le nom du département est obligatoire');
        return;
      }
      try {
        await departmentService.create({ name: newDepartmentName });
        setNewDepartmentName('');
        setDepartmentCreationError('');
        // Recharger la liste
        departmentService.getAll().then(res => {
          setDepartments(res.data.results || res.data);
        });
      } catch (err) {
        setDepartmentCreationError('Erreur lors de la création: ' + (err.response?.data?.error || err.message));
      }
    };
  // Ajout du formulaire de création utilisateur (exemple simplifié)
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', first_name: '', last_name: '', password: '', role: 'point_focal' });
  const handleCreateUser = async () => {
    if (!newUserDepartment) {
      setError('Le département est obligatoire');
      return;
    }
    try {
      await userService.create({ ...newUser, department: newUserDepartment });
      setShowCreateUserModal(false);
      setNewUser({ username: '', email: '', first_name: '', last_name: '', password: '', role: 'point_focal' });
      setNewUserDepartment('');
      await loadData();
      setError('');
    } catch (err) {
      setError('Erreur lors de la création: ' + (err.response?.data?.error || err.message));
    }
  };
  // Charger les départements au montage
  useEffect(() => {
    departmentService.getAll().then(res => {
      const deps = res.data.results || res.data;
      console.log('Départements reçus:', deps);
      setDepartments(deps);
    });
  }, []);
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      setLoading(true);
      const usersResponse = await userService.getAll();
      const userData = Array.isArray(usersResponse.data) ? usersResponse.data : (usersResponse.data.results || []);
      setUsers(userData);
      
      const logsResponse = await auditLogService.getAll({ limit: 20 });
      const logsData = Array.isArray(logsResponse.data) ? logsResponse.data : (logsResponse.data.results || []);
      setLogs(logsData);
      setError('');
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await userService.activateUser(userId);
      setError('');
      await loadData();
    } catch (err) {
      console.error('Error activating user:', err);
      setError('Erreur lors de l\'activation: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeactivateUser = async (userId) => {
    try {
      await userService.deactivateUser(userId);
      setError('');
      await loadData();
    } catch (err) {
      console.error('Error deactivating user:', err);
      setError('Erreur lors de la désactivation: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelegatePrivileges = async (adjointId) => {
    try {
      await userService.delegatePrivileges(adjointId, delegationReason, delegationDuration);
      setError('');
      setDelegationModal(false);
      setDelegationReason('');
      setDelegationDuration(7);
      await loadData();
    } catch (err) {
      console.error('Error delegating privileges:', err);
      setError('Erreur lors de la délégation: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleRevokeDelegation = async (adjointId) => {
    try {
      await userService.revokeDelegation(adjointId);
      setError('');
      await loadData();
    } catch (err) {
      console.error('Error revoking delegation:', err);
      setError('Erreur lors du retrait de délégation: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
              {/* Bouton pour ouvrir le modal de création */}
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                onClick={() => setShowCreateUserModal(true)}
              >
                Créer un utilisateur
              </button>
              {/* Modal de création utilisateur */}
              {showCreateUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Créer un utilisateur</h3>
                    <div className="space-y-4">
                                            {/* Formulaire création département */}
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                                              <div className="mb-2 font-semibold text-blue-700">Créer un nouveau département</div>
                                              <div className="flex gap-2 mb-2">
                                                <input type="text" placeholder="Nom du département" value={newDepartmentName} onChange={e => setNewDepartmentName(e.target.value)} className="flex-1 px-2 py-1 border border-gray-300 rounded" />
                                                <button onClick={handleCreateDepartment} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Créer</button>
                                              </div>
                                              {departmentCreationError && <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded">{departmentCreationError}</div>}
                                            </div>
                      <input type="text" placeholder="Nom d'utilisateur" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                      <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                      <input type="text" placeholder="Prénom" value={newUser.first_name} onChange={e => setNewUser({ ...newUser, first_name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                      <input type="text" placeholder="Nom" value={newUser.last_name} onChange={e => setNewUser({ ...newUser, last_name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                      <input type="password" placeholder="Mot de passe" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                      {/* Affichage temporaire pour debug */}
                      <div style={{background:'#f9fafb',border:'1px solid #ddd',padding:'8px',marginBottom:'8px'}}>
                        <strong>Départements chargés :</strong>
                        <pre style={{fontSize:'12px',maxHeight:'100px',overflow:'auto'}}>{JSON.stringify(departments,null,2)}</pre>
                      </div>
                      {/* Champ département obligatoire */}
                      <select value={newUserDepartment} onChange={e => setNewUserDepartment(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                        <option value="">Sélectionner un département</option>
                        {departments.map(dep => (
                          <option key={dep.id} value={dep.id}>{dep.name}</option>
                        ))}
                      </select>
                      <button onClick={handleCreateUser} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">Créer</button>
                      <button onClick={() => setShowCreateUserModal(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded w-full mt-2">Annuler</button>
                      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-2">{error}</div>}
                    </div>
                  </div>
                </div>
              )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Tableau de Bord Administrateur</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Section Gestion des Utilisateurs */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">👥 Gestion des Utilisateurs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">Utilisateur</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Rôle</th>
                    <th className="px-4 py-2">Statut</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b">
                      <td className="px-4 py-2 font-medium">{user.username}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">{user.role}</td>
                      <td className="px-4 py-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-2 space-x-2">
                        {user.is_active ? (
                          <button
                            onClick={() => handleDeactivateUser(user.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                          >
                            Désactiver
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(user.id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                          >
                            Activer
                          </button>
                        )}
                        {user.role === 'adjoint_admin' && (
                          user.delegation_info ? (
                            <button
                              onClick={() => handleRevokeDelegation(user.id)}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs"
                            >
                              Retirer délégation
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedUser(user.id);
                                setDelegationModal(true);
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                            >
                              Déléguer
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section Logs de Sécurité */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔒 Logs de Sécurité Récents</h2>
            <div className="space-y-3">
              {logs.slice(0, 10).map(log => (
                <div key={log.id} className="bg-gray-50 p-4 rounded border-l-4 border-blue-500">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{log.user_username} - {log.action_type}</p>
                      <p className="text-gray-600 text-sm">{log.model_name} ({log.object_id})</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-500 text-sm whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('fr-FR')}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setLogDetailsModal(true);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs whitespace-nowrap"
                      >
                        Détails
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Délégation */}
          {delegationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Déléguer les Privilèges</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raison de la délégation
                    </label>
                    <textarea
                      value={delegationReason}
                      onChange={(e) => setDelegationReason(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée (jours)
                    </label>
                    <input
                      type="number"
                      value={delegationDuration}
                      onChange={(e) => setDelegationDuration(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        handleDelegatePrivileges(selectedUser);
                      }}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Déléguer
                    </button>
                    <button
                      onClick={() => setDelegationModal(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Détails du Log */}
          {logDetailsModal && selectedLog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">📋 Détails de l'Action</h3>
                
                <div className="space-y-4">
                  {/* Informations principales */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Utilisateur</p>
                      <p className="text-lg font-semibold text-gray-800">{selectedLog.user_username}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Type d'Action</p>
                      <p className="text-lg font-semibold text-blue-600">{selectedLog.action_type}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Modèle</p>
                      <p className="text-lg font-semibold text-gray-800">{selectedLog.model_name}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-xs text-gray-500 uppercase font-semibold">ID Objet</p>
                      <p className="text-lg font-semibold text-gray-800">{selectedLog.object_id}</p>
                    </div>
                  </div>

                  {/* Description de l'objet */}
                  {selectedLog.object_repr && (
                    <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Description</p>
                      <p className="text-gray-800">{selectedLog.object_repr}</p>
                    </div>
                  )}

                  {/* Date et Adresse IP */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Date/Heure</p>
                      <p className="text-sm font-mono text-gray-800">
                        {new Date(selectedLog.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    {selectedLog.ip_address && (
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Adresse IP</p>
                        <p className="text-sm font-mono text-gray-800">{selectedLog.ip_address}</p>
                      </div>
                    )}
                  </div>

                  {/* Détails avant */}
                  {selectedLog.details_before && Object.keys(selectedLog.details_before).length > 0 && (
                    <div className="bg-red-50 p-4 rounded border-l-4 border-red-500">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Avant la modification</p>
                      <pre className="text-xs bg-white p-2 rounded overflow-x-auto border border-red-200">
                        {JSON.stringify(selectedLog.details_before, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Détails après */}
                  {selectedLog.details_after && Object.keys(selectedLog.details_after).length > 0 && (
                    <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Après la modification</p>
                      <pre className="text-xs bg-white p-2 rounded overflow-x-auto border border-green-200">
                        {JSON.stringify(selectedLog.details_after, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* User Agent */}
                  {selectedLog.user_agent && (
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Navigateur</p>
                      <p className="text-xs text-gray-700 break-words">{selectedLog.user_agent}</p>
                    </div>
                  )}
                </div>

                {/* Bouton Fermer */}
                <div className="mt-6">
                  <button
                    onClick={() => setLogDetailsModal(false)}
                    className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-medium"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;

