import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../configs/firebase";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useAuth } from "./AuthContext";

export const CuponesContext = createContext();

export const useCupones = () => {
  return useContext(CuponesContext);
};

export const CuponesProvider = ({ children }) => {
  const [cupones, setCupones] = useState([]);
  const [ultimoGiro, setUltimoGiro] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const { user } = useAuth();

  // Cargar cupones y último giro del usuario
  useEffect(() => {
    const cargarCupones = async () => {
      if (user) {
        try {
          const cuponesRef = doc(db, "cupones", user.uid);
          const cuponesDoc = await getDoc(cuponesRef);
          if (cuponesDoc.exists()) {
            const data = cuponesDoc.data();
            setCupones(data.cupones || []);
            setUltimoGiro(data.ultimoGiro ? new Date(data.ultimoGiro) : null);
          }
        } catch (error) {
          console.error("Error al cargar cupones:", error);
        }
      }
    };

    cargarCupones();
  }, [user]);

  // Actualizar tiempo restante
  useEffect(() => {
    if (ultimoGiro) {
      const actualizarTiempoRestante = () => {
        const ahora = new Date();
        const siguienteGiro = new Date(ultimoGiro);
        siguienteGiro.setDate(siguienteGiro.getDate() + 1);

        if (ahora >= siguienteGiro) {
          setTiempoRestante(null);
        } else {
          const diferencia = siguienteGiro - ahora;
          const horas = Math.floor(diferencia / (1000 * 60 * 60));
          const minutos = Math.floor(
            (diferencia % (1000 * 60 * 60)) / (1000 * 60)
          );
          setTiempoRestante(`${horas}h ${minutos}m`);
        }
      };

      actualizarTiempoRestante();
      const intervalo = setInterval(actualizarTiempoRestante, 60000); // Actualizar cada minuto
      return () => clearInterval(intervalo);
    }
  }, [ultimoGiro]);

  // Girar la ruleta
  const girarRuleta = async () => {
    if (!user) return null;

    const ahora = new Date();
    if (ultimoGiro) {
      const siguienteGiro = new Date(ultimoGiro);
      siguienteGiro.setDate(siguienteGiro.getDate() + 1);
      if (ahora < siguienteGiro) {
        throw new Error("Debes esperar 24 horas para girar nuevamente");
      }
    }

    // Porcentajes disponibles
    const porcentajes = [10, 20, 25, 30, 35, 40, 45, 60];
    const porcentajeGanado =
      porcentajes[Math.floor(Math.random() * porcentajes.length)];

    // Crear nuevo cupón
    const nuevoCupon = {
      id: Date.now().toString(),
      porcentaje: porcentajeGanado,
      fechaCreacion: ahora,
      usado: false,
      codigo: `CUPON${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    };

    try {
      const cuponesRef = doc(db, "cupones", user.uid);
      const cuponesDoc = await getDoc(cuponesRef);

      if (!cuponesDoc.exists()) {
        // Si el documento no existe, crearlo con el primer cupón
        await setDoc(cuponesRef, {
          cupones: [nuevoCupon],
          ultimoGiro: ahora,
        });
      } else {
        // Si el documento existe, actualizarlo
        await updateDoc(cuponesRef, {
          cupones: arrayUnion(nuevoCupon),
          ultimoGiro: ahora,
        });
      }

      setCupones((prev) => [...prev, nuevoCupon]);
      setUltimoGiro(ahora);
      return nuevoCupon;
    } catch (error) {
      console.error("Error al guardar cupón:", error);
      throw error;
    }
  };

  // Marcar cupón como usado
  const usarCupon = async (cuponId) => {
    if (!user) return;

    try {
      const cuponesRef = doc(db, "cupones", user.uid);
      const cuponesDoc = await getDoc(cuponesRef);
      if (cuponesDoc.exists()) {
        const cupones = cuponesDoc.data().cupones;
        const cuponesActualizados = cupones.map((cupon) =>
          cupon.id === cuponId ? { ...cupon, usado: true } : cupon
        );

        await setDoc(cuponesRef, { cupones: cuponesActualizados });
        setCupones(cuponesActualizados);
      }
    } catch (error) {
      console.error("Error al marcar cupón como usado:", error);
      throw error;
    }
  };

  const value = {
    cupones,
    tiempoRestante,
    girarRuleta,
    usarCupon,
  };

  return (
    <CuponesContext.Provider value={value}>{children}</CuponesContext.Provider>
  );
};
