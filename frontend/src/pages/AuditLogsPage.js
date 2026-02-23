import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { auditLogService } from '../services/api';

export const AuditLogsPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    action_type: '',
    model_name: '',
  });

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.action_type) params.action_type = filters.action_type;
      if (filters.model_name) params.model_name = filters.model_name;

      const response = await auditLogService.getAll(params);
      setLogs(response.data.results || response.data);
    } catch (err) {
      setError('Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    const badges = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      validate: 'bg-purple-100 text-purple-800',
      reject: 'bg-orange-100 text-orange-800',
      import: 'bg-indigo-100 text-indigo-800',
      export: 'bg-pink-100 text-pink-800',
      login: 'bg-gray-100 text-gray-800',
    };
    return badges[action] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">📜 Journal d'Audit</h1>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              ← Retour
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'action
                </label>
                <select
                  value={filters.action_type}
                  onChange={(e) => setFilters({ ...filters, action_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Tous les types</option>
                  <option value="create">Création</option>
                  <option value="update">Modification</option>
                  <option value="delete">Suppression</option>
                  <option value="validate">Validation</option>
                  <option value="reject">Rejet</option>
                  <option value="import">Import</option>
                  <option value="export">Export</option>
                  <option value="login">Connexion</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modèle
                </label>
                <select
                  value={filters.model_name}
                  onChange={(e) => setFilters({ ...filters, model_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Tous les modèles</option>
                  <option value="User">Utilisateur</option>
                  <option value="Student">Étudiant</option>
                  <option value="Note">Note</option>
                  <option value="PV">PV</option>
                  <option value="Department">Département</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tableau */}
          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Utilisateur</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Action</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Modèle</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Objet</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(log.created_at).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {log.user_detail?.username || 'Système'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action_type)}`}>
                            {log.action_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{log.model_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{log.object_repr}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{log.ip_address || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AuditLogsPage;
