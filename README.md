StyleLoop – Production‑Ready E‑commerce Platform
A complete, full‑stack e‑commerce application built with Next.js (App Router), GraphQL (Apollo Server & Client), MongoDB (Mongoose), NextAuth, Stripe & PayPal, Cloudinary, Resend, and shadcn/ui.
This platform includes a public storefront, a fully functional admin dashboard, product management, category management, user management, order tracking, revenue analytics, and secure payment processing.

🚀 Live Demo 


📦 Tech Stack
Layer	Technologies
Frontend	Next.js 15 (App Router, Turbopack), React 18, Tailwind CSS, shadcn/ui
Backend	Next.js API Routes, Apollo Server (GraphQL)
Database	MongoDB, Mongoose ODM
Auth	NextAuth.js (Credentials provider, JWT)
Payments	Stripe (Checkout, Webhooks), PayPal (Buttons, Webhooks)
File Upload	Cloudinary (image uploads with server‑side signature)
Emails	Resend + React Email templates
State	Zustand (client‑side cart), Apollo Client (cache)
Validation	Zod + react‑hook‑form
Analytics	Recharts (dashboard charts)
Deployment	Vercel 
✨ Features
🛍️ Public Storefront
Homepage with best‑selling and new arrivals (powered by totalSold & createdAt)

Product listing with category sidebar, search, price filters, sorting, grid/table toggle

Product detail page with quantity selector and add‑to‑cart

Shopping cart (Zustand + localStorage) – optional backend sync ready

Checkout flow: creates order → shows Stripe/PayPal buttons

Order confirmation page after payment

Full password reset flow (email via Resend)

🔐 User Accounts
Registration & login (NextAuth)

User dashboard (orders, profile – partially implemented)

Role‑based access (Admin / User)

🛠️ Admin Dashboard
Products: list (table/grid), create, edit, delete, bulk actions

Categories: CRUD, toggle active status

Users: manage roles, activate/deactivate, delete

Orders: list, update status

Analytics & Revenue: charts for revenue trends and top products

Store Settings: store name, address, tax, etc.

💳 Payments & Checkout
Order creation with status PENDING

Stripe Checkout session creation via API route

Webhooks for Stripe & PayPal to update order status to PAID and increment totalSold

Secure signature verification for webhooks

📸 Media Management
Cloudinary integration for product images (main, thumbnail, gallery)

Server‑side signature generation (/api/cloudinary/signature)

Direct upload from admin panel with preview

📧 Email
Order confirmation emails (React Email templates)

Password reset emails

Powered by Resend

🧪 Development & Tooling
GraphQL Codegen (fragments, typed hooks)

Seed scripts to populate database with realistic data

Environment variables for all services

Ready for production deployment on Vercel + MongoDB Atlas