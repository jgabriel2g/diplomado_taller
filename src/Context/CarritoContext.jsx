import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../configs/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";

export const CarritoContext = createContext();

export const useCarrito = () => {
  return useContext(CarritoContext);
};

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);
  const { user } = useAuth();

  // Cargar carrito del usuario
  useEffect(() => {
    const cargarCarrito = async () => {
      if (user) {
        try {
          const carritoRef = doc(db, "carritos", user.uid);
          const carritoDoc = await getDoc(carritoRef);
          if (carritoDoc.exists()) {
            setCarrito(carritoDoc.data().productos || []);
          }
        } catch (error) {
          console.error("Error al cargar el carrito:", error);
        }
      } else {
        setCarrito([]);
      }
    };

    cargarCarrito();
  }, [user]);

  // Guardar carrito en Firebase
  const guardarCarritoEnFirebase = async (nuevoCarrito) => {
    if (user) {
      try {
        const carritoRef = doc(db, "carritos", user.uid);
        await setDoc(carritoRef, { productos: nuevoCarrito });
      } catch (error) {
        console.error("Error al guardar el carrito:", error);
      }
    }
  };

  const agregarAlCarrito = (producto, cantidad = 1) => {
    setCarrito((prevCarrito) => {
      const productoExistente = prevCarrito.find(
        (item) => item.id === producto.id
      );

      let nuevoCarrito;
      if (productoExistente) {
        // Si el producto ya existe, actualizamos la cantidad
        const nuevaCantidad = productoExistente.cantidad + cantidad;
        if (nuevaCantidad > 3) {
          return prevCarrito; // No permitimos más de 3 unidades
        }
        nuevoCarrito = prevCarrito.map((item) =>
          item.id === producto.id ? { ...item, cantidad: nuevaCantidad } : item
        );
      } else {
        // Si el producto no existe, lo agregamos
        nuevoCarrito = [...prevCarrito, { ...producto, cantidad }];
      }

      // Guardar en Firebase
      guardarCarritoEnFirebase(nuevoCarrito);
      return nuevoCarrito;
    });
  };

  const eliminarDelCarrito = (productoId) => {
    setCarrito((prevCarrito) => {
      const nuevoCarrito = prevCarrito.filter((item) => item.id !== productoId);
      // Guardar en Firebase
      guardarCarritoEnFirebase(nuevoCarrito);
      return nuevoCarrito;
    });
  };

  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad >= 1 && nuevaCantidad <= 3) {
      setCarrito((prevCarrito) => {
        const nuevoCarrito = prevCarrito.map((item) =>
          item.id === productoId ? { ...item, cantidad: nuevaCantidad } : item
        );
        // Guardar en Firebase
        guardarCarritoEnFirebase(nuevoCarrito);
        return nuevoCarrito;
      });
    }
  };

  const limpiarCarrito = () => {
    setCarrito([]);
    // Limpiar en Firebase
    if (user) {
      guardarCarritoEnFirebase([]);
    }
  };

  const value = {
    carrito,
    agregarAlCarrito,
    eliminarDelCarrito,
    actualizarCantidad,
    limpiarCarrito,
  };

  return (
    <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>
  );
};
