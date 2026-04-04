import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./components/ThemeToggle";
import Catalogo from "./components/Catalogo";
import AdminPanel from "./components/AdminPanel";
import Login from "./components/Login";

// Componente de ruta protegida
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F0E8] via-[#EDE6DB] to-[#E5DED3] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-12 h-12 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Catálogo público - Ruta principal */}
      <Route path="/" element={<Catalogo />} />
      
      {/* Panel de administración - Requiere autenticación */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      {/* Ruta de respaldo para cliente */}
      <Route path="/cliente" element={<Navigate to="/" replace />} />
      
      {/* Cualquier otra ruta redirige al catálogo */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
