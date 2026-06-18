import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/publico/HomePage';
import LoginPage from './pages/publico/LoginPage';
import RegisterPage from './pages/publico/RegisterPage';
import NotFoundPage from './pages/publico/NotFoundPage';
import PainelCliente from './pages/publico/PainelCliente';
import PainelTecnico from './pages/publico/PainelTecnico';
import PainelSupervisor from './pages/publico/PainelSupervisor';
import PainelAdmin from './pages/superadmin/PainelAdmin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/cliente/*" element={<PainelCliente />} />
        <Route path="/tecnico/*" element={<PainelTecnico />} />
        <Route path="/supervisor/*" element={<PainelSupervisor />} />
        <Route path="/admin/*" element={<PainelAdmin />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
