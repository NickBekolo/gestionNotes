import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { studentService } from '../services/api';

export const StudentsListPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    is_solvable: '',
  });

  useEffect(() => {
    loadStudents();
  }, [filters]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.department) params.department = filters.department;
      if (filters.is_solvable !== '') params.is_solvable = filters.is_solvable === 'true';

      const response = await studentService.getAll(params);
      setStudents(response.data.results || response.data);
    } catch (err) {
      setError('Erreur lors du chargement des étudiants');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSolvability = async (studentId, currentStatus) => {
    try {
      await studentService.setSolvability(studentId, !currentStatus);
      await loadStudents();
    } catch (err) {
      setError('Erreur lors de la mise à jour');
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">👨‍🎓 Gestion des Étudiants</h1>

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
                  Département
                </label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Tous les départements</option>
                  <option value="1">Informatique</option>
                  <option value="2">Génie Civil</option>
                  <option value="3">Électrotechnique</option>
                  <option value="4">Mécanique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Solvabilité
                </label>
                <select
                  value={filters.is_solvable}
                  onChange={(e) => setFilters({ ...filters, is_solvable: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Tous</option>
                  <option value="true">Solvables</option>
                  <option value="false">Non solvables</option>
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
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Matricule</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Nom</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Département</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Solvabilité</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {student.matricule}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{student.full_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {student.department_detail?.name}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              student.is_solvable
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {student.is_solvable ? '✓ Solvable' : '✗ Non solvable'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleToggleSolvability(student.id, student.is_solvable)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Changer
                          </button>
                        </td>
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

export default StudentsListPage;
