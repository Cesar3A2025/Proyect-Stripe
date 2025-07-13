import React from "react";
import ReactDOM from "react-dom/client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import App from "./App";

const stripePromise = loadStripe("pk_test_51Rf9JqPprHSJapxWHqhrXrlm2oN6QHgc42DyVnv58CkyMeBZZQiB6XJp6sHEMZ9nnwbUdOuZGvM55gbIYUezXQ2n00umyzCCR7");

const el = document.getElementById("root");
if (!el) throw new Error("No root element");


const root = ReactDOM.createRoot(el);
root.render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  </React.StrictMode>
);
