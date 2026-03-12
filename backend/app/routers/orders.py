from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order_service import OrderService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("/", response_model=list[OrderResponse])
def list_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all orders for the current user, newest first."""
    return OrderService.list_orders(db, user_id=current_user.id)


@router.post("/", response_model=OrderResponse, status_code=201)
def place_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Place an order from the current user's cart."""
    try:
        return OrderService.place_order(db, data, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{order_number}", response_model=OrderResponse)
def get_order(
    order_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Look up an order by its order number (e.g. FM-XXXXXXXX)."""
    order = OrderService.get_order(db, order_number, user_id=current_user.id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_number}/cancel", response_model=OrderResponse)
def cancel_order(
    order_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel a confirmed order and restore product stock."""
    try:
        return OrderService.cancel_order(db, order_number, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
