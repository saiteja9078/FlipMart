from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.address import Address
from app.schemas.address import AddressCreate, AddressUpdate, AddressResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/addresses", tags=["Addresses"])


@router.get("/", response_model=list[AddressResponse])
def list_addresses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all saved addresses for the current user."""
    addresses = (
        db.query(Address)
        .filter(Address.user_id == current_user.id)
        .order_by(Address.is_default.desc(), Address.created_at.desc())
        .all()
    )
    return [AddressResponse.model_validate(a) for a in addresses]


@router.post("/", response_model=AddressResponse, status_code=201)
def create_address(
    data: AddressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new address. If marked as default, un-default all others."""
    if data.is_default:
        db.query(Address).filter(
            Address.user_id == current_user.id
        ).update({"is_default": False})

    address = Address(
        user_id=current_user.id,
        name=data.name,
        phone=data.phone,
        address_line=data.address_line,
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        is_default=data.is_default,
    )
    db.add(address)
    db.commit()
    db.refresh(address)

    # If this is the first address, make it default automatically
    count = db.query(Address).filter(Address.user_id == current_user.id).count()
    if count == 1 and not address.is_default:
        address.is_default = True
        db.commit()
        db.refresh(address)

    return AddressResponse.model_validate(address)


@router.put("/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: int,
    data: AddressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an existing address."""
    address = (
        db.query(Address)
        .filter(Address.id == address_id, Address.user_id == current_user.id)
        .first()
    )
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    update_data = data.model_dump(exclude_unset=True)

    # If setting as default, un-default others
    if update_data.get("is_default"):
        db.query(Address).filter(
            Address.user_id == current_user.id,
            Address.id != address_id,
        ).update({"is_default": False})

    for key, value in update_data.items():
        setattr(address, key, value)

    db.commit()
    db.refresh(address)
    return AddressResponse.model_validate(address)


@router.delete("/{address_id}", status_code=204)
def delete_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a saved address."""
    address = (
        db.query(Address)
        .filter(Address.id == address_id, Address.user_id == current_user.id)
        .first()
    )
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    was_default = address.is_default
    db.delete(address)
    db.commit()

    # If deleted address was default, promote the most recent one
    if was_default:
        next_addr = (
            db.query(Address)
            .filter(Address.user_id == current_user.id)
            .order_by(Address.created_at.desc())
            .first()
        )
        if next_addr:
            next_addr.is_default = True
            db.commit()
