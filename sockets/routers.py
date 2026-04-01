from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserCreate, UserUpdate, UserResponse

# Import all our upgraded auth tools!
from auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    get_current_user, 
    BLACKLISTED_TOKENS,
    oauth2_scheme
)

# THIS IS THE LINE PYTHON WAS LOOKING FOR!
router = APIRouter()

# --- AUTH ROUTES ---
@router.post("/api/auth/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user_data.password)
    new_user = User(email=user_data.email, full_name=user_data.full_name, hashed_password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/api/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password) or not user.is_active:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/api/auth/logout", status_code=200)
def logout(token: str = Depends(oauth2_scheme)):
    BLACKLISTED_TOKENS.add(token)
    return {"message": "Successfully logged out. Token revoked."}

# --- PROFILE ROUTES ---
@router.get("/api/users/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/api/users/me", response_model=UserResponse)
def update_profile(update_data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if update_data.full_name is not None:
        current_user.full_name = update_data.full_name
    if update_data.bio is not None:
        current_user.bio = update_data.bio
    if update_data.avatar_url is not None:
        current_user.avatar_url = update_data.avatar_url
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.delete("/api/users/me", status_code=200)
def soft_delete_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.is_active = False 
    db.commit()
    return {"message": "User profile successfully deactivated."}