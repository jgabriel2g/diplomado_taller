import React from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../Context/CarritoContext";

const FloatingCartButton = () => {
  const navigate = useNavigate();
  const { carrito } = useCarrito();

  // Calcular el total de productos en el carrito
  const totalProductos = carrito.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  return (
    <button
      onClick={() => navigate("/carrito")}
      className={`fixed bottom-6 left-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2 z-50 ${
        totalProductos > 0 ? "animate-bounce-subtle" : ""
      }`}
    >
      <div className="relative">
        <svg
          className={`w-6 h-6 transition-transform duration-300 ${
            totalProductos > 0 ? "animate-pulse" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {totalProductos > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {totalProductos}
          </span>
        )}
      </div>
      <span>Ver carrito</span>
    </button>
  );
};

export default FloatingCartButton;
