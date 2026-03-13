import uuid
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.cart import CartItem
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderResponse



def _generate_order_number() -> str:
    """Generate a unique order number like FM-XXXXXXXX."""
    return f"FM-{uuid.uuid4().hex[:8].upper()}"


class OrderService:
    """Handles order-related business logic."""

    @staticmethod
    def place_order(
        db: Session, data: OrderCreate, user_id: int = 1
    ) -> OrderResponse:
        """Place an order from the user's current cart."""
        cart_items = (
            db.query(CartItem)
            .filter(CartItem.user_id == user_id)
            .all()
        )

        if not cart_items:
            raise ValueError("Cart is empty")

        # Validate stock and compute total
        total_amount = Decimal("0.00")
        order_items_data: list[dict] = []

        for ci in cart_items:
            product = db.query(Product).filter(Product.id == ci.product_id).first()
            if not product:
                raise ValueError(f"Product (id={ci.product_id}) no longer exists")
            if product.stock < ci.quantity:
                raise ValueError(
                    f"Insufficient stock for '{product.name}'. "
                    f"Available: {product.stock}, Requested: {ci.quantity}"
                )

            line_total = product.price * ci.quantity
            total_amount += line_total

            first_image = product.images[0].image_url if product.images else None

            order_items_data.append(
                {
                    "product_id": product.id,
                    "product_name": product.name,
                    "product_image": first_image,
                    "quantity": ci.quantity,
                    "price_at_purchase": product.price,
                }
            )

            # Deduct stock
            product.stock -= ci.quantity

        # Create order
        order = Order(
            order_number=_generate_order_number(),
            user_id=user_id,
            total_amount=total_amount,
            status="confirmed",
            shipping_name=data.shipping_name,
            shipping_address=data.shipping_address,
            shipping_city=data.shipping_city,
            shipping_state=data.shipping_state,
            shipping_pincode=data.shipping_pincode,
            shipping_phone=data.shipping_phone,
        )
        db.add(order)
        db.flush()  # get order.id without committing

        for oi_data in order_items_data:
            db.add(OrderItem(order_id=order.id, **oi_data))

        # Clear cart
        db.query(CartItem).filter(CartItem.user_id == user_id).delete()

        db.commit()
        db.refresh(order)

        return OrderResponse.model_validate(order)

    @staticmethod
    def list_orders(
        db: Session, user_id: int = 1
    ) -> list[OrderResponse]:
        """List all orders for a user, newest first."""
        orders = (
            db.query(Order)
            .filter(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .all()
        )
        return [OrderResponse.model_validate(o) for o in orders]

    @staticmethod
    def get_order(db: Session, order_number: str, user_id: int | None = None) -> OrderResponse | None:
        """Look up an order by its order number."""
        query = db.query(Order).filter(Order.order_number == order_number)
        if user_id is not None:
            query = query.filter(Order.user_id == user_id)
        order = query.first()
        if not order:
            return None
        return OrderResponse.model_validate(order)

    @staticmethod
    def cancel_order(
        db: Session, order_number: str, user_id: int = 1
    ) -> OrderResponse:
        """Cancel an order and restore stock."""
        order = (
            db.query(Order)
            .filter(
                Order.order_number == order_number,
                Order.user_id == user_id,
            )
            .first()
        )

        if not order:
            raise ValueError("Order not found")

        if order.status != "confirmed":
            raise ValueError(
                f"Cannot cancel order with status '{order.status}'. "
                "Only confirmed orders can be cancelled."
            )

        # Restore stock
        order_items = (
            db.query(OrderItem)
            .filter(OrderItem.order_id == order.id)
            .all()
        )
        for oi in order_items:
            if oi.product_id:
                product = db.query(Product).filter(Product.id == oi.product_id).first()
                if product:
                    product.stock += oi.quantity

        order.status = "cancelled"
        db.commit()
        db.refresh(order)

        return OrderResponse.model_validate(order)
