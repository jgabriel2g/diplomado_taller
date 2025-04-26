import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCarrito } from "../Context/CarritoContext";

const Detalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCarrito();
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    obtenerProducto();
  }, [id]);

  const obtenerProducto = async () => {
    try {
      const response = await fetch(`https://fakestoreapi.com/products/${id}`);
      const data = await response.json();
      setProducto(data);
    } catch (error) {
      setError("Error al cargar el producto");
    } finally {
      setLoading(false);
    }
  };

  const handleCantidadChange = (value) => {
    const newCantidad = cantidad + value;
    if (newCantidad >= 1 && newCantidad <= 3) {
      setCantidad(newCantidad);
    }
  };

  const handleAgregarAlCarrito = () => {
    if (producto) {
      agregarAlCarrito(producto, cantidad);
      setSuccess("Producto agregado al carrito");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Producto no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Imagen del producto */}
            <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={producto.image}
                alt={producto.title}
                className="w-full h-full object-contain p-8"
              />
            </div>

            {/* Información del producto */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {producto.title}
                </h1>
                <p className="text-gray-500 mb-6">{producto.description}</p>
                <div className="flex items-center mb-6">
                  <span className="text-3xl font-bold text-blue-600">
                    ${producto.price}
                  </span>
                  <span className="ml-4 text-sm text-gray-500">
                    Categoría: {producto.category}
                  </span>
                </div>
              </div>

              {/* Controles de cantidad y botón de agregar */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">
                    Cantidad:
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCantidadChange(-1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{cantidad}</span>
                    <button
                      onClick={() => handleCantidadChange(1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    (Máximo 3 unidades)
                  </span>
                </div>

                {success && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">{success}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={handleAgregarAlCarrito}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-300"
                  >
                    Agregar al carrito
                  </button>
                  <button
                    onClick={() => navigate("/productos")}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                  >
                    Volver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detalle;
