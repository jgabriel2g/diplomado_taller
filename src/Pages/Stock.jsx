import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../configs/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import Swal from "sweetalert2";

const Stock = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Verificar si el usuario es admin
  useEffect(() => {
    if (!user || user.rol !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Cargar productos
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const productosRef = collection(db, "productos");
        const querySnapshot = await getDocs(productosRef);
        const productosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductos(productosData);
      } catch (error) {
        setError("Error al cargar los productos");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  // Cargar productos de la API
  const cargarProductosAPI = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://fakestoreapi.com/products");
      const data = await response.json();

      // Agregar stock a cada producto
      const productosConStock = data.map((producto) => ({
        ...producto,
        stock: 10,
      }));

      // Guardar en Firestore usando batch
      const batch = writeBatch(db);
      productosConStock.forEach((producto) => {
        const docRef = doc(collection(db, "productos"));
        batch.set(docRef, producto);
      });
      await batch.commit();

      // Recargar productos
      const productosRef = collection(db, "productos");
      const querySnapshot = await getDocs(productosRef);
      const productosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductos(productosData);

      Swal.fire({
        title: "¡Éxito!",
        text: "Productos cargados correctamente",
        icon: "success",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#2563eb",
      });
    } catch (error) {
      setError("Error al cargar los productos de la API");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar stock
  const actualizarStock = async (productoId, nuevoStock) => {
    try {
      const productoRef = doc(db, "productos", productoId);
      await updateDoc(productoRef, { stock: nuevoStock });
      setProductos((prev) =>
        prev.map((p) => (p.id === productoId ? { ...p, stock: nuevoStock } : p))
      );
    } catch (error) {
      setError("Error al actualizar el stock");
      console.error(error);
    }
  };

  // Eliminar producto
  const eliminarProducto = async (productoId) => {
    try {
      await deleteDoc(doc(db, "productos", productoId));
      setProductos((prev) => prev.filter((p) => p.id !== productoId));
    } catch (error) {
      setError("Error al eliminar el producto");
      console.error(error);
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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Gestión de Stock</h2>
          <button
            onClick={cargarProductosAPI}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Cargar productos de la API
          </button>
        </div>

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

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-contain"
                          src={producto.image}
                          alt={producto.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {producto.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {producto.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${producto.price}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          actualizarStock(producto.id, producto.stock - 1)
                        }
                        disabled={producto.stock <= 0}
                        className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="text-sm text-gray-900">
                        {producto.stock}
                      </span>
                      <button
                        onClick={() =>
                          actualizarStock(producto.id, producto.stock + 1)
                        }
                        className="text-gray-600 hover:text-gray-900"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => eliminarProducto(producto.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Stock;
