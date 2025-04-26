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
  addDoc,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import Swal from "sweetalert2";

const Stock = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    image: "",
    stock: "",
    destacado: false,
  });
  const [categorias, setCategorias] = useState([]);
  const [showCategoriasForm, setShowCategoriasForm] = useState(false);
  const [categoriaForm, setCategoriaForm] = useState({
    nombre: "",
    descripcion: "",
  });

  // Verificar si el usuario es admin
  useEffect(() => {
    if (!user || user.rol !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Cargar productos y categorías
  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const productosRef = collection(db, "productos");
      const q = query(
        productosRef,
        orderBy("fechaCreacion", "desc"),
        limit(10)
      );
      const querySnapshot = await getDocs(q);

      const productosData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          docId: doc.id, // Asegurarnos de que docId esté al final para que no sea sobrescrito
        };
      });

      console.log("Productos cargados:", productosData); // Debug
      setProductos(productosData);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === 10);

      // Extraer categorías únicas
      const categoriasUnicas = [
        ...new Set(productosData.map((p) => p.category)),
      ];
      setCategorias(categoriasUnicas);
    } catch (error) {
      setError("Error al cargar los productos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cargarMasProductos = async () => {
    if (!lastVisible || !hasMore) return;

    try {
      setLoading(true);
      const productosRef = collection(db, "productos");
      const q = query(
        productosRef,
        orderBy("fechaCreacion", "desc"),
        startAfter(lastVisible),
        limit(10)
      );
      const querySnapshot = await getDocs(q);

      const nuevosProductos = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          docId: doc.id, // Asegurarnos de que docId esté al final para que no sea sobrescrito
        };
      });

      setProductos((prev) => [...prev, ...nuevosProductos]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === 10);
    } catch (error) {
      setError("Error al cargar más productos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const categoriasRef = collection(db, "categorias");
      const querySnapshot = await getDocs(categoriasRef);
      const categoriasData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategorias(categoriasData);
    } catch (error) {
      setError("Error al cargar las categorías");
      console.error(error);
    }
  };

  const crearCategoria = async (e) => {
    e.preventDefault();
    try {
      const categoriasRef = collection(db, "categorias");
      await addDoc(categoriasRef, {
        ...categoriaForm,
        fechaCreacion: new Date(),
      });
      await cargarCategorias();
      setShowCategoriasForm(false);
      setCategoriaForm({ nombre: "", descripcion: "" });
      Swal.fire({
        title: "¡Éxito!",
        text: "Categoría creada correctamente",
        icon: "success",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#2563eb",
      });
    } catch (error) {
      setError("Error al crear la categoría");
      console.error(error);
    }
  };

  const eliminarCategoria = async (categoriaId) => {
    try {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        const categoriasRef = collection(db, "categorias");
        const categoriaRef = doc(categoriasRef, categoriaId);
        await deleteDoc(categoriaRef);
        await cargarCategorias();
        Swal.fire("¡Eliminada!", "La categoría ha sido eliminada", "success");
      }
    } catch (error) {
      setError("Error al eliminar la categoría");
      console.error(error);
    }
  };

  const handleCategoriaInputChange = (e) => {
    const { name, value } = e.target;
    setCategoriaForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Cargar productos de la API
  const cargarProductosAPI = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://fakestoreapi.com/products");
      const data = await response.json();

      // Extraer categorías únicas de la API
      const categoriasAPI = [...new Set(data.map((p) => p.category))];

      // Crear categorías en Firestore si no existen
      const categoriasRef = collection(db, "categorias");
      const categoriasSnapshot = await getDocs(categoriasRef);
      const categoriasExistentes = categoriasSnapshot.docs.map(
        (doc) => doc.data().nombre
      );

      const batch = writeBatch(db);

      // Crear categorías nuevas
      for (const categoria of categoriasAPI) {
        if (!categoriasExistentes.includes(categoria)) {
          const nuevaCategoriaRef = doc(categoriasRef);
          batch.set(nuevaCategoriaRef, {
            nombre: categoria,
            descripcion: `Categoría de ${categoria}`,
            fechaCreacion: new Date(),
          });
        }
      }
      await batch.commit();

      // Agregar stock y fecha de creación a cada producto
      const productosConStock = data.map(({ id, ...producto }) => ({
        ...producto,
        stock: 10,
        fechaCreacion: new Date(),
        destacado: false,
      }));

      // Guardar productos en Firestore
      const productosRef = collection(db, "productos");
      const productosBatch = writeBatch(db);

      // Primero eliminar todos los productos existentes
      const productosSnapshot = await getDocs(productosRef);
      productosSnapshot.docs.forEach((doc) => {
        productosBatch.delete(doc.ref);
      });

      // Luego agregar los nuevos productos
      productosConStock.forEach((producto) => {
        const nuevoProductoRef = doc(productosRef);
        productosBatch.set(nuevoProductoRef, producto);
      });

      await productosBatch.commit();

      // Recargar categorías y productos
      await cargarCategorias();
      await cargarProductos();

      Swal.fire({
        title: "¡Éxito!",
        text: "Productos y categorías cargados correctamente",
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

  // Crear nuevo producto
  const crearProducto = async (e) => {
    e.preventDefault();
    try {
      const productosRef = collection(db, "productos");
      const nuevoProducto = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        fechaCreacion: new Date(),
      };

      await addDoc(productosRef, nuevoProducto);
      await cargarProductos();
      setShowForm(false);
      setFormData({
        title: "",
        price: "",
        description: "",
        category: "",
        image: "",
        stock: "",
        destacado: false,
      });

      Swal.fire({
        title: "¡Éxito!",
        text: "Producto creado correctamente",
        icon: "success",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#2563eb",
      });
    } catch (error) {
      setError("Error al crear el producto");
      console.error(error);
    }
  };

  // Actualizar producto
  const actualizarProducto = async (docId, cambios) => {
    console.log("Actualizando producto:", docId, cambios);
    try {
      const productosRef = collection(db, "productos");
      const productoRef = doc(productosRef, docId);
      await updateDoc(productoRef, cambios);
      setProductos((prev) =>
        prev.map((p) => (p.docId === docId ? { ...p, ...cambios } : p))
      );
    } catch (error) {
      console.error("Error al actualizar:", error);
      setError("Error al actualizar el producto");
    }
  };

  // Eliminar producto
  const eliminarProducto = async (docId) => {
    try {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        const productosRef = collection(db, "productos");
        const productoRef = doc(productosRef, docId);
        await deleteDoc(productoRef);
        setProductos((prev) => prev.filter((p) => p.docId !== docId));
        Swal.fire("¡Eliminado!", "El producto ha sido eliminado", "success");
      }
    } catch (error) {
      setError("Error al eliminar el producto");
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  if (loading && productos.length === 0) {
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
          <div className="space-x-4">
            <button
              onClick={() => setShowCategoriasForm(!showCategoriasForm)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300"
            >
              {showCategoriasForm ? "Cancelar" : "Gestionar Categorías"}
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300"
            >
              {showForm ? "Cancelar" : "Nuevo Producto"}
            </button>
            <button
              onClick={cargarProductosAPI}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Cargar productos de la API
            </button>
          </div>
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

        {/* Formulario de categorías */}
        {showCategoriasForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Gestión de Categorías
            </h3>
            <form onSubmit={crearCategoria} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre de la categoría
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={categoriaForm.nombre}
                    onChange={handleCategoriaInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-12 text-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <input
                    type="text"
                    name="descripcion"
                    value={categoriaForm.descripcion}
                    onChange={handleCategoriaInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-12 text-lg bg-gray-50"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-300 text-lg"
                >
                  Crear Categoría
                </button>
              </div>
            </form>

            {/* Lista de categorías */}
            <div className="mt-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Categorías Existentes
              </h4>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {categorias.map((categoria) => (
                    <li key={categoria.id}>
                      <div className="px-4 py-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {categoria.nombre}
                          </p>
                          <p className="text-sm text-gray-500">
                            {categoria.descripcion}
                          </p>
                        </div>
                        <button
                          onClick={() => eliminarCategoria(categoria.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de nuevo producto */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Nuevo Producto
            </h3>
            <form onSubmit={crearProducto} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Título
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-12 text-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Precio
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-12 text-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Categoría
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-12 text-lg bg-gray-50"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.nombre}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-12 text-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    URL de la imagen
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-12 text-lg bg-gray-50"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="destacado"
                    checked={formData.destacado}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Destacado
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg bg-gray-50"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-lg"
                >
                  Crear Producto
                </button>
              </div>
            </form>
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
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productos.map((producto) => (
                <tr key={producto.docId}>
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
                          actualizarProducto(producto.docId, {
                            stock: producto.stock - 1,
                          })
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
                          actualizarProducto(producto.docId, {
                            stock: producto.stock + 1,
                          })
                        }
                        className="text-gray-600 hover:text-gray-900"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={producto.destacado}
                        onChange={(e) =>
                          actualizarProducto(producto.docId, {
                            destacado: e.target.checked,
                          })
                        }
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-500">
                        {producto.destacado ? "Destacado" : "Normal"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => eliminarProducto(producto.docId)}
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

        {/* Botón de cargar más */}
        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={cargarMasProductos}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Cargar más productos"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stock;
