import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useCompras } from "../Context/ComprasContext";
import { useCupones } from "../Context/CuponesContext";
import { updateProfile } from "firebase/auth";
import { auth } from "../configs/firebase";

const Profile = () => {
  const { user } = useAuth();
  const {
    compras,
    loading: comprasLoading,
    error: comprasError,
  } = useCompras();
  const { cupones } = useCupones();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No hay usuario autenticado");
      }

      await updateProfile(currentUser, {
        displayName: displayName,
      });

      setSuccess("Perfil actualizado correctamente");
      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      setError("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header del perfil */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-3xl text-white font-medium">
                  {user?.displayName
                    ? user.displayName[0].toUpperCase()
                    : user?.email[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {user?.displayName || "Usuario"}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Contenido del perfil */}
          <div className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
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

            {success && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
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

            <div className="space-y-6">
              {/* Información del usuario */}
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  Información personal
                </h4>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {user?.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre
                    </label>
                    {isEditing ? (
                      <form onSubmit={handleUpdateProfile} className="mt-1">
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <div className="mt-2 flex space-x-2">
                          <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            {loading ? "Guardando..." : "Guardar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              setDisplayName(user?.displayName || "");
                            }}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-1 flex items-center justify-between">
                        <div className="text-sm text-gray-900">
                          {user?.displayName || "No especificado"}
                        </div>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-sm text-blue-600 hover:text-blue-500"
                        >
                          Editar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cupones */}
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  Mis Cupones
                </h4>
                <div className="mt-4">
                  {cupones.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-gray-500">
                        No tienes cupones disponibles
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cupones.map((cupon) => (
                        <div
                          key={cupon.id}
                          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">
                                {cupon.descuento}% de descuento
                              </p>
                              <p className="text-sm text-gray-500">
                                Código: {cupon.codigo}
                              </p>
                              <p className="text-xs text-gray-400">
                                Creado el{" "}
                                {cupon.fechaCreacion
                                  .toDate()
                                  .toLocaleDateString()}
                              </p>
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Historial de compras */}
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  Historial de compras
                </h4>
                <div className="mt-4">
                  {comprasLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : comprasError ? (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
                          <p className="text-sm text-red-700">{comprasError}</p>
                        </div>
                      </div>
                    </div>
                  ) : compras.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-gray-500">
                        No hay compras registradas
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {compras.map((compra) => (
                        <div
                          key={compra.id}
                          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm text-gray-500">
                                {new Date(compra.fecha).toLocaleDateString()}
                              </p>
                              <p className="font-medium text-gray-900">
                                Total: ${compra.total.toFixed(2)}
                              </p>
                            </div>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              {compra.estado}
                            </span>
                          </div>
                          <div className="mt-2">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Productos:
                            </h5>
                            <div className="space-y-2">
                              {compra.productos.map((producto) => (
                                <div
                                  key={producto.id}
                                  className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md"
                                >
                                  <img
                                    src={producto.image}
                                    alt={producto.title}
                                    className="w-8 h-8 object-contain"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-600">
                                      {producto.title}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Cantidad: {producto.cantidad} x $
                                      {producto.price}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
