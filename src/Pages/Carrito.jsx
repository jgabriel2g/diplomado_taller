import React, { useState } from "react";
import { useCarrito } from "../Context/CarritoContext";
import { useCompras } from "../Context/ComprasContext";
import { useCupones } from "../Context/CuponesContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Carrito = () => {
  const { carrito, eliminarDelCarrito, actualizarCantidad, limpiarCarrito } =
    useCarrito();
  const { guardarCompra } = useCompras();
  const { cupones, usarCupon } = useCupones();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cuponSeleccionado, setCuponSeleccionado] = useState(null);

  const handleCantidadChange = (producto, value) => {
    const newCantidad = producto.cantidad + value;
    if (newCantidad >= 1 && newCantidad <= 3) {
      actualizarCantidad(producto.id, newCantidad);
    }
  };

  const calcularSubtotal = () => {
    return carrito.reduce(
      (total, item) => total + item.price * item.cantidad,
      0
    );
  };

  const calcularDescuento = () => {
    if (!cuponSeleccionado) return 0;
    return (calcularSubtotal() * cuponSeleccionado.porcentaje) / 100;
  };

  const calcularTotal = () => {
    return calcularSubtotal() - calcularDescuento();
  };

  const handleAplicarCupon = async (cupon) => {
    if (cupon.usado) {
      Swal.fire({
        title: "Error",
        text: "Este cupón ya ha sido utilizado",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (cuponSeleccionado?.id === cupon.id) {
      setCuponSeleccionado(null);
    } else {
      setCuponSeleccionado(cupon);
      await usarCupon(cupon.id);
    }
  };

  const handlePagar = async () => {
    setLoading(true);
    setError("");
    try {
      // Simular proceso de pago
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Guardar la compra en Firebase
      await guardarCompra(carrito, calcularTotal());

      setLoading(false);
      limpiarCarrito();
      setCuponSeleccionado(null);

      // Mostrar alerta de éxito con SweetAlert2
      await Swal.fire({
        title: "¡Pago exitoso!",
        text: "Gracias por tu compra. Te enviaremos un correo con los detalles de tu pedido.",
        icon: "success",
        confirmButtonText: "Volver al inicio",
        confirmButtonColor: "#2563eb",
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });

      navigate("/");
    } catch (error) {
      setLoading(false);
      setError("Error al procesar el pago. Por favor, intente nuevamente.");
    }
  };

  if (carrito.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-500 mb-8">
              Agrega algunos productos para comenzar a comprar
            </p>
            <button
              onClick={() => navigate("/productos")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-300"
            >
              Ver productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Carrito de compras
        </h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {carrito.map((producto) => (
                <div
                  key={producto.id}
                  className="p-6 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={producto.image}
                        alt={producto.title}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {producto.title}
                      </h3>
                      <p className="text-gray-500">${producto.price}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCantidadChange(producto, -1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">
                            {producto.cantidad}
                          </span>
                          <button
                            onClick={() => handleCantidadChange(producto, 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => eliminarDelCarrito(producto.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900">
                        ${(producto.price * producto.cantidad).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen de compra */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Resumen de compra
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">
                    ${calcularSubtotal().toFixed(2)}
                  </span>
                </div>

                {/* Cupones disponibles */}
                {cupones.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Cupones disponibles
                    </h4>
                    <div className="space-y-2">
                      {cupones.map((cupon) => (
                        <div
                          key={cupon.id}
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            cupon.usado
                              ? "bg-gray-50"
                              : "bg-blue-50 hover:bg-blue-100"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={cuponSeleccionado?.id === cupon.id}
                              onChange={() =>
                                !cupon.usado && handleAplicarCupon(cupon)
                              }
                              disabled={cupon.usado}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {cupon.porcentaje}% de descuento
                              </p>
                              <p className="text-xs text-gray-500">
                                Código: {cupon.codigo}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              cupon.usado
                                ? "bg-gray-100 text-gray-600"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {cupon.usado ? "Usado" : "Disponible"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Descuento aplicado */}
                {cuponSeleccionado && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento ({cuponSeleccionado.porcentaje}%)</span>
                    <span>-${calcularDescuento().toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-900">
                      Total
                    </span>
                    <span className="text-lg font-medium text-gray-900">
                      ${calcularTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handlePagar}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Procesando pago...
                    </div>
                  ) : (
                    "Pagar ahora"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito;
