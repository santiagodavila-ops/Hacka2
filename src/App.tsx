import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SignalDetailPage } from "./pages/SignalDetailPage";
import { TropelsPage } from "./pages/TropelsPage";
import { SignalsFeedPage } from "./pages/SignalsFeedPage";
import { SectorStoryPage } from "./pages/SectorStoryPage";

function App() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Privadas: solo entran con sesión válida */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
        {/* C - Checkpoint 5: Sector Story Engine */}
          <Route path="/sectors/:id/story" element={<SectorStoryPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* B - Checkpoint 2: Atlas de Tropeles */}
          <Route path="/tropels" element={<TropelsPage />} />

          {/* B - Checkpoint 5: Sector Story Engine */}
          <Route path="/sectors/:id/story" element={<SectorStoryPage />} />

          {/* B - Checkpoint 3: Feed de Señales con detalle anidado */}
          <Route path="/signals/feed" element={<SignalsFeedPage />}>
            <Route path=":id" element={<SignalDetailPage />} />
          </Route>

          <Route path="/signals/:id" element={<SignalDetailPage />} />

          {/* C - Checkpoint 5: Sector Story Engine (scrollytelling) */}
          <Route path="/sectors/:id/story" element={<SectorStoryPage />} />
        </Route>
      </Route>

      {/* Cualquier otra ruta -> dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;