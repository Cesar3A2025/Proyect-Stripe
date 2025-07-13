import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

type Props = {
  saleId: number;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function CheckoutForm({
  saleId,
  amount,
  currency,
  onSuccess,
  onCancel,
}: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>();
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMsg(undefined);

    const cardEl = elements.getElement(CardElement);
    if (!cardEl) {
      setErrorMsg("No se encontró el elemento de tarjeta");
      setLoading(false);
      return;
    }
    const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardEl,
    });
    if (pmError || !paymentMethod) {
      setErrorMsg(pmError?.message || "Error creando método de pago");
      setLoading(false);
      return;
    }

    const resp = await fetch(
      `http://localhost:3001/sales-order/${saleId}/pay`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId: paymentMethod.id }),
      }
    );
    const data = await resp.json();
    if (!resp.ok) {
      setErrorMsg(data.error || "Error en el pago");
      setLoading(false);
      return;
    }

    setLoading(false);
    setSucceeded(true);
  };

  if (succeeded) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 8,
            width: 320,
            textAlign: "center",
          }}
        >
          <h3>✅ Pago exitoso</h3>
          <p>
            ¡Gracias! La transacción por ${(amount / 100).toFixed(2)} ha sido
            procesada.
          </p>
          <button onClick={onSuccess} style={{ marginTop: 10 }}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 8,
          width: 320,
        }}
      >
        <h3>Pagar ${(amount / 100).toFixed(2)}</h3>
        <CardElement options={{ hidePostalCode: true }} />
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        <button type="submit" disabled={!stripe || loading}>
          {loading ? "Procesando…" : "Confirmar pago"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{ marginLeft: 8, marginTop: 10 }}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}
