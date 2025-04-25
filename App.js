import { useEffect, useState } from "react";

const API_URL = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";

const monedas = ["USDT", "USDC"];
const tipos = ["BUY", "SELL"];

async function fetchPrecio(asset, tradeType) {
  const body = {
    asset,
    fiat: "BOB",
    tradeType,
    page: 1,
    rows: 1,
    payTypes: []
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  return parseFloat(data?.data?.[0]?.adv?.price || 0);
}

export default function TableroBinanceP2P() {
  const [precios, setPrecios] = useState({});

  useEffect(() => {
    async function actualizarPrecios() {
      const nuevosPrecios = {};
      for (const moneda of monedas) {
        for (const tipo of tipos) {
          const key = `${moneda}_${tipo}`;
          nuevosPrecios[key] = await fetchPrecio(moneda, tipo);
        }
      }
      setPrecios(nuevosPrecios);
    }

    actualizarPrecios();
    const interval = setInterval(actualizarPrecios, 10000); // cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Tablero Binance P2P (BOB)</h1>
      <table className="w-full text-left border">
        <thead>
          <tr className="border-b">
            <th className="p-2">Moneda</th>
            <th className="p-2">Compra (BOB)</th>
            <th className="p-2">Venta (BOB)</th>
            <th className="p-2">Spread</th>
          </tr>
        </thead>
        <tbody>
          {monedas.map((moneda) => {
            const buy = precios[`${moneda}_BUY`] || 0;
            const sell = precios[`${moneda}_SELL`] || 0;
            const spread = sell - buy;
            return (
              <tr key={moneda} className="border-b">
                <td className="p-2 font-semibold">{moneda}</td>
                <td className="p-2">{buy.toFixed(2)}</td>
                <td className="p-2">{sell.toFixed(2)}</td>
                <td className="p-2">{spread.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
