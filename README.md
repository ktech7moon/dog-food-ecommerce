# PawsomeMeals

A mobile-responsive e-commerce platform for personalized dog food, empowering pet owners to create tailored nutrition plans with advanced customization and engaging user experience.

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Styling**: Tailwind CSS with Shadcn UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js
- **Payment Processing**: Stripe

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/pawsomemeals
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/pawsomemeals.git
   cd pawsomemeals
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   ```
   npm run db:push
   ```

### Running the Application

Start the development server:
```
npm run dev
```

This will start both the frontend and backend servers. The application will be available at http://localhost:5000.

## Features

- User accounts with secure authentication
- Customizable meal plans (protein types, portion sizes)
- Shopping cart functionality
- Secure payment processing with Stripe
- Order tracking
- Subscription management
- Responsive design for mobile and desktop

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Express API
- `/shared` - Shared types and utilities
- `/mobile` - Mobile app (React Native)