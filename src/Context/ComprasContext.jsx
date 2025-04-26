import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../configs/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

export const ComprasContext = createContext();

export const useCompras = () => {
  return useContext(ComprasContext);
};

export const ComprasProvider = ({ children }) => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Cargar compras del usuario
  useEffect(() => {
    const cargarCompras = async () => {
      if (user) {
        setLoading(true);
        setError(null);
        try {
          // Primero intentamos con la consulta completa
          try {
            const q = query(
              collection(db, "compras"),
              where("userId", "==", user.uid),
              orderBy("fecha", "desc")
            );
            const querySnapshot = await getDocs(q);
            const comprasData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              fecha: doc.data().fecha?.toDate() || new Date(doc.data().fecha),
            }));
            setCompras(comprasData);
          } catch {
            console.log(
              "Error en la consulta compuesta, intentando consulta simple..."
            );
            const q = query(
              collection(db, "compras"),
              where("userId", "==", user.uid)
            );
            const querySnapshot = await getDocs(q);
            const comprasData = querySnapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
                fecha: doc.data().fecha?.toDate() || new Date(doc.data().fecha),
              }))
              .sort((a, b) => b.fecha - a.fecha);
            setCompras(comprasData);
          }
        } catch (error) {
          console.error("Error al cargar compras:", error);
          setError(
            "Error al cargar el historial de compras. Por favor, intente nuevamente más tarde."
          );
        } finally {
          setLoading(false);
        }
      }
    };

    cargarCompras();
  }, [user]);

  // Guardar una nueva compra
  const guardarCompra = async (productos, total) => {
    if (!user) return;

    try {
      const nuevaCompra = {
        userId: user.uid,
        productos,
        total,
        fecha: serverTimestamp(),
        estado: "completada",
      };

      const docRef = await addDoc(collection(db, "compras"), nuevaCompra);
      setCompras((prevCompras) => [
        { id: docRef.id, ...nuevaCompra, fecha: new Date() },
        ...prevCompras,
      ]);

      return docRef.id;
    } catch (error) {
      console.error("Error al guardar la compra:", error);
      throw error;
    }
  };

  const value = {
    compras,
    guardarCompra,
    loading,
    error,
  };

  return (
    <ComprasContext.Provider value={value}>{children}</ComprasContext.Provider>
  );
};
