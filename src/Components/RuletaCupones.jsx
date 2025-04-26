import React, { useState, useRef, useEffect } from "react";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../configs/firebase";
import { useAuth } from "../Context/AuthContext";
import Swal from "sweetalert2";

const RuletaCupones = ({ onCuponGanado }) => {
  const [rotando, setRotando] = useState(false);
  const [intentosRestantes, setIntentosRestantes] = useState(3);
  const ruletaRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      cargarIntentos();
    }
  }, [user]);

  const cargarIntentos = async () => {
    try {
      const intentosRef = doc(db, "intentosRuleta", user.uid);
      const intentosDoc = await getDoc(intentosRef);

      if (intentosDoc.exists()) {
        const data = intentosDoc.data();
        const ultimaActualizacion = data.ultimaActualizacion.toDate();
        const hoy = new Date();

        // Si es un nuevo día, resetear los intentos
        if (
          ultimaActualizacion.getDate() !== hoy.getDate() ||
          ultimaActualizacion.getMonth() !== hoy.getMonth() ||
          ultimaActualizacion.getFullYear() !== hoy.getFullYear()
        ) {
          await setDoc(intentosRef, {
            intentos: 3,
            ultimaActualizacion: new Date(),
          });
          setIntentosRestantes(3);
        } else {
          setIntentosRestantes(data.intentos);
        }
      } else {
        // Si no existe el documento, crearlo con 3 intentos
        await setDoc(intentosRef, {
          intentos: 3,
          ultimaActualizacion: new Date(),
        });
        setIntentosRestantes(3);
      }
    } catch (error) {
      console.error("Error al cargar los intentos:", error);
    }
  };

  const actualizarIntentos = async (nuevosIntentos) => {
    try {
      const intentosRef = doc(db, "intentosRuleta", user.uid);
      await setDoc(intentosRef, {
        intentos: nuevosIntentos,
        ultimaActualizacion: new Date(),
      });
      setIntentosRestantes(nuevosIntentos);
    } catch (error) {
      console.error("Error al actualizar los intentos:", error);
    }
  };

  const generarCupon = async (descuento) => {
    try {
      const cuponesRef = collection(db, "cupones");
      const nuevoCupon = {
        codigo: Math.random().toString(36).substring(2, 8).toUpperCase(),
        descuento: descuento,
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        usado: false,
        userId: user.uid,
      };

      await addDoc(cuponesRef, nuevoCupon);

      // Agotar todos los intentos al ganar un cupón
      await actualizarIntentos(0);

      // Llamar a la función para actualizar la lista de cupones
      if (onCuponGanado) {
        onCuponGanado();
      }

      Swal.fire({
        title: "¡Felicidades!",
        text: `Has ganado un cupón de ${descuento}% de descuento. Vuelve mañana para ganar más cupones.`,
        icon: "success",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#2563eb",
      });
    } catch (error) {
      console.error("Error al generar el cupón:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo generar el cupón",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const girarRuleta = () => {
    if (rotando || intentosRestantes <= 0) return;

    setRotando(true);
    const nuevosIntentos = intentosRestantes - 1;
    actualizarIntentos(nuevosIntentos);

    const grados = Math.floor(Math.random() * 360) + 720; // 2 vueltas completas + aleatorio
    const ruleta = ruletaRef.current;
    ruleta.style.transform = `rotate(${grados}deg)`;

    setTimeout(() => {
      setRotando(false);
      const gradosFinales = grados % 360;
      let descuento = 0;

      // Determinar el descuento basado en los grados finales
      if (gradosFinales >= 0 && gradosFinales < 60) descuento = 5;
      else if (gradosFinales >= 60 && gradosFinales < 120) descuento = 10;
      else if (gradosFinales >= 120 && gradosFinales < 180) descuento = 15;
      else if (gradosFinales >= 180 && gradosFinales < 240) descuento = 20;
      else if (gradosFinales >= 240 && gradosFinales < 300) descuento = 25;
      else descuento = 30;

      generarCupon(descuento);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 mb-8">
        <div
          ref={ruletaRef}
          className="w-full h-full rounded-full border-4 border-blue-500 transition-transform duration-3000 ease-out"
          style={{
            background:
              "conic-gradient(from 0deg, #3B82F6 0deg 60deg, #60A5FA 60deg 120deg, #93C5FD 120deg 180deg, #BFDBFE 180deg 240deg, #DBEAFE 240deg 300deg, #EFF6FF 300deg 360deg)",
          }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full"></div>
        </div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-r-8 border-b-16 border-transparent border-b-red-500"></div>
      </div>

      <button
        onClick={girarRuleta}
        disabled={rotando || intentosRestantes <= 0}
        className={`px-6 py-3 rounded-lg font-medium ${
          rotando || intentosRestantes <= 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        } text-white transition-colors duration-300`}
      >
        {rotando
          ? "Girando..."
          : intentosRestantes <= 0
          ? "Sin intentos"
          : `Girar (${intentosRestantes} intentos)`}
      </button>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Intentos restantes: {intentosRestantes}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Los intentos se renuevan cada día
        </p>
      </div>
    </div>
  );
};

export default RuletaCupones;
