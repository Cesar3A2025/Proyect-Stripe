import React from "react";

export type Sale = {
  id: number;
  date: string;
  clientName: string;
  total: number;
  currency: string;
  status: "pending" | "paid";
};

interface Props {
  sales: Sale[];
  onAddClick: () => void;
  onPayClick: (saleId: number) => void;
}

const SalesTable: React.FC<Props> = ({ sales, onAddClick, onPayClick }) => {
  return (
    <div style={{ padding: "20px 40px", width: "100%" }}>
      <h2>Cuadro Ventas</h2>
      <button onClick={onAddClick} style={{
          marginBottom: "10px",
          backgroundColor: "#e0e0e0",
          color: "#000",
          border: "none",
          padding: "6px 12px",
          borderRadius: "4px",
          cursor: "pointer",
      }}>
        + Venta
      </button>

      <table border={1} cellPadding={10} cellSpacing={0} width="100%">
        <thead>
          <tr>
            <th>Nro</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Moneda</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale, idx) => (
            <tr key={sale.id}>
              <td>{idx + 1}</td>
              <td>{sale.date}</td>
              <td>{sale.clientName}</td>
              <td>${(sale.total / 100).toFixed(2)}</td>
              <td>{sale.currency.toUpperCase()}</td>
              <td>{sale.status === "pending" ? "Pendiente" : "Pagado"}</td>
              <td>
                {sale.status === "pending" ? (
                  <button
                    onClick={() => onPayClick(sale.id)}
                    style={{
                      backgroundColor: "#e0e0e0",
                      color: "#000",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Pagar
                  </button>
                ) : (
                  <span>✔️</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;
