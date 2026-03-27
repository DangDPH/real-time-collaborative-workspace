# app/services/db_manager.py
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import MONGO_URI, DATABASE_NAME

# We create a class to act as a "bucket" to hold our database connection.
# This prevents us from opening a new connection every single time a user clicks something.
class Database:
    client: AsyncIOMotorClient = None
    db = None

# This single instance will be shared across the whole app (Singleton pattern)
db_instance = Database()

async def connect_to_mongo():
    """Runs when the server starts. Dials the phone to MongoDB."""
    db_instance.client = AsyncIOMotorClient(MONGO_URI)
    db_instance.db = db_instance.client[DATABASE_NAME]
    print(" Connected to MongoDB!")

async def close_mongo_connection():
    """Runs when the server shuts down. Hangs up the phone to save resources."""
    if db_instance.client:
        db_instance.client.close()
        print(" Closed MongoDB connection.")