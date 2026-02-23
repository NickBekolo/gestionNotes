import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { noteService, auditLogService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const PointFocalPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadNotes();
    loadLogs();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      // Filtrer par département
      const params = { department: user?.department_detail?.id };
      const response = await noteService.getAll(params);
      setNotes(response.data.results || response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des notes');
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const params = { user: user?.id };
      const response = await auditLogService.getAll(params);
      setLogs(response.data.results || response.data);
    } catch (err) {
      // ignore
    }
  };

  const handleSubmitNote = async (noteData) => {
    try {
      await noteService.create(noteData);
      setShowForm(false);
      await loadNotes();
    } catch (err) {
      setError('Erreur lors de la saisie');
    }
  };

  const handleRequestValidation = async (noteId) => {
    try {
      await noteService.update(noteId, { status: 'pending' });
      await loadNotes();
    } catch (err) {
      setError('Erreur lors de la demande de validation');
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">👨‍🏫 Espace Point Focal</h1>
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

          <div className="mb-8">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              {showForm ? 'Annuler saisie' : '+ Saisir une note'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              {/* Formulaire de saisie de note (à compléter selon le modèle Note) */}
              <p className="mb-4 text-lg font-semibold text-gray-700">Formulaire de saisie de note</p>
              {/* ...formulaire à compléter... */}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Notes de mon département</h2>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Étudiant</th>
                  <th className="px-4 py-2">Matière</th>
                  <th className="px-4 py-2">Note</th>
                  <th className="px-4 py-2">Statut</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notes.map(note => (
                  <tr key={note.id} className="border-b">
                    <td className="px-4 py-2">{note.student_detail?.full_name}</td>
                    <td className="px-4 py-2">{note.subject}</td>
                    <td className="px-4 py-2">{note.value}</td>
                    <td className="px-4 py-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        note.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        note.status === 'validated' ? 'bg-green-100 text-green-800' :
                        note.status === 'final_validated' ? 'bg-blue-100 text-blue-800' :
                        note.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {note.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {note.status === 'draft' && (
                        <button
                          onClick={() => handleRequestValidation(note.id)}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs"
                        >
                          Demander validation
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🕒 Historique de mes actions</h2>
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="bg-gray-50 p-4 rounded border-l-4 border-blue-500">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{log.action_type}</p>
                      <p className="text-gray-600 text-sm">{log.model_name} ({log.object_id})</p>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {new Date(log.created_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PointFocalPage;
