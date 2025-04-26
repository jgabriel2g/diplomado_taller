import React, { useState } from "react";
import { useCupones } from "../Context/CuponesContext";
import Swal from "sweetalert2";

const RuletaCupones = () => {
  const { girarRuleta, tiempoRestante } = useCupones();
  const [girando, setGirando] = useState(false);
  const [angulo, setAngulo] = useState(0);
  const [intentos, setIntentos] = useState(3);

  const porcentajes = [10, 20, 25, 30, 35, 40, 45, 60];
  const anguloPorSeccion = 360 / porcentajes.length;

  console.log(tiempoRestante);

  const handleGirar = async () => {
    if (girando) return;
    if (intentos <= 0) {
      Swal.fire({
        title: "¡Sin intentos!",
        text: "Has agotado tus intentos por hoy. Vuelve mañana para obtener más cupones.",
        icon: "info",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    try {
      setGirando(true);
      const cupon = await girarRuleta();

      // Calcular el ángulo final
      const indiceGanador = porcentajes.indexOf(cupon.porcentaje);
      const anguloFinal = 360 - indiceGanador * anguloPorSeccion;
      const vueltasExtra = 5; // Número de vueltas completas
      const anguloTotal = anguloFinal + 360 * vueltasExtra;

      // Animar la ruleta
      setAngulo(anguloTotal);

      // Mostrar resultado después de la animación
      setTimeout(() => {
        Swal.fire({
          title: "¡Felicidades!",
          text: `Has ganado un cupón de ${cupon.porcentaje}% de descuento. Código: ${cupon.codigo}`,
          icon: "success",
          confirmButtonText: "¡Genial!",
          confirmButtonColor: "#2563eb",
        });
        setIntentos((prev) => prev - 1);
        setGirando(false);
      }, 5000);
    } catch (error) {
      setGirando(false);
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-64 h-64 mb-8">
        {/* Ruleta */}
        <div
          className="absolute w-full h-full rounded-full border-4 border-blue-600 transition-transform duration-5000 ease-out"
          style={{
            transform: `rotate(${angulo}deg)`,
            background: `conic-gradient(
              from 0deg,
              #3b82f6 0deg,
              #60a5fa 45deg,
              #3b82f6 90deg,
              #60a5fa 135deg,
              #3b82f6 180deg,
              #60a5fa 225deg,
              #3b82f6 270deg,
              #60a5fa 315deg,
              #3b82f6 360deg
            )`,
          }}
        >
          {/* Secciones de la ruleta */}
          {porcentajes.map((porcentaje, index) => (
            <div
              key={porcentaje}
              className="absolute w-full h-full"
              style={{
                transform: `rotate(${index * anguloPorSeccion}deg)`,
              }}
            >
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 text-white font-bold text-lg"
                style={{
                  transform: `rotate(${
                    anguloPorSeccion / 2
                  }deg) translateY(20px)`,
                }}
              >
                {porcentaje}%
              </div>
            </div>
          ))}
        </div>
        {/* Flecha */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-l-transparent border-r-transparent border-b-red-600" />
      </div>

      {/* Controles */}
      <div className="text-center">
        <button
          onClick={handleGirar}
          disabled={girando}
          className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {girando ? "Girando..." : "Girar Ruleta"}
        </button>

        <div className="mt-4 space-y-2">
          <p className="text-gray-600">
            Intentos restantes: <span className="font-bold">{intentos}</span>
          </p>
          {tiempoRestante && (
            <p className="text-gray-600">
              Próximo giro disponible en:{" "}
              <span className="font-bold">{tiempoRestante}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RuletaCupones;
