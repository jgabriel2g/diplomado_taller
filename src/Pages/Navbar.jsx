import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h1 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">
              E-Commerce Diplomado
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
            >
              Inicio
            </Link>
            <Link
              to="/productos"
              className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
            >
              Productos
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                {user.rol === "admin" && (
                  <Link
                    to="/stock"
                    className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
                  >
                    Stock
                  </Link>
                )}
                <Link
                  to="/perfil"
                  className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
                >
                  Perfil
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-all duration-300 text-white font-medium"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </nav>
          <button className="md:hidden text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
