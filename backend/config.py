import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load env variables from .env file if it exists
load_dotenv()

class Settings(BaseSettings):
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "shree_interiors")
    
    # Cloudinary Config
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")
    
    # JWT Auth Config
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super_secret_key_for_shree_interiors_123456")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

settings = Settings()
