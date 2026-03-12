from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime


class OrderCreate(BaseModel):
    """Schema for placing a new order (from cart)."""

    shipping_name: str = Field(min_length=2, max_length=200)
    shipping_address: str = Field(min_length=5, max_length=500)
    shipping_city: str = Field(min_length=2, max_length=100)
    shipping_state: str = Field(min_length=2, max_length=100)
    shipping_pincode: str = Field(min_length=5, max_length=10)
    shipping_phone: str = Field(min_length=10, max_length=15)


class OrderItemResponse(BaseModel):
    """Schema for a single item within an order."""

    id: int
    product_id: int | None
    product_name: str
    product_image: str | None = None
    quantity: int
    price_at_purchase: Decimal

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    """Full order response returned after placement or lookup."""

    id: int
    order_number: str
    total_amount: Decimal
    status: str
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_pincode: str
    shipping_phone: str
    created_at: datetime
    items: list[OrderItemResponse] = []

    model_config = {"from_attributes": True}
