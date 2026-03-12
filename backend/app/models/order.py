from sqlalchemy import (
    Column, Integer, String, Numeric, ForeignKey, DateTime,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(20), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    total_amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(50), nullable=False, default="confirmed")

    # Shipping details
    shipping_name = Column(String(200), nullable=False)
    shipping_address = Column(String(500), nullable=False)
    shipping_city = Column(String(100), nullable=False)
    shipping_state = Column(String(100), nullable=False)
    shipping_pincode = Column(String(10), nullable=False)
    shipping_phone = Column(String(15), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    items = relationship(
        "OrderItem",
        back_populates="order",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Order(id={self.id}, order_number='{self.order_number}')>"


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(
        Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    product_id = Column(
        Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True
    )
    product_name = Column(String(300), nullable=False)
    product_image = Column(String(500), nullable=True)
    quantity = Column(Integer, nullable=False)
    price_at_purchase = Column(Numeric(10, 2), nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", lazy="selectin")

    def __repr__(self) -> str:
        return f"<OrderItem(id={self.id}, order_id={self.order_id}, product_id={self.product_id})>"
