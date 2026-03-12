from sqlalchemy import (
    Column, Integer, String, Text, Numeric, Float,
    ForeignKey, DateTime,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    slug = Column(String(350), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    specifications = Column(Text, nullable=True)      # JSON-like text for specs
    price = Column(Numeric(10, 2), nullable=False)
    original_price = Column(Numeric(10, 2), nullable=True)
    discount_percent = Column(Integer, default=0)
    stock = Column(Integer, default=0)
    brand = Column(String(150), nullable=True)
    rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    category_id = Column(
        Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    category = relationship("Category", back_populates="products")
    images = relationship(
        "ProductImage",
        back_populates="product",
        lazy="selectin",
        order_by="ProductImage.display_order",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Product(id={self.id}, name='{self.name}')>"


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    image_url = Column(String(500), nullable=False)
    display_order = Column(Integer, default=0)

    # Relationships
    product = relationship("Product", back_populates="images")

    def __repr__(self) -> str:
        return f"<ProductImage(id={self.id}, product_id={self.product_id})>"
