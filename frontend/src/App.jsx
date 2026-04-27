import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home'; // 👈 Aquí usamos el nuevo
import Login from './components/Login/Login'; 
import Dashboard from './components/Dashboard/Dashboard';
import ActivarCuenta from './components/ActivarCuenta/ActivarCuenta';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/activar-cuenta/:token" element={<ActivarCuenta />} />
      </Routes>
    </Router>
  );
}

export default App;