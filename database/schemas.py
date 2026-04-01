from typing import Optional
from pydantic import BaseModel, EmailStr

# 1. Used for Registration
class UserCreate(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    password: str

# 2. Used for Profile Updating (The one Python can't find!)
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

# 3. Used for sending data back to Axios
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    
    class Config:
        from_attributes = True