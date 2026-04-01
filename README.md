# real-time-collaborative-workspace
# Collaborative Workspace API 🚀

A robust, real-time FastAPI backend designed to power a collaborative workspace (like Notion or Google Docs). It features secure JWT-based authentication, modular architecture, profile management, and a real-time WebSocket engine for live collaboration.

## ✨ Features

* **Secure Authentication:** User registration and login using JWTs.
* **Enterprise-Grade Security:** * Passwords hashed using the **Argon2id** algorithm.
    * Secure token revocation (Logout/Blacklisting).
    * Hidden password fields at the ORM level to prevent accidental data leaks.
* **Profile Management:** Users can view, update, and gracefully soft-delete their profiles.
* **Real-Time Engine:** A live WebSocket manager that broadcasts messages/actions to all connected users in a workspace.
* **Modular Architecture:** Cleanly separated concerns (`routers`, `models`, `schemas`, `auth`, `database`) for high maintainability.

## 🛠️ Tech Stack

* **Framework:** FastAPI
* **Database:** MySQL
* **ORM:** SQLAlchemy
* **Validation:** Pydantic
* **Authentication:** PyJWT, Passlib (Argon2)
* **Real-Time:** WebSockets

## 📁 Project Structure

```text
my_workspace_project/
├── .env                  # Environment variables (Ignored by Git)
├── requirements.txt      # Python dependencies
├── database.py           # MySQL connection and session maker
├── models.py             # SQLAlchemy database tables
├── schemas.py            # Pydantic validation models
├── auth.py               # Hashing, JWT generation, and token blacklisting
├── routers.py            # Standard HTTP routes (Auth & Users)
└── main.py               # App entry point and WebSocket engine
