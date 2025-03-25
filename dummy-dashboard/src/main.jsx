import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
// import App from './App.jsx'; // ⛔️ Comment out App
import Dashboard from './components/Dashboard'; // ✅ Import new dashboard

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <Dashboard /> {/* ✅ Now rendering only Dashboard */}
  </StrictMode>,
);
