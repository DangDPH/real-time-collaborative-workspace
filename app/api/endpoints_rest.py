# app/api/endpoints_rest.py
from fastapi import APIRouter, HTTPException
from app.models.schemas import BoardCreate
from app.services import canvas_engine

# APIRouter lets us group related URLs together.
# All routes in this file will automatically start with "/api/boards"
rest_router = APIRouter(prefix="/api/boards", tags=["Boards"])

@rest_router.post("/")
async def create_new_board(board: BoardCreate):
    """Axios POST to /api/boards/ creates a new whiteboard."""
    # We hand the work off to the engine file
    return await canvas_engine.create_board(board)

@rest_router.get("/{board_id}")
async def get_board_data(board_id: str):
    """Axios GET to /api/boards/123 loads the whiteboard data."""
    data = await canvas_engine.get_canvas(board_id)
    
    # If the database returns nothing, we send a standard 404 error back
    if not data:
        raise HTTPException(status_code=404, detail="Board not found")
        
    return data