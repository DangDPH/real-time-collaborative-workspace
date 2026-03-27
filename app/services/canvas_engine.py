# app/services/canvas_engine.py
from app.services.db_manager import db_instance
from app.models.schemas import BoardCreate

async def create_board(board: BoardCreate):
    """Creates a board AND an empty canvas for it to live on."""
    # 1. Convert the Pydantic model into a normal Python dictionary
    board_dict = board.dict()
    
    # 2. Insert into the 'boards' collection
    result = await db_instance.db.boards.insert_one(board_dict)
    
    # MongoDB automatically generates an '_id'. We convert it to a string.
    board_id = str(result.inserted_id)
    
    # 3. Create a blank canvas document linked to this new board_id
    await db_instance.db.canvas_data.insert_one({
        "board_id": board_id, 
        "elements": [],     # Empty list because nothing is drawn yet
        "version": 1        # Start at version 1
    })
    
    # Return the data to the user so they know it succeeded
    return {"id": board_id, **board_dict}

async def get_canvas(board_id: str):
    """Fetches all the drawings for a specific board."""
    # Search the canvas_data collection for a matching board_id
    canvas = await db_instance.db.canvas_data.find_one({"board_id": board_id})
    
    # MongoDB ObjectIds break standard JSON, so we must convert the _id to a string
    if canvas:
        canvas["_id"] = str(canvas["_id"])
        
    return canvas