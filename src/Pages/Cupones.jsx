import React, { useState, useEffect } from "react";
import RuletaCupones from "../Components/RuletaCupones";
import { useAuth } from "../Context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../configs/firebase";
import Swal from "sweetalert2";

const Cupones = () => {
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      obtenerCupones();
    }
  }, [user]);

  const calcularTiempoRestante = (fechaExpiracion) => {
    const ahora = new Date();
    const expiracion = fechaExpiracion.toDate();
    const diferencia = expiracion - ahora;

    if (diferencia <= 0) {
      return "Expirado";
    }

    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

    return `${horas}h ${minutos}m`;
  };

  const obtenerCupones = async () => {
    try {
      setLoading(true);
      const cuponesRef = collection(db, "cupones");
      const q = query(cuponesRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const cuponesData = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => b.fechaCreacion.toDate() - a.fechaCreacion.toDate());
      setCupones(cuponesData);
    } catch (error) {
      console.error("Error al cargar los cupones:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
            <RuletaCupones onCuponGanado={obtenerCupones} />
          </div>

          {/* Lista de cupones */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mis Cupones</h2>
            </div>
            {cupones.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No tienes cupones disponibles. ¡Gira la ruleta para ganar!
              </p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {cupones.map((cupon) => (
                  <div
                    key={cupon.id}
                    className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-blue-500 transition-colors duration-300"
                  >
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {cupon.descuento}% de descuento
                      </p>
                      <p className="text-sm text-gray-500">
                        Código: {cupon.codigo}
                      </p>
                      <p className="text-xs text-gray-400">
                        Creado el{" "}
                        {cupon.fechaCreacion.toDate().toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        Tiempo restante:{" "}
                        {calcularTiempoRestante(cupon.fechaExpiracion)}
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
