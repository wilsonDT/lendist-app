from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str = "supersecretkey"
    APP_NAME: str = "Lending App"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings() 