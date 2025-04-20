#!/bin/bash

# Check if Poetry is installed
if ! command -v poetry &> /dev/null; then
    echo "Poetry is not installed. Installing Poetry..."
    curl -sSL https://install.python-poetry.org | python3 -
fi

# Install dependencies
echo "Installing dependencies..."
poetry install

# Set up environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "Please edit .env with your actual database credentials."
else
    echo ".env file already exists, skipping..."
fi

# Run Alembic migrations
echo "Running database migrations..."
poetry run alembic upgrade head

echo "Setup complete! You can now run the app with:"
echo "poetry run uvicorn app.main:app --reload" 