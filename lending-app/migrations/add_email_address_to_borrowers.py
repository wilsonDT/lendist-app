"""
Migration script to add email and address columns to the borrower table.

Run this script with:
python -m lending-app.migrations.add_email_address_to_borrowers
"""

import asyncio
import asyncpg
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get database connection details from environment variables
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "lending_app")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

async def run_migration():
    # Connect to the database
    conn = await asyncpg.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
    
    # Begin transaction
    async with conn.transaction():
        # Check if columns already exist
        email_exists = await conn.fetchval(
            "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borrower' AND column_name = 'email')"
        )
        address_exists = await conn.fetchval(
            "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'borrower' AND column_name = 'address')"
        )
        
        # Add email column if it doesn't exist
        if not email_exists:
            print("Adding email column to borrower table...")
            await conn.execute("ALTER TABLE borrower ADD COLUMN email TEXT")
        else:
            print("Email column already exists in borrower table")
        
        # Add address column if it doesn't exist
        if not address_exists:
            print("Adding address column to borrower table...")
            await conn.execute("ALTER TABLE borrower ADD COLUMN address TEXT")
        else:
            print("Address column already exists in borrower table")
    
    # Close the connection
    await conn.close()
    print("Migration completed successfully")

if __name__ == "__main__":
    asyncio.run(run_migration()) 