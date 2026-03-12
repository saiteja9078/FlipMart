from pydantic import BaseModel, Field
from decimal import Decimal


class CartItemCreate(BaseModel):
    """Schema for adding an item to the cart."""

    product_id: int
    quantity: int = Field(default=1, ge=1, le=10)


class CartItemUpdate(BaseModel):
    """Schema for updating cart item quantity."""

    quantity: int = Field(ge=1, le=10)


class CartItemProductInfo(BaseModel):
    """Nested product info within a cart item response."""

    id: int
    name: str
    price: Decimal
    original_price: Decimal | None = None
    discount_percent: int
    stock: int
    brand: str | None = None
    image_url: str | None = None

    model_config = {"from_attributes": True}


class CartItemResponse(BaseModel):
    """Schema for a single cart item returned to the client."""

    id: int
    product_id: int
    quantity: int
    product: CartItemProductInfo

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    """Full cart response with items and computed totals."""

    items: list[CartItemResponse]
    total_items: int
    subtotal: Decimal
    total: Decimal
