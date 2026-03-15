from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.address import AddressCreate, AddressUpdate, AddressResponse
from app.services.auth_service import get_current_user
from app.services import address_service

router = APIRouter(prefix="/api/addresses", tags=["Addresses"])


@router.get("/", response_model=list[AddressResponse])
def list_addresses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all saved addresses for the current user."""
    addresses = address_service.list_addresses(db=db, user_id=current_user.id)
    return [AddressResponse.model_validate(a) for a in addresses]


@router.post("/", response_model=AddressResponse, status_code=201)
def create_address(
    data: AddressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new address. If marked as default, un-default all others."""
    address = address_service.create_address(db=db, user_id=current_user.id, data=data)
    return AddressResponse.model_validate(address)


@router.put("/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: int,
    data: AddressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an existing address."""
    address = address_service.update_address(db=db, address_id=address_id, user_id=current_user.id, data=data)
    return AddressResponse.model_validate(address)


@router.delete("/{address_id}", status_code=204)
def delete_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a saved address."""
    address_service.delete_address(db=db, address_id=address_id, user_id=current_user.id)
