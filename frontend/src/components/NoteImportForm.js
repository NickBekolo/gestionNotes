import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { noteService, studentService } from '../services/api';

const noteValidationSchema = Yup.object({
  student: Yup.number().required('Étudiant requis'),
  subject: Yup.string().required('Matière requise'),
  value: Yup.number()
    .min(0, 'La note doit être ≥ 0')
    .max(20, 'La note doit être ≤ 20')
    .required('Note requise'),
  period: Yup.string().required('Période requise'),
});

export const NoteImportForm = ({ onSuccess }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await studentService.getAll();
        setStudents(response.data.results || response.data);
      } catch (err) {
        setError('Erreur lors du chargement des étudiants');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await noteService.create(values);
      resetForm();
      onSuccess?.('Note importée avec succès!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'import');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-4">Chargement...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Importer une Note</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Formik
        initialValues={{
          student: '',
          subject: '',
          value: '',
          period: '',
        }}
        validationSchema={noteValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Étudiant
              </label>
              <Field
                as="select"
                name="student"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Sélectionner un étudiant --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name} ({student.matricule})
                  </option>
                ))}
              </Field>
              <ErrorMessage name="student" component="div" className="text-red-600 text-sm mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matière
              </label>
              <Field
                type="text"
                name="subject"
                placeholder="Ex: Mathématiques"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage name="subject" component="div" className="text-red-600 text-sm mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (0-20)
                </label>
                <Field
                  type="number"
                  name="value"
                  step="0.5"
                  min="0"
                  max="20"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage name="value" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Période
                </label>
                <Field
                  as="select"
                  name="period"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="Semestre 1">Semestre 1</option>
                  <option value="Semestre 2">Semestre 2</option>
                  <option value="CC1">CC1</option>
                  <option value="CC2">CC2</option>
                  <option value="Examen">Examen</option>
                </Field>
                <ErrorMessage name="period" component="div" className="text-red-600 text-sm mt-1" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
            >
              {isSubmitting ? 'Import en cours...' : 'Importer la Note'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default NoteImportForm;
