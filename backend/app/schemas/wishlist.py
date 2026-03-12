from pydantic import BaseModel
from datetime import datetime


class WishlistItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str | None = None
    product_image: str | None = None
    product_price: float | None = None
    product_original_price: float | None = None
    product_discount_percent: int | None = None
    product_brand: str | None = None
    product_rating: float | None = None
    product_stock: int | None = None
    created_at: datetime

    class Config:
        from_attributes = True
