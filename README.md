# 🍸 Bar Inventory & Revision System

A professional inventory management and audit (revision) system designed for bars. Track stock levels, manage audit losses, and monitor inventory health in real-time.

## 🚀 Tech Stack

* **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
* **Language:** TypeScript
* **Database:** [PostgreSQL](https://www.postgresql.org/) (Hosted on **Neon**)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Styling:** Tailwind CSS
* **Deployment:** Vercel

---

## 💻 Getting Started Locally

### 1. Prerequisites

Ensure you have **Node.js** and **npm** installed.

### 2. Installation

```bash
git clone <your-repo-url>
cd <your-project-name>
npm install

```

### 3. Environment Variables

Create a `.env` file in the root directory and add your Neon connection string:

```env
# Neon Connection String (Direct or Pooled)
DATABASE_URL=YOUR_DATABASE_URL

# Authentication (Better Auth)
BETTER_AUTH_SECRET=YOUR_SECRET_KEY
BETTER_AUTH_URL=http://localhost:3000

```

### 4. Database Setup (Migrations)

Sync your local environment with the Neon database schema:

```bash
# Generate the Prisma Client
npx prisma generate

# Apply migrations to your Neon DB
npx prisma migrate dev

```

### 5. Run the Project

```bash
npm run dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to view the app.

---

## 🗄️ Database Workflow (Prisma + Neon)

Whenever you modify `prisma/schema.prisma`:

1. **Sync Changes:** Run `npx prisma migrate dev --name <description>` to update the Neon database.
2. **Generate Client:** Run `npx prisma generate` to update the TypeScript types for your database.
3. **Reset (If needed):** If your schema drifts from Neon, use `npx prisma migrate reset` (Warning: This wipes all data).

---

## 🚢 Deployment (Vercel)

### Initial Setup

1. Push your code to **GitHub**.
2. Import the repository into **Vercel**.
3. Add the `DATABASE_URL` `BETTER_AUTH_SECRET` `BETTER_AUTH_URL` to the **Environment Variables** in the Vercel Project Settings.

### Updating the Live App

Vercel will automatically deploy every time you push to the `main` branch.

**Important:** If your update includes a database change, ensure you run your migrations before or during deployment.

* You can add `npx prisma generate && npx prisma migrate deploy` to your **Build Command** in Vercel to automate this.

---

## 🛠️ Project Features

* **Dynamic Dashboard:** Real-time recent revisions and inventory status.
* **Live Audits:** Automatic loss calculation and draft-saving logic.
* **Inventory Sync:** "Complete Revision" logic that updates stock levels and "Low Stock" alerts.
* **Mobile Friendly:** Responsive UI for bartenders taking stock on the floor.