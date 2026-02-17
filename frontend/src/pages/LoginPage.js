import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const loginValidationSchema = Yup.object({
  username: Yup.string().required('Nom d\'utilisateur requis'),
  password: Yup.string().required('Mot de passe requis'),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await login(values.username, values.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Identifiants invalides. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📚</h1>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Notes</h2>
          <p className="text-gray-600 mt-2">Système de gestion sécurisé</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={loginValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d'utilisateur
                </label>
                <Field
                  type="text"
                  name="username"
                  placeholder="Entrez votre nom d'utilisateur"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <ErrorMessage name="username" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <Field
                  type="password"
                  name="password"
                  placeholder="Entrez votre mot de passe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                {isSubmitting ? 'Connexion...' : 'Se connecter'}
              </button>
            </Form>
          )}
        </Formik>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            <strong>Utilisateurs de test:</strong>
            <br />
            admin / admin123
            <br />
            point_focal1 / pf123
            <br />
            agent1 / agent123
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
