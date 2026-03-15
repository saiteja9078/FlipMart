from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.address import Address
from app.schemas.address import AddressCreate, AddressUpdate


def list_addresses(db: Session, user_id: int):
    return (
        db.query(Address)
        .filter(Address.user_id == user_id)
        .order_by(Address.is_default.desc(), Address.created_at.desc())
        .all()
    )


def create_address(db: Session, user_id: int, data: AddressCreate):
    if data.is_default:
        db.query(Address).filter(
            Address.user_id == user_id
        ).update({"is_default": False})

    address = Address(
        user_id=user_id,
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
    count = db.query(Address).filter(Address.user_id == user_id).count()
    if count == 1 and not address.is_default:
        address.is_default = True
        db.commit()
        db.refresh(address)

    return address


def update_address(db: Session, address_id: int, user_id: int, data: AddressUpdate):
    address = (
        db.query(Address)
        .filter(Address.id == address_id, Address.user_id == user_id)
        .first()
    )
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    update_data = data.model_dump(exclude_unset=True)

    # If setting as default, un-default others
    if update_data.get("is_default"):
        db.query(Address).filter(
            Address.user_id == user_id,
            Address.id != address_id,
        ).update({"is_default": False})

    for key, value in update_data.items():
        setattr(address, key, value)

    db.commit()
    db.refresh(address)
    return address


def delete_address(db: Session, address_id: int, user_id: int):
    address = (
        db.query(Address)
        .filter(Address.id == address_id, Address.user_id == user_id)
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
            .filter(Address.user_id == user_id)
            .order_by(Address.created_at.desc())
            .first()
        )
        if next_addr:
            next_addr.is_default = True
            db.commit()
