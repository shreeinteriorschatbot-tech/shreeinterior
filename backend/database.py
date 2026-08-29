import logging
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
from auth import get_password_hash

logger = logging.getLogger(__name__)

# Initialize MongoDB client
client = AsyncIOMotorClient(settings.MONGODB_URI)
db = client[settings.DATABASE_NAME]

# Collections mapping
users_col = db["users"]
sites_col = db["sites"]
attendance_col = db["attendance"]
workdone_col = db["workdone"]
bills_col = db["bills"]
payments_col = db["payments"]
chat_col = db["chat"]
contacts_col = db["contacts"]

async def seed_database_if_empty():
    user_count = await users_col.count_documents({})
    if user_count > 0:
        logger.info("Database already seeded. Skipping initial seed.")
        return

    logger.info("Seeding database with default admin user...")
    
    # We only seed the root admin user so they can log in and create original entries
    admin_user = { 
        "id": "usr-admin", 
        "email": "admin@shreeinteriors.com", 
        "name": "Founder Admin", 
        "role": "Admin", 
        "phone": "9941387939", 
        "password_hash": get_password_hash("admin123") 
    }
    await users_col.insert_one(admin_user)
    logger.info("Default admin user seeded successfully!")

