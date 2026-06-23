import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItem =
  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout(): void {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-mono text-sm font-bold tracking-widest text-cyan-400">
              TROPELCARE<span className="text-slate-500">::CTRL</span>
            </span>
            <nav className="flex items-center gap-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `${navItem} ${isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`
                }
              >
                Dashboard
              </NavLink>
              {/* Estas rutas las construyen B y C. Los Links ya quedan listos: */}
              <NavLink
                to="/tropels"
                className={({ isActive }) =>
                  `${navItem} ${isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`
                }
              >
                Tropeles
              </NavLink>
              <NavLink
                to="/signals/feed"
                className={({ isActive }) =>
                  `${navItem} ${isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`
                }
              >
                Señales
              </NavLink>
              <NavLink
                to="/sectors/1/story"
                className={({ isActive }) =>
                  `${navItem} ${isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`
                }
              >
                Sectores
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-400 sm:block">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
