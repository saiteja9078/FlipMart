from pydantic import BaseModel
from decimal import Decimal


class ProductImageResponse(BaseModel):
    """Schema for product image data."""

    id: int
    image_url: str
    display_order: int

    model_config = {"from_attributes": True}


class ProductBrief(BaseModel):
    """Compact product representation for listing pages."""

    id: int
    name: str
    slug: str
    price: Decimal
    original_price: Decimal | None = None
    discount_percent: int
    brand: str | None = None
    rating: float
    rating_count: int
    stock: int
    image_url: str | None = None  # first image for the card
    category_name: str | None = None

    model_config = {"from_attributes": True}


class ProductDetail(BaseModel):
    """Full product representation for the detail page."""

    id: int
    name: str
    slug: str
    description: str | None = None
    specifications: str | None = None
    price: Decimal
    original_price: Decimal | None = None
    discount_percent: int
    stock: int
    brand: str | None = None
    rating: float
    rating_count: int
    category_id: int
    category_name: str | None = None
    images: list[ProductImageResponse] = []

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    """Paginated product list response."""

    products: list[ProductBrief]
    total: int
    page: int
    limit: int
    total_pages: int
