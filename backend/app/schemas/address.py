from pydantic import BaseModel, Field
from datetime import datetime


class AddressCreate(BaseModel):
    """Schema for creating a new address."""
    name: str = Field(min_length=2, max_length=200)
    phone: str = Field(min_length=10, max_length=15)
    address_line: str = Field(min_length=5, max_length=500)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    pincode: str = Field(min_length=5, max_length=10)
    is_default: bool = False


class AddressUpdate(BaseModel):
    """Schema for updating an address."""
    name: str | None = Field(None, min_length=2, max_length=200)
    phone: str | None = Field(None, min_length=10, max_length=15)
    address_line: str | None = Field(None, min_length=5, max_length=500)
    city: str | None = Field(None, min_length=2, max_length=100)
    state: str | None = Field(None, min_length=2, max_length=100)
    pincode: str | None = Field(None, min_length=5, max_length=10)
    is_default: bool | None = None


class AddressResponse(BaseModel):
    """Schema for returning address data."""
    id: int
    name: str
    phone: str
    address_line: str
    city: str
    state: str
    pincode: str
    is_default: bool
    created_at: datetime

    model_config = {"from_attributes": True}
