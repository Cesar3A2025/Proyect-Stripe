# Stripe-Project

A simple full-stack example showing how to accept card payments via direct API calls to Stripe (without redirecting to a Stripe-hosted page). Built with:

- **Backend**: Node.js + Express + Prisma (PostgreSQL)  
- **Frontend**: React + TypeScript + Vite + Stripe Elements  

## Features

1. **Sales Order Management**  
   - Create a new sales order (amount + currency + client).  
   - Persist in a `SalesOrderHeader` table, track each change in `StateHistory`.  
2. **Card Payment Flow**  
   - Enter card details in a React modal (Stripe Elements).  
   - Create & confirm a Stripe PaymentIntent via your own API.  
   - Save payment info in a `Payment` table and update order state to “paid.”  
3. **Data Modeling (Prisma)**  
   - `Client` with optional saved Stripe Customer ID.  
   - `SalesOrderHeader`, `Payment`, `StateHistory` (tracking each status change).  
   - `Card` for storing saved payment methods.  

## Getting Started

### 1. Clone & Install

```bash
git clone git@github.com:Andresgott/stripe-project.git
cd stripe-project
cd backend && npm install
cd ../my-stripe-frontend && npm install

