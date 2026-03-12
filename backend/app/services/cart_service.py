from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.cart import CartItem
from app.models.product import Product
from app.schemas.cart import (
    CartItemCreate,
    CartItemUpdate,
    CartItemResponse,
    CartItemProductInfo,
    CartResponse,
)


DEFAULT_USER_ID = 1


class CartService:
    """Handles cart-related business logic."""

    @staticmethod
    def get_cart(db: Session, user_id: int = DEFAULT_USER_ID) -> CartResponse:
        """Return the full cart for a user with computed totals."""
        items = (
            db.query(CartItem)
            .filter(CartItem.user_id == user_id)
            .order_by(CartItem.created_at)
            .all()
        )

        cart_items: list[CartItemResponse] = []
        subtotal = Decimal("0.00")

        for item in items:
            product = item.product
            first_image = product.images[0].image_url if product.images else None

            product_info = CartItemProductInfo(
                id=product.id,
                name=product.name,
                price=product.price,
                original_price=product.original_price,
                discount_percent=product.discount_percent,
                stock=product.stock,
                brand=product.brand,
                image_url=first_image,
            )

            cart_items.append(
                CartItemResponse(
                    id=item.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    product=product_info,
                )
            )
            subtotal += product.price * item.quantity

        total_items = sum(i.quantity for i in cart_items)

        return CartResponse(
            items=cart_items,
            total_items=total_items,
            subtotal=subtotal,
            total=subtotal,  # no tax/shipping for now
        )

    @staticmethod
    def add_item(
        db: Session, data: CartItemCreate, user_id: int = DEFAULT_USER_ID
    ) -> CartItemResponse:
        """Add a product to the cart, or increment quantity if already present."""
        # Validate product exists and is in stock
        product = db.query(Product).filter(Product.id == data.product_id).first()
        if not product:
            raise ValueError("Product not found")
        if product.stock < data.quantity:
            raise ValueError("Insufficient stock")

        # Check if item already in cart
        existing = (
            db.query(CartItem)
            .filter(
                CartItem.user_id == user_id,
                CartItem.product_id == data.product_id,
            )
            .first()
        )

        if existing:
            existing.quantity += data.quantity
            if existing.quantity > product.stock:
                existing.quantity = product.stock
            db.commit()
            db.refresh(existing)
            cart_item = existing
        else:
            cart_item = CartItem(
                user_id=user_id,
                product_id=data.product_id,
                quantity=data.quantity,
            )
            db.add(cart_item)
            db.commit()
            db.refresh(cart_item)

        first_image = product.images[0].image_url if product.images else None
        product_info = CartItemProductInfo(
            id=product.id,
            name=product.name,
            price=product.price,
            original_price=product.original_price,
            discount_percent=product.discount_percent,
            stock=product.stock,
            brand=product.brand,
            image_url=first_image,
        )

        return CartItemResponse(
            id=cart_item.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            product=product_info,
        )

    @staticmethod
    def update_item(
        db: Session, item_id: int, data: CartItemUpdate, user_id: int = DEFAULT_USER_ID
    ) -> CartItemResponse:
        """Update the quantity of a cart item."""
        cart_item = (
            db.query(CartItem)
            .filter(CartItem.id == item_id, CartItem.user_id == user_id)
            .first()
        )
        if not cart_item:
            raise ValueError("Cart item not found")

        product = cart_item.product
        if data.quantity > product.stock:
            raise ValueError("Insufficient stock")

        cart_item.quantity = data.quantity
        db.commit()
        db.refresh(cart_item)

        first_image = product.images[0].image_url if product.images else None
        product_info = CartItemProductInfo(
            id=product.id,
            name=product.name,
            price=product.price,
            original_price=product.original_price,
            discount_percent=product.discount_percent,
            stock=product.stock,
            brand=product.brand,
            image_url=first_image,
        )

        return CartItemResponse(
            id=cart_item.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            product=product_info,
        )

    @staticmethod
    def remove_item(
        db: Session, item_id: int, user_id: int = DEFAULT_USER_ID
    ) -> bool:
        """Remove an item from the cart. Returns True if deleted."""
        cart_item = (
            db.query(CartItem)
            .filter(CartItem.id == item_id, CartItem.user_id == user_id)
            .first()
        )
        if not cart_item:
            return False

        db.delete(cart_item)
        db.commit()
        return True
