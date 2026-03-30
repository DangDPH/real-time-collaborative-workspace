# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints_rest import rest_router
from app.api.endpoints_ws import ws_router
from app.services.db_manager import connect_to_mongo, close_mongo_connection

# 1. Create the application
app = FastAPI(title="Whiteboard API", version="1.0.0")

# 2. CORS Middleware (Crucial for Frontend integration)
# This tells the backend: "It is okay to accept requests from the frontend running on a different port."
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change this to your frontend URL (e.g., http://localhost:3000) in production
    allow_credentials=True,
    allow_methods=["*"], # Allow GET, POST, PUT, DELETE
    allow_headers=["*"],
) 

# 3. Startup and Shutdown Events
# Wire up the database connection functions to run automatically
@app.on_event("startup")
async def startup():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown():
    await close_mongo_connection()

# 4. Attach the API Routes
# Snap the REST and WebSocket routes onto the main application
app.include_router(rest_router)
app.include_router(ws_router)