# TripWise

**AI-powered travel planning made easier.**

TripWise is an AI travel-planning application that helps users generate personalized itineraries, explore places, check weather information, estimate travel costs, and manage their trips. It also includes an AI travel assistant and Stripe-powered credit purchases.

## Features

User registration and login
AI-generated travel itineraries
Places search and interactive maps
Weather information
Daily and total trip cost estimates
AI travel assistant with itinerary change proposals
Credit purchases using Stripe
Trip management and itinerary details
Streaming progress during trip generation

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- Leaflet

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT authentication
- Zod validation

### External Services

- Google Gemini API
- OpenStreetMap Nominatim
- Open-Meteo
- Stripe

## Project Structure

```text
tripwise/
├── api/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   ├── package.json
│   └── package-lock.json
├── web/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running TripWise:

- [Node.js](https://nodejs.org/) (use a version compatible with the project dependencies)
- npm
- [PostgreSQL](https://www.postgresql.org/)
- Git

You will also need API credentials for Google Gemini and Stripe. Stripe test-mode credentials are suitable for local payment testing.

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd tripwise
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your GitHub repository URL.

### 2. Install backend dependencies

```bash
cd api
npm install
```

### 3. Configure backend environment variables

Create an `api/.env` file and configure the environment variables required by the backend.

The exact variable names must match those referenced in the API source code. They include settings for:

- PostgreSQL connection
- JWT authentication
- Google Gemini API
- Stripe secret key
- Stripe webhook secret
- API port, if configured through an environment variable

Do not commit your `.env` file or share your secret keys publicly.

### 4. Set up PostgreSQL

Create a PostgreSQL database for TripWise and configure the database connection string in `api/.env`.

For example, a connection string generally follows this format:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/tripwise"
```

Replace the example values with your own database credentials.

### 5. Generate Prisma Client and apply migrations

From the `api` directory, run the Prisma commands appropriate for the project's installed Prisma version and configuration.

```bash
npx prisma generate
npx prisma migrate deploy
```

If the project uses a custom Prisma configuration or a different migration workflow, follow the commands configured in the API project.

### 6. Start the backend

From the `api` directory, use the development script defined in `api/package.json`.

```bash
npm run dev
```

The API is expected to run at:

```text
http://localhost:4000
```

### 7. Install frontend dependencies

Open a second terminal and navigate to the project root:

```bash
cd web
npm install
```

### 8. Configure frontend environment variables

Create a `web/.env.local` file and set the frontend API base URL expected by the application.

For a local setup, the API URL is typically:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Check the frontend source code for the exact environment variable name used by the application.

### 9. Start the frontend

From the `web` directory, run:

```bash
npm run dev
```

Open the local URL shown in the terminal, usually:

```text
http://localhost:3000
```

Make sure the PostgreSQL database and backend API are running before using features that require them.

## Stripe Payment Testing

TripWise uses Stripe to process credit purchases.

For local development:

1. Configure Stripe test-mode credentials.
2. Start the backend and frontend.
3. Configure Stripe webhook forwarding to the backend webhook endpoint using the endpoint implemented in the API.
4. Use Stripe's test payment details rather than real payment information.

Never expose Stripe secret keys or webhook secrets in frontend code or public repositories.

## Environment Variables and Security

- Keep API keys, database passwords, JWT secrets, and Stripe secrets private.
- Use `.env` and `.env.local` files for local configuration.
- Never upload real environment files to GitHub.
- Keep dependency lock files in version control.
- Install dependencies with `npm install` rather than uploading `node_modules`.

## Current Status

TripWise is a local development project. The frontend, backend, database, AI itinerary generation, maps, weather, AI chat, and Stripe test checkout have been tested locally.

**Online deployment is planned for a later stage.**

## License

No license has been specified yet.
