import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prisma/client";
import { stripe } from "./stripe";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

type SaleDto = {
  id: number;
  date: string; 
  clientName: string;
  total: number;
  status: "pending" | "paid";
};

app.post("/sales-order/:id/pay", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orderId = Number(req.params.id);
    const { paymentMethodId } = req.body;
    if (!paymentMethodId) {
      res.status(400).json({ error: "Missing paymentMethodId" });
      return;
    }
    // 1) Recuperar orden de la BD
    const order = await prisma.salesOrderHeader.findUnique({ where: { id: orderId }});
    if (!order){
      res.status(404).json({ error: "Order not found" });
      return;
    }
      
    const pi = await stripe.paymentIntents.create({
      amount: order.amount,
      currency: order.currency,
      payment_method: paymentMethodId,
      confirm: true,
      payment_method_types: ["card"],
    });

    const chargeId =
      typeof pi.latest_charge === "string"
        ? pi.latest_charge
        : pi.latest_charge?.id ?? null;
    const payment = await prisma.payment.create({
      data: {
        status: pi.status,
        amount: pi.amount,
        currency: pi.currency,
        paymentIntentId: pi.id,
        chargeId,
        salesOrder: { connect: { id: orderId } },
      },
    });

    await prisma.stateHistory.create({
      data: {
        salesOrderId: orderId,
        state: pi.status === "succeeded" ? "paid" : "pending_payment",
      },
    });

    res.json({ clientSecret: pi.client_secret });
  } catch (err) { next(err) }
});


app.post(
  "/sales-order-header",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { clientId, amount, currency } = req.body;
      if (!clientId || !amount || !currency) {
        res.status(400).json({ error: "Missing clientId, amount or currency" });
        return;
      }
      const order = await prisma.salesOrderHeader.create({
        data: { clientId, amount, currency },
      });

      await prisma.stateHistory.create({
        data: {
          salesOrderId: order.id,
          state: "pending_payment",
        },
      });
      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  }
);

app.post(
  "/sales-order",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { clientId, amount, currency, paymentMethodId } = req.body;
      if (!clientId || !amount || !currency || !paymentMethodId) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      let stripeCustomerId: string;
      const clientRecord = await prisma.client.findUnique({ where: { id: clientId } });
      if (clientRecord?.stripeCustomerId) {
        stripeCustomerId = clientRecord.stripeCustomerId;
      } else {
        const customer = await stripe.customers.create({
          metadata: { internalClientId: String(clientId) },
        });
        stripeCustomerId = customer.id;
        await prisma.client.update({
          where: { id: clientId },
          data: { stripeCustomerId },
        });
      }

      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId,
      });

      const pi = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: stripeCustomerId,
        payment_method: paymentMethodId,
        confirm: true,
        error_on_requires_action: true,
      });

      const chargeId =
        typeof pi.latest_charge === "string"
          ? pi.latest_charge
          : pi.latest_charge?.id ?? null;

      const payment = await prisma.payment.create({
        data: {
          status: pi.status,
          amount: pi.amount,
          currency: pi.currency,
          paymentIntentId: pi.id,
          chargeId,
        },
      });

      const order = await prisma.salesOrderHeader.create({
        data: {
          clientId,
          amount,
          currency,
          paymentId: payment.id,
        },
      });

      await prisma.stateHistory.create({
        data: {
          salesOrderId: order.id,
          state: pi.status === "succeeded" ? "paid" : "pending_payment",
        },
      });

      res.status(201).json({
        order,
        clientSecret: pi.client_secret as string,
      });
    } catch (err: any) {
      next(err);
    }
  }
);

app.get(
  "/sales-orders",
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orders = await prisma.salesOrderHeader.findMany({
        include: {
          client: true,
          stateHistory: {
            orderBy: { timestamp: "desc" },
            take: 1,
          },
        },
      });

      const sales: SaleDto[] = orders.map((o) => ({
        id: o.id,
        date: o.createdAt.toISOString().split("T")[0],
        clientName: o.client?.name ?? "—",
        total: o.amount,
        currency: o.currency, 
        status: o.stateHistory[0]?.state === "paid" ? "paid" : "pending",
      }));

      res.json({ sales });
    } catch (err: any) {
      next(err);
    }
  }
);

app.use(
  (err: any, req: Request, res: Response, next: NextFunction): void => {
    console.error(err);
    res
      .status(500)
      .json({ error: err.message || "Internal Server Error" });
  }
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
