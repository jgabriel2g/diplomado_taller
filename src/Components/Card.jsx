import React from "react";
import { Link } from "react-router-dom";
import { useCarrito } from "../Context/CarritoContext";

const Card = ({ image, title, price, description, id }) => {
  const { agregarAlCarrito } = useCarrito();

  const handleAgregarAlCarrito = () => {
    agregarAlCarrito({ id, image, title, price, description }, 1);
  };

  return (
    <div className="group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="relative h-48 bg-gray-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 opacity-50"></div>
        <img
          src={image}
          alt={title}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 relative z-10"
        />
      </div>
      <div className="p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
          {title}
        </h4>
        {description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex flex-col space-y-3">
          <span className="text-2xl font-bold text-blue-600">${price}</span>
          <div className="flex space-x-2">
            <Link
              to={`/productos/${id}`}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-full transition-colors duration-300 text-center"
            >
              Ver detalles
            </Link>
            <button
              onClick={handleAgregarAlCarrito}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors duration-300 flex items-center justify-center space-x-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Agregar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
