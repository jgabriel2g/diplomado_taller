import React, { useEffect, useState } from "react";
import Card from "../Components/Card";
import { useCarrito } from "../Context/CarritoContext";
import { db } from "../configs/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

const Productos = () => {
  const [listaProductos, setListaProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const { agregarAlCarrito } = useCarrito();

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      const productosRef = collection(db, "productos");
      const querySnapshot = await getDocs(productosRef);
      const productos = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListaProductos(productos);

      // Extraer categorías únicas
      const categoriasUnicas = [...new Set(productos.map((p) => p.category))];
      setCategorias(categoriasUnicas);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = listaProductos.filter((producto) => {
    const coincideCategoria =
      categoriaSeleccionada === "" ||
      producto.category === categoriaSeleccionada;
    const coincideBusqueda =
      busqueda === "" ||
      producto.title.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h3 className="text-2xl font-bold text-center my-6">
        Lista de productos
      </h3>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 px-4">
        <div className="flex flex-col">
          <label
            htmlFor="categoria"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Filtrar por categoría:
          </label>
          <select
            id="categoria"
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="busqueda"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Buscar producto:
          </label>
          <input
            id="busqueda"
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
        {productosFiltrados.map((producto) => (
          <Card
            key={producto.id}
            image={producto.image}
            title={producto.title}
            price={producto.price}
            description={producto.description}
            id={producto.id}
            onAddToCart={() => agregarAlCarrito(producto)}
          />
        ))}
      </div>
    </div>
  );
};

export default Productos;
