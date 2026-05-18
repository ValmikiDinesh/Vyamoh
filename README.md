# Vyamoh 

Vyamoh is a comprehensive AI-powered e-commerce platform tailored for India, focusing initially on premium fashion eyewear. 

## Structure
The project is built as a monorepo containing:
- `client/`: Next.js 14 frontend (React, Tailwind CSS, Framer Motion, Zustand)
- `server/`: Node.js + Express backend (MongoDB, Mongoose)
- `shared/`: Shared types and constants

## Requirements to Run
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI
- Environment variables configured (see `server/.env.example`)

## Environment Setup
1. Duplicate `server/.env.example` as `server/.env` and fill in the values (MongoDB URI, JWT secrets, Razorpay keys, OpenAI key, etc.).
2. From the root directory, run `npm install` to install all monorepo dependencies.
3. Start the project:
   - For backend only: `npm run dev:server`
   - For frontend only: `npm run dev:client`
   - For both: `npm run dev`

### Seeding the Database
To populate the database with categories, an admin user, sample sunglasses, and coupons:
```bash
cd server
npm run seed
```
This creates an admin user with email `admin@vyamoh.com` and password `admin123456`.
