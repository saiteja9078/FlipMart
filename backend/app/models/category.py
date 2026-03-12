from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(120), nullable=False, unique=True, index=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    products = relationship("Product", back_populates="category", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Category(id={self.id}, name='{self.name}')>"
