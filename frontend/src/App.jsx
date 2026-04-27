import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home'; 
import Login from './components/Login/Login'; 
import Dashboard from './components/Dashboard/Dashboard';
import ActivarCuenta from './components/ActivarCuenta/ActivarCuenta';
import NuevoPassword from './components/Login/NuevoPassword'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/activar-cuenta/:token" element={<ActivarCuenta />} />
        <Route path="/reset-password/:token" element={<NuevoPassword />} />
        
      </Routes>
    </Router>
  );
}

export default App;