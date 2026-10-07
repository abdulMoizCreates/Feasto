# React + Vite

## Supabase customer data

Apply `supabase/migrations/20261007150000_customer_account_data.sql` in the Supabase SQL Editor before using customer carts, wishlists, or order history. The migration creates per-user tables protected by row-level security and an order-placement function that saves the signed-in user's cart as an order and clears that cart atomically.

Profile details are saved in the signed-in user's Supabase Auth metadata. Carts, wishlists, and order history are isolated by the authenticated user ID. Checkout only records the selected payment method; it does not process payments or collect card details.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
