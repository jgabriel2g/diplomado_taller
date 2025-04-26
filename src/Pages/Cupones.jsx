import React from "react";
import RuletaCupones from "../Components/RuletaCupones";
import { useCupones } from "../Context/CuponesContext";

const Cupones = () => {
  const { cupones } = useCupones();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Gana Cupones de Descuento
          </h1>
          <p className="text-lg text-gray-600">
            Gira la ruleta y gana cupones de descuento para tus compras. ¡Tienes
            3 intentos por día!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ruleta */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <RuletaCupones />
          </div>

          {/* Lista de cupones */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Tus Cupones
            </h2>
            {cupones.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No tienes cupones disponibles. ¡Gira la ruleta para ganar!
              </p>
            ) : (
              <div className="space-y-4">
                {cupones.map((cupon) => (
                  <div
                    key={cupon.id}
                    className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {cupon.porcentaje}% de descuento
                      </p>
                      <p className="text-sm text-gray-500">
                        Código: {cupon.codigo}
                      </p>
                      <p className="text-xs text-gray-400">
                        Creado el{" "}
                        {new Date(cupon.fechaCreacion).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cupones;
