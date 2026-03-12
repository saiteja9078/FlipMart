from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import categories, products, cart, orders, auth, wishlist, addresses

# Import all models so Base.metadata.create_all picks them up
from app.models import user, product, category, cart as cart_model, order, wishlist as wishlist_model  # noqa: F401
from app.models import address as address_model  # noqa: F401


# Create tables on startup (for dev; Alembic handles migrations in prod)

Base.metadata.create_all(bind=engine)


# Application factory

app = FastAPI(
    title="FlipMart API",
    description="Backend API for FlipMart — a Flipkart-inspired e-commerce platform",
    version="2.0.0",
)


# CORS — allow frontend dev server + production domain
# Set ALLOWED_ORIGINS env var on Render (comma-separated) for production.
import os

_default_origins = "http://localhost:5173,http://localhost:3000"
origins = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(wishlist.router)
app.include_router(addresses.router)


@app.get("/", tags=["Health"])
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "app": "FlipMart API"}
