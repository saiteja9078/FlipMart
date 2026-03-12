import math

from sqlalchemy import func as sql_func
from sqlalchemy.orm import Session

from app.models.product import Product, ProductImage
from app.models.category import Category
from app.schemas.product import ProductBrief, ProductDetail, ProductListResponse


class ProductService:
    """Handles product-related business logic."""

    @staticmethod
    def list_products(
        db: Session,
        *,
        search: str | None = None,
        category_id: int | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        brand: str | None = None,
        sort_by: str | None = None,  # "price_asc", "price_desc", "rating", "newest", "discount"
        page: int = 1,
        limit: int = 20,
    ) -> ProductListResponse:
        """Return a paginated, filterable, sortable list of products."""
        query = db.query(Product)

        # --- Text search ---
        if search:
            search_term = f"%{search.lower()}%"
            query = query.filter(
                sql_func.lower(Product.name).like(search_term)
                | sql_func.lower(Product.brand).like(search_term)
            )

        # --- Category filter ---
        if category_id:
            query = query.filter(Product.category_id == category_id)

        # --- Price range filter ---
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        # --- Brand filter ---
        if brand:
            brands = [b.strip().lower() for b in brand.split(",")]
            query = query.filter(sql_func.lower(Product.brand).in_(brands))

        # --- Sorting ---
        if sort_by == "price_asc":
            query = query.order_by(Product.price.asc())
        elif sort_by == "price_desc":
            query = query.order_by(Product.price.desc())
        elif sort_by == "rating":
            query = query.order_by(Product.rating.desc())
        elif sort_by == "newest":
            query = query.order_by(Product.id.desc())
        elif sort_by == "discount":
            query = query.order_by(Product.discount_percent.desc())
        else:
            query = query.order_by(Product.id)

        # --- Pagination ---
        total = query.count()
        total_pages = math.ceil(total / limit) if total else 1
        offset = (page - 1) * limit
        products = query.offset(offset).limit(limit).all()

        # --- Map to schema ---
        product_briefs = []
        for p in products:
            first_image = p.images[0].image_url if p.images else None
            cat_name = p.category.name if p.category else None
            product_briefs.append(
                ProductBrief(
                    id=p.id,
                    name=p.name,
                    slug=p.slug,
                    price=p.price,
                    original_price=p.original_price,
                    discount_percent=p.discount_percent,
                    brand=p.brand,
                    rating=p.rating,
                    rating_count=p.rating_count,
                    stock=p.stock,
                    image_url=first_image,
                    category_name=cat_name,
                )
            )

        return ProductListResponse(
            products=product_briefs,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
        )

    @staticmethod
    def get_brands(db: Session, *, category_id: int | None = None) -> list[str]:
        """Return a list of unique brand names, optionally filtered by category."""
        query = db.query(Product.brand).filter(Product.brand.isnot(None))
        if category_id:
            query = query.filter(Product.category_id == category_id)
        rows = query.distinct().order_by(Product.brand).all()
        return [r[0] for r in rows if r[0]]

    @staticmethod
    def get_product(db: Session, product_id: int) -> ProductDetail | None:
        """Return full product detail by ID, or None if not found."""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return None

        cat_name = product.category.name if product.category else None

        return ProductDetail(
            id=product.id,
            name=product.name,
            slug=product.slug,
            description=product.description,
            specifications=product.specifications,
            price=product.price,
            original_price=product.original_price,
            discount_percent=product.discount_percent,
            stock=product.stock,
            brand=product.brand,
            rating=product.rating,
            rating_count=product.rating_count,
            category_id=product.category_id,
            category_name=cat_name,
            images=[
                {
                    "id": img.id,
                    "image_url": img.image_url,
                    "display_order": img.display_order,
                }
                for img in product.images
            ],
        )
