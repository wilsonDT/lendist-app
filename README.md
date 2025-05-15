# Lending App

Lending Management App with FastAPI and Supabase

## Prerequisites

Before you begin, ensure you have met the following requirements:

*   Python 3.10+ and Poetry for the backend (`lending-app`).
*   Node.js and npm for the frontend (`lendist-dashboard`).

## Installation

1.  **Backend (`lending-app`):**
    *   Navigate to the `lending-app` directory: `cd lending-app`
    *   Install dependencies using Poetry: `poetry install`

2.  **Frontend (`lendist-dashboard`):**
    *   Navigate to the `lendist-dashboard` directory: `cd lendist-dashboard`
    *   Install dependencies using npm: `npm install`

## Running the Application

This project uses a `Makefile` at the root to simplify starting the applications.

*   **Start Backend Server:**
    From the project root, run:
    ```bash
    make start
    ```
    This will start the FastAPI development server at `http://0.0.0.0:8000`.

*   **Start Frontend Development Server:**
    From the project root, run:
    ```bash
    make start-dashboard
    ```
    This will start the frontend development server, typically accessible at `http://localhost:3000` (or a similar port specified by your frontend setup).

## Project Structure

*   `lending-app/`: Contains the FastAPI backend application.
    *   `app/`: Core application code (routers, models, services).
    *   `alembic/`: Alembic database migration scripts.
    *   `migrations/`: Alembic version files.
*   `lendist-dashboard/`: Contains the frontend application (details depend on the specific frontend framework used).
*   `Makefile`: Provides convenient commands to manage and run the project.
*   `pyproject.toml`, `poetry.lock`: Python project and dependency management files for the backend. 