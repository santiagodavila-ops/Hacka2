import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SignalDetailPage } from "./pages/SignalDetailPage";

function App() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Privadas: solo entran con sesión válida */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/signals/:id" element={<SignalDetailPage />} />

          {/* === AQUÍ van las rutas de tus compañeros (B y C) ===
              <Route path="/tropels" element={<TropelsPage />} />
              <Route path="/signals/feed" element={<SignalsFeedPage />} />
              <Route path="/sectors/:id/story" element={<SectorStoryPage />} />
          */}
        </Route>
      </Route>

      {/* Cualquier otra ruta -> dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
