import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EcoMap from './components/Map';
import { useAuthStore } from './store/useAuthStore';

const queryClient = new QueryClient();

// A simple dashboard placeholder for the authenticated state
function Dashboard() {
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);

  return (
    <div className="min-h-screen flex flex-col text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 p-4 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl ">
            EcoAlerta
          </h1>
          <p className="text-sm text-zinc-400">Bienvenido, {user?.name}</p>
        </div>
        <button
          onClick={logout}
          className="bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 border border-red-500/20 px-5 py-2.5 space-x-2 rounded-xl transition-all"
        >
          Cerrar Sesión
        </button>
      </header>

      {/* Main content area */}
      <main className="flex-1 p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        <h2 className="text-xl font-bold text-zinc-100">Mapa de Alertas</h2>
        <div className="flex-1 min-h-[500px]">
          <EcoMap />
        </div>
      </main>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App;
