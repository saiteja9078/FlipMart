from pydantic import BaseModel
from datetime import datetime


class CategoryResponse(BaseModel):
    """Schema for category data returned to the client."""

    id: int
    name: str
    slug: str
    image_url: str | None = None

    model_config = {"from_attributes": True}
