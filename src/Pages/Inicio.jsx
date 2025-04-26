import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import Card from "../Components/Card";
import { db } from "../configs/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";

const Inicio = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [productosOfertas, setProductosOfertas] = useState([]);
  const [productosPopulares, setProductosPopulares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      setLoading(true);
      const productosRef = collection(db, "productos");

      // Obtener productos destacados
      const qDestacados = query(
        productosRef,
        where("destacado", "==", true),
        limit(4)
      );
      const destacadosSnapshot = await getDocs(qDestacados);
      const destacadosData = destacadosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductosDestacados(destacadosData);

      // Obtener productos en oferta (stock > 5)
      const qOfertas = query(productosRef, where("stock", ">", 5), limit(4));
      const ofertasSnapshot = await getDocs(qOfertas);
      const ofertasData = ofertasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductosOfertas(ofertasData);

      // Obtener productos populares (más stock)
      const qPopulares = query(
        productosRef,
        orderBy("stock", "desc"),
        limit(4)
      );
      const popularesSnapshot = await getDocs(qPopulares);
      const popularesData = popularesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductosPopulares(popularesData);
    } catch (error) {
      console.error("Error al cargar los productos:", error);
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Bienvenido a nuestra tienda
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Descubre los mejores productos al mejor precio. Encuentra todo lo
              que necesitas en un solo lugar.
            </p>
            <p className="text-xl text-white mb-8">
              Desarrolladores: Jesus Garcia, Luis Acosta y Juan Martinez
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate("/productos")}
                className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors duration-300"
              >
                Explorar productos
              </button>
              {user ? (
                <button
                  onClick={() => navigate("/cupones")}
                  className="bg-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors duration-300 flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Conseguir cupón</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors duration-300 flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Iniciar sesión para conseguir cupón</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Productos Destacados */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Productos Destacados
            </h2>
            <button
              onClick={() => navigate("/productos")}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              Ver todos
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {productosDestacados.map((producto) => (
              <Card
                key={producto.id}
                image={producto.image}
                title={producto.title}
                price={producto.price}
                description={producto.description}
                id={producto.id}
              />
            ))}
          </div>
        </section>

        {/* Ofertas Especiales */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Ofertas Especiales
            </h2>
            <button
              onClick={() => navigate("/productos")}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              Ver todas
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {productosOfertas.map((producto) => (
              <Card
                key={producto.id}
                image={producto.image}
                title={producto.title}
                price={(producto.price * 0.8).toFixed(2)}
                id={producto.id}
              />
            ))}
          </div>
        </section>

        {/* Productos Populares */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Productos Populares
            </h2>
            <button
              onClick={() => navigate("/productos")}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              Ver todos
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {productosPopulares.map((producto) => (
              <Card
                key={producto.id}
                image={producto.image}
                title={producto.title}
                price={producto.price}
                description={producto.description}
                id={producto.id}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Inicio;
