import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { noteService, studentService } from '../services/api';

export const NotesListPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    period: '',
    search: '',
  });

  useEffect(() => {
    loadNotes();
  }, [filters]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.period) params.period = filters.period;
      if (filters.search) params.search = filters.search;

      const response = await noteService.getAll(params);
      setNotes(response.data.results || response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      validated: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'En attente',
      validated: 'Validée',
      rejected: 'Rejetée',
    };
    return {
      className: badges[status] || 'bg-gray-100 text-gray-800',
      label: labels[status] || status,
    };
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">📋 Notes</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="validated">Validée</option>
                  <option value="rejected">Rejetée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Période
                </label>
                <select
                  value={filters.period}
                  onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Toutes les périodes</option>
                  <option value="Semestre 1">Semestre 1</option>
                  <option value="Semestre 2">Semestre 2</option>
                  <option value="CC1">CC1</option>
                  <option value="CC2">CC2</option>
                  <option value="Examen">Examen</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Nom ou matière..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Tableau */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="text-center py-12">Chargement...</div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12 text-gray-600">Aucune note trouvée</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Étudiant</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Matière</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Note</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Période</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Statut</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {notes.map((note) => {
                      const badge = getStatusBadge(note.status);
                      return (
                        <tr key={note.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {note.student_detail?.full_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{note.subject}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {note.value}/20
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{note.period}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(note.created_at).toLocaleDateString('fr-FR')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotesListPage;
