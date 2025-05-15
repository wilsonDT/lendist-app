import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError
from typing import Optional
from app.models.user import User

# Environment variables (ensure these are set in your Vercel environment)
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET")
ALGORITHM = "HS256"  # Supabase typically uses HS256
# Audience claim expected in Supabase JWTs
# This should match the 'aud' claim in the JWTs issued by your Supabase project
# Usually "authenticated" for logged-in users.
# You can inspect a JWT from Supabase (e.g., using jwt.io) to confirm its 'aud' claim.
SUPABASE_AUDIENCE = "authenticated"

if not SUPABASE_JWT_SECRET:
    raise RuntimeError("SUPABASE_JWT_SECRET environment variable not set.")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # tokenUrl is not used by Supabase but required by FastAPI

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, 
            SUPABASE_JWT_SECRET, 
            algorithms=[ALGORITHM],
            audience=SUPABASE_AUDIENCE # Add this line to check audience
        )
        
        # Supabase specific claims to check (optional but good practice)
        # aud = payload.get("aud")
        # if aud != "authenticated": # Default audience for Supabase JWTs
        #     raise credentials_exception

        user_id: Optional[str] = payload.get("sub") # 'sub' is the standard claim for subject (user ID)
        if user_id is None:
            raise credentials_exception
        
        # You can enrich the User model with more data from the payload if needed
        # For example, if Supabase includes email in the token:
        email: Optional[str] = payload.get("email")

        return User(id=user_id, email=email)
    except JWTError as e:
        print(f"JWTError: {e}") # For debugging
        raise credentials_exception
    except ValidationError as e: # If User model validation fails
        print(f"ValidationError: {e}") # For debugging
        raise credentials_exception

# Example of a dependency to get the optional current user (if token is provided)
async def get_optional_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[User]:
    if not token:
        return None
    try:
        return await get_current_user(token)
    except HTTPException:
        return None 