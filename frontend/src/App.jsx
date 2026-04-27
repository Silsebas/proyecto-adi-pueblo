import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home'; 
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
        
        {/* Usamos el mismo componente ActivarCuenta para ambos flujos */}
        <Route path="/activar-cuenta/:token" element={<ActivarCuenta />} />
        <Route path="/reset-password/:token" element={<ActivarCuenta />} />
        
      </Routes>
    </Router>
  );
}

export default App;