from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.product import ProductDetail, ProductListResponse
from app.services.product_service import ProductService

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("/", response_model=ProductListResponse)
def list_products(
    search: str | None = Query(None, description="Search by product name or brand"),
    category_id: int | None = Query(None, description="Filter by category ID"),
    min_price: float | None = Query(None, ge=0, description="Minimum price"),
    max_price: float | None = Query(None, ge=0, description="Maximum price"),
    brand: str | None = Query(None, description="Filter by brand(s), comma-separated"),
    sort_by: str | None = Query(None, description="Sort: price_asc, price_desc, rating, newest, discount"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=50, description="Items per page"),
    db: Session = Depends(get_db),
):
    """Return a paginated list of products with filters and sorting."""
    return ProductService.list_products(
        db,
        search=search,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        brand=brand,
        sort_by=sort_by,
        page=page,
        limit=limit,
    )


@router.get("/brands", response_model=list[str])
def list_brands(
    category_id: int | None = Query(None, description="Filter brands by category"),
    db: Session = Depends(get_db),
):
    """Return available brand names, optionally filtered by category."""
    return ProductService.get_brands(db, category_id=category_id)


@router.get("/{product_id}", response_model=ProductDetail)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Return full details for a single product."""
    product = ProductService.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
