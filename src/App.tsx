import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { EnvelopePage } from './pages/EnvelopePage';
import { AdminPage } from './pages/AdminPage';
import { PrintPage } from './pages/PrintPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/c/:id" element={<EnvelopePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/print" element={<PrintPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
