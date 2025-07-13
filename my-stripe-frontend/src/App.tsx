import React, { useState, useEffect } from "react";
import SalesTable, { type Sale } from "./components/SalesTable";
import AddSaleForm from "./components/AddSaleForm";
import CheckoutForm from "./components/CheckoutForm";

export default function App() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [payingId, setPayingId] = useState<number | null>(null);

  const loadSales = async () => {
    try {
      const res = await fetch("http://localhost:3001/sales-orders");
      const data = await res.json();
      setSales(data.sales);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  return (
    <>
      <SalesTable
        sales={sales}
        onAddClick={() => setShowAdd(true)}
        onPayClick={(id) => setPayingId(id)}
      />

      {showAdd && (
        <AddSaleForm
          onCreate={async ({ clientId, amount, currency }) => {
            await fetch("http://localhost:3001/sales-order-header", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ clientId, amount, currency }),
            });
            setShowAdd(false);
            loadSales();
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {payingId !== null && (
        <CheckoutForm
          saleId={payingId}
          amount={sales.find((s) => s.id === payingId)!.total}
          currency={sales.find((s) => s.id === payingId)!.currency}
          onSuccess={() => {
            setPayingId(null);
            loadSales();
          }}
          onCancel={() => setPayingId(null)}
        />
      )}
    </>
  );
}
