import React, { useState } from "react";

type Props = {
  onCreate: (input: { clientId: number; amount: number; currency: string }) => void;
  onCancel: () => void;
};

export default function AddSaleForm({ onCreate, onCancel }: Props) {
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [error, setError] = useState<string>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cId = parseInt(clientId);
    const amt = Math.round(Number(amount) * 100);
    if (isNaN(cId) || isNaN(amt) || !currency) {
      setError("Todos los campos son requeridos y válidos");
      return;
    }
    onCreate({ clientId: cId, amount: amt, currency });
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "#fff", padding: 20, borderRadius: 8, width: 320,
      }}>
        <h3>Crear Nueva Venta</h3>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div>
          <label>ID Cliente</label><br/>
          <input
            type="number"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Total (USD)</label><br/>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Moneda</label><br/>
          <input
            type="text"
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            required
          />
        </div>
        <button type="submit" style={{ marginTop: 10 }}>Crear</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: 8, marginTop: 10 }}>
          Cancelar
        </button>
      </form>
    </div>
  );
}
