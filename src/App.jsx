import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Inicio from "./Pages/Inicio";
import Productos from "./Pages/Productos";
import Detalle from "./Pages/Detalle";
import Error from "./Pages/Error";
import Navbar from "./Pages/Navbar";
import Carrito from "./Pages/Carrito";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";
import Cupones from "./Pages/Cupones";
import Stock from "./Pages/Stock";
import { CarritoProvider } from "./Context/CarritoContext";
import { AuthProvider } from "./Context/AuthContext";
import { ComprasProvider } from "./Context/ComprasContext";
import { CuponesProvider } from "./Context/CuponesContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import PublicRoute from "./Components/PublicRoute";
import FloatingCartButton from "./Components/FloatingCartButton";

function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <ComprasProvider>
          <CuponesProvider>
            <Router>
              <Navbar />
              <main className="pt-16">
                <Routes>
                  {/* Rutas públicas */}
                  <Route path="/" element={<Inicio />} />
                  <Route path="/productos" element={<Productos />} />
                  <Route path="/productos/:id" element={<Detalle />} />

                  {/* Rutas públicas que requieren no estar autenticado */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    }
                  />

                  {/* Rutas protegidas */}
                  <Route
                    path="/carrito"
                    element={
                      <ProtectedRoute>
                        <Carrito />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/perfil"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cupones"
                    element={
                      <ProtectedRoute>
                        <Cupones />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/stock"
                    element={
                      <ProtectedRoute>
                        <Stock />
                      </ProtectedRoute>
                    }
                  />

                  {/* Ruta de error */}
                  <Route path="*" element={<Error />} />
                </Routes>
              </main>
              <FloatingCartButton />
            </Router>
          </CuponesProvider>
        </ComprasProvider>
      </CarritoProvider>
    </AuthProvider>
  );
}

export default App;
