import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Descuentos = ({ setDescuento }) => {
  const [porcentaje, setPorcentaje] = useState(0);
  const navigate = useNavigate();

  const aplicarDescuento = () => {
    setDescuento(porcentaje);
    navigate('/productos');
  };

  const handleChange = (e) => {
    let value = Number(e.target.value);
    if (value < 0) value = 0;
    if (value > 100) value = 100;
    setPorcentaje(value);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Selecciona el porcentaje de descuento
        </h2>
        <input
          type="number"
          value={porcentaje}
          onChange={handleChange}
          onBlur={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej. 10"
          max={100}
        />
        <button
          onClick={aplicarDescuento}
          disabled={porcentaje < 0 || porcentaje > 100}
          className={`w-full py-2 rounded-md transition duration-300 
            ${porcentaje >= 0 && porcentaje <= 100
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
        >
          Aplicar Descuento
        </button>
      </div>
    </div>
  );
};

export default Descuentos;
