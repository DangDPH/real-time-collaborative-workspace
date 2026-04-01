from sqlalchemy import Column, Integer, String, Boolean
from database import Base, engine
from sqlalchemy.orm import deferred

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    
    # Hidden by default!
    hashed_password = deferred(Column(String(255), nullable=False))
    
    bio = Column(String(500), nullable=True)
    avatar_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)

Base.metadata.create_all(bind=engine)