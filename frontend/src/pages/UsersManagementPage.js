import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { userService } from '../services/api';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const userValidationSchema = Yup.object({
  username: Yup.string().required('Nom d\'utilisateur requis'),
  email: Yup.string().email('Email invalide').required('Email requis'),
  first_name: Yup.string().required('Prénom requis'),
  last_name: Yup.string().required('Nom requis'),
  role: Yup.string().required('Rôle requis'),
  password: Yup.string().min(8, 'Au moins 8 caractères'),
});

export const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.data.results || response.data);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (values, { setSubmitting, resetForm }) => {
    try {
      await userService.create(values);
      resetForm();
      setShowForm(false);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
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
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">👥 Gestion des Utilisateurs</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              {showForm ? 'Annuler' : '+ Nouvel utilisateur'}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {showForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6">Créer un nouvel utilisateur</h2>
              <Formik
                initialValues={{
                  username: '',
                  email: '',
                  first_name: '',
                  last_name: '',
                  role: 'student',
                  password: '',
                  department: '',
                }}
                validationSchema={userValidationSchema}
                onSubmit={handleCreateUser}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom d'utilisateur
                        </label>
                        <Field
                          type="text"
                          name="username"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <ErrorMessage name="username" component="div" className="text-red-600 text-sm mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <Field
                          type="email"
                          name="email"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom
                        </label>
                        <Field
                          type="text"
                          name="first_name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <ErrorMessage name="first_name" component="div" className="text-red-600 text-sm mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom
                        </label>
                        <Field
                          type="text"
                          name="last_name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <ErrorMessage name="last_name" component="div" className="text-red-600 text-sm mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rôle
                        </label>
                        <Field
                          as="select"
                          name="role"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="student">Étudiant</option>
                          <option value="agent">Agent</option>
                          <option value="point_focal">Point Focal</option>
                          <option value="vice_doyen">Vice-Doyen</option>
                          <option value="adjoint_admin">Adjoint Admin</option>
                          <option value="admin">Administrateur</option>
                        </Field>
                        <ErrorMessage name="role" component="div" className="text-red-600 text-sm mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mot de passe
                        </label>
                        <Field
                          type="password"
                          name="password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      Créer l'utilisateur
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Nom</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Rôle</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.first_name} {user.last_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-sm">{getRoleLabel(user.role)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.is_active ? 'Actif' : 'Inactif'}
                          </span>
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

export default UsersManagementPage;
