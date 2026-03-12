from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.cart import (
    CartItemCreate,
    CartItemUpdate,
    CartItemResponse,
    CartResponse,
)
from app.services.cart_service import CartService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/cart", tags=["Cart"])


@router.get("/", response_model=CartResponse)
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the current user's cart with all items and totals."""
    return CartService.get_cart(db, user_id=current_user.id)


@router.post("/", response_model=CartItemResponse, status_code=201)
def add_to_cart(
    data: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a product to the cart (or increment if already present)."""
    try:
        return CartService.add_item(db, data, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{item_id}", response_model=CartItemResponse)
def update_cart_item(
    item_id: int,
    data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the quantity of a cart item."""
    try:
        return CartService.update_item(db, item_id, data, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{item_id}", status_code=204)
def remove_cart_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove an item from the cart."""
    deleted = CartService.remove_item(db, item_id, user_id=current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Cart item not found")
