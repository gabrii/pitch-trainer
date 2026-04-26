import { Navigate, Route, Routes } from 'react-router-dom';
import { EXERCISES } from './exercises/registry';
import Layout from './layouts/Layout';
import ExerciseShell from './layouts/ExerciseShell';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={`/${EXERCISES[0].slug}`} replace />} />
        {EXERCISES.map(e => (
          <Route key={e.id} path={e.slug} element={<ExerciseShell descriptor={e} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
