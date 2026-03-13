# FlipMart — Flipkart Clone

A full-stack e-commerce web application that replicates Flipkart's design and user experience. Built with React (TypeScript) on the frontend and Python FastAPI on the backend, backed by a PostgreSQL database hosted on Supabase.

**Live Demo:** [https://flip-mart-iota.vercel.app](https://flip-mart-iota.vercel.app)


---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Features](#features)
3. [Database Schema](#database-schema)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Setup Instructions](#setup-instructions)
7. [Seeding the Database](#seeding-the-database)
8. [Running the Application](#running-the-application)
9. [API Endpoints](#api-endpoints)
10. [Assumptions](#assumptions)

---

## Tech Stack

| Layer      | Technology                                                        |
| ---------- | ----------------------------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite, React Router v7, Axios                |
| Backend    | Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic        |
| Database   | PostgreSQL (hosted on Supabase)                                   |
| Auth       | JWT (PyJWT) with bcrypt password hashing                          |
| Styling    | Vanilla CSS (Flipkart-inspired design system)                     |
| DB Driver  | psycopg 3                                                         |

---

## Features

### Core Features

- **Product Listing Page** — Grid layout with product cards replicating Flipkart's design. Includes search-by-name and filter-by-category functionality.
- **Product Detail Page** — Image carousel for multiple product images, full description and specifications, price with discount display, stock availability, and Add to Cart / Buy Now buttons.
- **Shopping Cart** — View all cart items, update quantities, remove items, and see a live cart summary with subtotal and total.
- **Order Placement** — Checkout with shipping address form, order summary review, place-order flow, and an order confirmation page displaying the order number.

### Bonus Features

- **Responsive Design** — Fully responsive across mobile, tablet, and desktop breakpoints.
- **User Authentication** — Signup and Login via modal, JWT-based session management.
- **Order History** — View past orders with item details and order status.
- **Wishlist** — Add/remove products to a personal wishlist, move items to cart.
- **Filter Sidebar** — Filter products by price range, brand, rating, and discount percentage.

---

## Database Schema

The application uses 8 tables with proper foreign key relationships, cascade deletes, and indexing.

```
users
  |- id (PK)
  |- name
  |- email (UNIQUE)
  |- password_hash
  |- created_at

categories
  |- id (PK)
  |- name (UNIQUE)
  |- slug (UNIQUE, INDEX)
  |- image_url
  |- created_at

products
  |- id (PK)
  |- name
  |- slug (UNIQUE, INDEX)
  |- description
  |- specifications (JSON-like text)
  |- price
  |- original_price
  |- discount_percent
  |- stock
  |- brand
  |- rating
  |- rating_count
  |- category_id (FK -> categories.id, CASCADE)
  |- created_at

product_images
  |- id (PK)
  |- product_id (FK -> products.id, CASCADE)
  |- image_url
  |- display_order

cart_items
  |- id (PK)
  |- user_id (FK -> users.id, CASCADE)
  |- product_id (FK -> products.id, CASCADE)
  |- quantity
  |- created_at

orders
  |- id (PK)
  |- order_number (UNIQUE, INDEX)
  |- user_id (FK -> users.id, CASCADE)
  |- total_amount
  |- status
  |- shipping_name, shipping_address, shipping_city,
     shipping_state, shipping_pincode, shipping_phone
  |- created_at

order_items
  |- id (PK)
  |- order_id (FK -> orders.id, CASCADE)
  |- product_id (FK -> products.id, SET NULL)
  |- product_name
  |- product_image
  |- quantity
  |- price_at_purchase

addresses
  |- id (PK)
  |- user_id (FK -> users.id, CASCADE)
  |- name, phone, address_line, city, state, pincode
  |- is_default
  |- created_at

wishlist_items
  |- id (PK)
  |- user_id (FK -> users.id, CASCADE)
  |- product_id (FK -> products.id, CASCADE)
  |- created_at
  |- UNIQUE(user_id, product_id)
```

### Entity Relationship Summary

```
users  1---*  cart_items    *---1  products
users  1---*  orders       1---*  order_items  *---1  products
users  1---*  wishlist_items *---1  products
users  1---*  addresses
categories  1---*  products  1---*  product_images
```

---

## Project Structure

```
FlipMart/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── product.py   # Product + ProductImage
│   │   │   ├── category.py
│   │   │   ├── cart.py
│   │   │   ├── order.py     # Order + OrderItem
│   │   │   ├── address.py
│   │   │   └── wishlist.py
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── routers/         # FastAPI route handlers
│   │   │   ├── auth.py
│   │   │   ├── products.py
│   │   │   ├── categories.py
│   │   │   ├── cart.py
│   │   │   ├── orders.py
│   │   │   ├── wishlist.py
│   │   │   └── addresses.py
│   │   ├── services/        # Business logic layer
│   │   │   ├── auth_service.py
│   │   │   ├── product_service.py
│   │   │   ├── cart_service.py
│   │   │   └── order_service.py
│   │   ├── config.py        # Pydantic Settings (env vars)
│   │   ├── database.py      # SQLAlchemy engine & session
│   │   ├── main.py          # FastAPI app, CORS, routers
│   │   └── seed.py          # Database seeder (30 products, 6 categories)
│   ├── migrations/          # Alembic migration scripts
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API client
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Navbar/
│   │   │   ├── Footer/
│   │   │   ├── ProductCard/
│   │   │   ├── ImageCarousel/
│   │   │   ├── CategoryBar/
│   │   │   ├── FilterSidebar/
│   │   │   ├── AuthModal/
│   │   │   └── ConfirmModal/
│   │   ├── context/         # React Context providers
│   │   │   ├── AuthContext.tsx
│   │   │   ├── CartContext.tsx
│   │   │   └── WishlistContext.tsx
│   │   ├── pages/           # Route-level page components
│   │   │   ├── HomePage/
│   │   │   ├── ProductDetailPage/
│   │   │   ├── CartPage/
│   │   │   ├── CheckoutPage/
│   │   │   ├── OrderConfirmationPage/
│   │   │   ├── OrderHistoryPage/
│   │   │   └── WishlistPage/
│   │   ├── types/           # TypeScript type definitions
│   │   ├── App.tsx          # Root component with routes
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Prerequisites

- **Node.js** >= 18 and **npm** >= 9
- **Python** >= 3.10
- **PostgreSQL** database (or a Supabase project)

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/FlipMart.git
cd FlipMart
```

### 2. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory (refer to `.env.example`):

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
ENVIRONMENT=development
JWT_SECRET=your-secret-key
```

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install
```

---

## Seeding the Database

The seed script populates the database with **6 categories** and **30 products** across Electronics, Fashion, Home & Furniture, Books, Sports, and Beauty & Personal Care.

```bash
cd backend

# Seed the database (skips if data already exists)
python -m app.seed

# To wipe and re-seed
python -m app.seed --reset
```

---

## Running the Application

### Start the backend (port 8000)

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Start the frontend (port 5173)

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API Endpoints

| Method | Endpoint                        | Description                      | Auth     |
| ------ | ------------------------------- | -------------------------------- | -------- |
| POST   | `/api/auth/signup`              | Register a new user              | No       |
| POST   | `/api/auth/login`               | Login and receive JWT            | No       |
| GET    | `/api/categories`               | List all categories              | No       |
| GET    | `/api/products`                 | List products (search, filter)   | No       |
| GET    | `/api/products/{id}`            | Get product details              | No       |
| GET    | `/api/cart`                     | Get current user's cart          | Yes      |
| POST   | `/api/cart`                     | Add item to cart                 | Yes      |
| PUT    | `/api/cart/{item_id}`           | Update cart item quantity         | Yes      |
| DELETE | `/api/cart/{item_id}`           | Remove item from cart            | Yes      |
| POST   | `/api/orders`                   | Place an order                   | Yes      |
| GET    | `/api/orders`                   | Get user's order history         | Yes      |
| GET    | `/api/orders/{order_number}`    | Get order details                | Yes      |
| GET    | `/api/wishlist`                 | Get user's wishlist              | Yes      |
| POST   | `/api/wishlist`                 | Add product to wishlist          | Yes      |
| DELETE | `/api/wishlist/{product_id}`    | Remove from wishlist             | Yes      |
| GET    | `/api/addresses`                | Get user's saved addresses       | Yes      |
| POST   | `/api/addresses`                | Add a new address                | Yes      |
| PUT    | `/api/addresses/{id}`           | Update an address                | Yes      |
| DELETE | `/api/addresses/{id}`           | Delete an address                | Yes      |

---

## Assumptions

1. **Default user flow:** While authentication is implemented (signup/login with JWT), the app is designed to be fully usable without logging in for browsing products. Cart, wishlist, and order features require authentication.
2. **Payment gateway:** No real payment integration is included. Orders are placed directly and marked as "confirmed."
3. **Product images:** Product images are sourced from Unsplash for demonstration. In production, these would be served from a CDN or object storage.
4. **Database hosting:** PostgreSQL is hosted on Supabase (free tier). The connection string is configured via environment variables.
5. **Single currency:** All prices are displayed in INR (Indian Rupees) to match Flipkart's native experience.
6. **Stock management:** Stock is decremented when an order is placed. No stock reservation or hold mechanism is implemented.
7. **Schema migrations:** Alembic is configured for database migrations. During development, `Base.metadata.create_all()` is also used for convenience.

## License
This project was developed as part of a Scalar AI Labs assignment and is intended for evaluation purposes only.
