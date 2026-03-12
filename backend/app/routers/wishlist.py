from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.wishlist import WishlistItem
from app.models.product import Product
from app.schemas.wishlist import WishlistItemResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])


def _to_response(item: WishlistItem) -> WishlistItemResponse:
    product = item.product
    first_img = product.images[0].image_url if product and product.images else None
    return WishlistItemResponse(
        id=item.id,
        product_id=item.product_id,
        product_name=product.name if product else None,
        product_image=first_img,
        product_price=float(product.price) if product else None,
        product_original_price=float(product.original_price) if product and product.original_price else None,
        product_discount_percent=product.discount_percent if product else None,
        product_brand=product.brand if product else None,
        product_rating=float(product.rating) if product else None,
        product_stock=product.stock if product else None,
        created_at=item.created_at,
    )


@router.get("/", response_model=list[WishlistItemResponse])
def list_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all wishlist items for the current user."""
    items = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == current_user.id)
        .order_by(WishlistItem.created_at.desc())
        .all()
    )
    return [_to_response(i) for i in items]


@router.post("/{product_id}", response_model=WishlistItemResponse, status_code=201)
def add_to_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a product to the wishlist."""
    # Check product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if already wishlisted
    existing = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
        .first()
    )
    if existing:
        return _to_response(existing)

    item = WishlistItem(user_id=current_user.id, product_id=product_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return _to_response(item)


@router.delete("/{product_id}", status_code=204)
def remove_from_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a product from the wishlist."""
    item = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not in wishlist")
    db.delete(item)
    db.commit()
