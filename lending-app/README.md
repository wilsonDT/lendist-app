# Lending App MVP

A minimal lending management app built with FastAPI, SQLModel, and Supabase PostgreSQL, featuring loan amortization calculation and automated payment reminders.

## Features

- Borrower management
- Loan creation and tracking
- Payment schedule generation (flat or amortized)
- Automatic payment reminders
- Simple dashboard for monitoring loans

## Tech Stack

- **FastAPI**: Modern, fast web framework
- **SQLModel**: SQL databases in Python, designed for simplicity
- **Alembic**: Database migrations
- **Supabase PostgreSQL**: Hosted database
- **APScheduler**: Task scheduling for reminders

## Setup

### Prerequisites

- Python 3.10+
- Poetry for dependency management

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/lending-app.git
   cd lending-app
   ```

2. Install dependencies with Poetry:
   ```bash
   poetry install
   ```

3. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your Supabase PostgreSQL credentials.

5. Run database migrations:
   ```bash
   poetry run alembic upgrade head
   ```

### Running the Application

Start the application with:

```bash
poetry run uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000, and the interactive API documentation at http://localhost:8000/docs.

## API Endpoints

- `/borrowers` - Borrower CRUD operations
- `/loans` - Loan management endpoints
- `/payments` - Payment tracking and recording
- `/dashboard` - Summary statistics
- `/reminders` - Manual payment reminder triggers

## Database Schema

The application uses three main tables:

- **Borrower**: Contact information of people borrowing money
- **Loan**: Terms and conditions of each loan
- **Payment**: Individual payment records with due dates

## License

MIT 