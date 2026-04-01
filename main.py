import os
from typing import Dict
from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, Query, status
from sqlalchemy.orm import Session
import jwt

from database import get_db
from models import User
from auth import SECRET_KEY, ALGORITHM, BLACKLISTED_TOKENS

# IMPORT YOUR NEW ROUTER HERE
from routers import router 

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

manager = ConnectionManager()

app = FastAPI(title="Collaborative Workspace API")

# PLUG IN THE HTTP ROUTES HERE
app.include_router(router)

# --- WEBSOCKET ROUTE ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...), db: Session = Depends(get_db)):
    if token in BLACKLISTED_TOKENS:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user = db.query(User).filter(User.email == email).first()
        if not user or not user.is_active:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except jwt.PyJWTError:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(user.id, websocket)
    await manager.broadcast(f"User {user.full_name or user.email} has joined the workspace.")
    
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"{user.full_name or user.email} said: {data}")
    except WebSocketDisconnect:
        manager.disconnect(user.id)
        await manager.broadcast(f"User {user.full_name or user.email} has left the workspace.")