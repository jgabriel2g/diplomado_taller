import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../configs/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

export const CuponesContext = createContext();

export const useCupones = () => {
  return useContext(CuponesContext);
};

export const CuponesProvider = ({ children }) => {
  const [cupones, setCupones] = useState([]);
  const { user } = useAuth();

  // Cargar cupones del usuario
  useEffect(() => {
    const cargarCupones = async () => {
      if (user) {
        try {
          const cuponesRef = collection(db, "cupones");
          const q = query(cuponesRef, where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const cuponesData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCupones(cuponesData);
        } catch (error) {
          console.error("Error al cargar cupones:", error);
        }
      }
    };

    cargarCupones();
  }, [user]);

  // Marcar cupón como usado
  const usarCupon = async (cuponId) => {
    if (!user) return;

    try {
      const cuponRef = doc(db, "cupones", cuponId);
      await updateDoc(cuponRef, { usado: true });

      // Actualizar el estado local
      setCupones((prevCupones) =>
        prevCupones.map((cupon) =>
          cupon.id === cuponId ? { ...cupon, usado: true } : cupon
        )
      );
    } catch (error) {
      console.error("Error al marcar cupón como usado:", error);
      throw error;
    }
  };

  const value = {
    cupones,
    usarCupon,
  };

  return (
    <CuponesContext.Provider value={value}>{children}</CuponesContext.Provider>
  );
};
