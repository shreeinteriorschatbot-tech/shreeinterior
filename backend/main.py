import os
import uuid
import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
import logging

from config import settings
from database import (
    seed_database_if_empty,
    users_col,
    sites_col,
    attendance_col,
    workdone_col,
    bills_col,
    payments_col,
    chat_col,
    contacts_col
)
from models import (
    UserRole, UserCreate, UserUpdate, UserOut, LoginRequest, TokenResponse,
    SiteCreate, SiteUpdate, SiteOut, ChecklistItem,
    AttendanceCreate, AttendanceOut,
    WorkDoneCreate, WorkDoneReview, WorkDoneOut,
    BillCreate, BillReview, BillOut,
    PaymentCreate, PaymentUpdate, PaymentOut,
    ChatMessageCreate, ChatMessageOut,
    ContactFormCreate
)
from auth import (
    verify_password, get_password_hash, create_access_token, get_current_user_from_token
)
from cloudinary_service import upload_to_cloudinary

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Shree Interiors API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Shree Interiors API is running successfully!",
        "docs": "/docs"
    }

@app.on_event("startup")
async def startup_db_client():
    await seed_database_if_empty()

# --- AUTHENTICATION ---

@app.on_event("startup")
async def test_env():
    logger.info(f"Database Config: {settings.DATABASE_NAME} - URI: {settings.MONGODB_URI[:25]}...")

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(login_req: LoginRequest):
    user = await users_col.find_one({"email": login_req.email.lower().strip()})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if not verify_password(login_req.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    access_token = create_access_token(
        data={"sub": user["id"], "email": user["email"], "role": user["role"], "name": user["name"]}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "phone": user["phone"]
        }
    }

@app.get("/api/auth/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user_from_token)):
    user = await users_col.find_one({"id": current_user["id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# --- USERS MANAGEMENT ---

@app.get("/api/users", response_model=List[UserOut])
async def get_users(current_user: dict = Depends(get_current_user_from_token)):
    cursor = users_col.find({})
    users = []
    async for doc in cursor:
        users.append(doc)
    return users

@app.post("/api/users", response_model=UserOut)
async def create_user(user_in: UserCreate, current_user: dict = Depends(get_current_user_from_token)):
    # Check permissions
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only Admins can manage users")
        
    # Check key when creating Master Admin
    if user_in.role == UserRole.ADMIN:
        if user_in.admin_key != "IAMYOURMASTER":
            raise HTTPException(status_code=400, detail="Invalid Master Admin authorization key")

    existing = await users_col.find_one({"email": user_in.email.lower().strip()})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
        
    new_id = f"usr-{uuid.uuid4().hex[:8]}"
    hashed_pwd = get_password_hash(user_in.password)
    
    user_doc = {
        "id": new_id,
        "email": user_in.email.lower().strip(),
        "name": user_in.name,
        "role": user_in.role.value,
        "phone": user_in.phone,
        "password_hash": hashed_pwd
    }
    await users_col.insert_one(user_doc)
    return user_doc

@app.put("/api/users/{user_id}", response_model=UserOut)
async def update_user(user_id: str, user_in: UserUpdate, current_user: dict = Depends(get_current_user_from_token)):
    # Admin or self update
    if current_user["role"] != UserRole.ADMIN and current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Permission denied")
        
    user = await users_col.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = {}
    if user_in.email is not None:
        # Check uniqueness if email changing
        new_email = user_in.email.lower().strip()
        if new_email != user["email"]:
            existing = await users_col.find_one({"email": new_email})
            if existing:
                raise HTTPException(status_code=400, detail="Email already taken")
            update_data["email"] = new_email
            
    if user_in.name is not None:
        update_data["name"] = user_in.name
    if user_in.role is not None and current_user["role"] == UserRole.ADMIN:
        update_data["role"] = user_in.role.value
    if user_in.phone is not None:
        update_data["phone"] = user_in.phone
    if user_in.password is not None and user_in.password.strip():
        update_data["password_hash"] = get_password_hash(user_in.password)
        
    if update_data:
        await users_col.update_one({"id": user_id}, {"$set": update_data})
        
    updated_user = await users_col.find_one({"id": user_id})
    return updated_user

@app.delete("/api/users/{user_id}")
async def delete_user(
    user_id: str, 
    admin_key: Optional[str] = None, 
    current_user: dict = Depends(get_current_user_from_token)
):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only Admins can delete users")
        
    target_user = await users_col.find_one({"id": user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check key when deleting a Master Admin
    if target_user["role"] == UserRole.ADMIN.value:
        if admin_key != "IAMYOURMASTER":
            raise HTTPException(status_code=400, detail="Invalid Master Key to delete Admin account")
            
    res = await users_col.delete_one({"id": user_id})
    return {"message": "User deleted successfully"}

# --- SITES MANAGEMENT ---

@app.get("/api/sites", response_model=List[SiteOut])
async def get_sites(current_user: dict = Depends(get_current_user_from_token)):
    cursor = sites_col.find({})
    sites = []
    async for doc in cursor:
        sites.append(doc)
    return sites

@app.post("/api/sites", response_model=SiteOut)
async def create_site(site_in: SiteCreate, current_user: dict = Depends(get_current_user_from_token)):
    if current_user["role"] not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Permission denied")
        
    new_id = f"site-{uuid.uuid4().hex[:8]}"
    site_doc = site_in.dict()
    site_doc["id"] = new_id
    
    # Format checklist item ids if not present
    for i, item in enumerate(site_doc.get("checklist", [])):
        if not item.get("id"):
            item["id"] = f"chk-{new_id}-{i+1}"
            
    await sites_col.insert_one(site_doc)
    return site_doc

@app.put("/api/sites/{site_id}", response_model=SiteOut)
async def update_site(site_id: str, site_in: SiteUpdate, current_user: dict = Depends(get_current_user_from_token)):
    if current_user["role"] not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Permission denied")
        
    site = await sites_col.find_one({"id": site_id})
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
        
    update_data = {k: v for k, v in site_in.dict(exclude_unset=True).items()}
    
    if update_data:
        # Check checklists items and format them
        if "checklist" in update_data:
            checklist_items = []
            for item in update_data["checklist"]:
                # Pydantic validates this list
                checklist_items.append(item)
            update_data["checklist"] = checklist_items
            
        await sites_col.update_one({"id": site_id}, {"$set": update_data})
        
    updated_site = await sites_col.find_one({"id": site_id})
    return updated_site

@app.delete("/api/sites/{site_id}")
async def delete_site(site_id: str, current_user: dict = Depends(get_current_user_from_token)):
    if current_user["role"] not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Permission denied")
        
    res = await sites_col.delete_one({"id": site_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Site not found")
    return {"message": "Site deleted successfully"}

# --- ATTENDANCE ---

@app.get("/api/attendance", response_model=List[AttendanceOut])
async def get_attendance(current_user: dict = Depends(get_current_user_from_token)):
    cursor = attendance_col.find({}).sort("timestamp", -1)
    logs = []
    async for doc in cursor:
        logs.append(doc)
    return logs

@app.post("/api/attendance", response_model=AttendanceOut)
async def create_attendance(attendance_in: AttendanceCreate, current_user: dict = Depends(get_current_user_from_token)):
    new_id = f"att-{uuid.uuid4().hex[:8]}"
    
    attendance_doc = {
        "id": new_id,
        "userId": current_user["id"],
        "userName": current_user["name"],
        "role": current_user["role"],
        "siteId": attendance_in.siteId,
        "siteName": attendance_in.siteName,
        "type": attendance_in.type,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "latitude": attendance_in.latitude,
        "longitude": attendance_in.longitude,
        "isSimulated": attendance_in.isSimulated,
        "distance": attendance_in.distance
    }
    
    await attendance_col.insert_one(attendance_doc)
    return attendance_doc

# --- WORK DONE SUBMISSIONS ---

@app.get("/api/workdone", response_model=List[WorkDoneOut])
async def get_workdone(current_user: dict = Depends(get_current_user_from_token)):
    cursor = workdone_col.find({}).sort("timestamp", -1)
    records = []
    async for doc in cursor:
        records.append(doc)
    return records

@app.post("/api/workdone", response_model=WorkDoneOut)
async def create_workdone(work_in: WorkDoneCreate, current_user: dict = Depends(get_current_user_from_token)):
    new_id = f"wd-{uuid.uuid4().hex[:8]}"
    
    # Upload base64 image or url to Cloudinary
    photo_url = upload_to_cloudinary(work_in.photoUrl, folder="work_done")
    
    work_doc = {
        "id": new_id,
        "userId": current_user["id"],
        "userName": current_user["name"],
        "role": current_user["role"],
        "siteId": work_in.siteId,
        "siteName": work_in.siteName,
        "photoUrl": photo_url,
        "description": work_in.description,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "reviewText": None
    }
    
    await workdone_col.insert_one(work_doc)
    return work_doc

@app.put("/api/workdone/{work_id}/review", response_model=WorkDoneOut)
async def review_workdone(work_id: str, review: WorkDoneReview, current_user: dict = Depends(get_current_user_from_token)):
    if current_user["role"] not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Only Managers and Admins can review work logs")
        
    wd = await workdone_col.find_one({"id": work_id})
    if not wd:
        raise HTTPException(status_code=404, detail="Work record not found")
        
    await workdone_col.update_one({"id": work_id}, {"$set": {"reviewText": review.reviewText}})
    updated_wd = await workdone_col.find_one({"id": work_id})
    return updated_wd

# --- BILL CLAIMS ---

@app.get("/api/bills", response_model=List[BillOut])
async def get_bills(current_user: dict = Depends(get_current_user_from_token)):
    cursor = bills_col.find({}).sort("timestamp", -1)
    bills = []
    async for doc in cursor:
        bills.append(doc)
    return bills

@app.post("/api/bills", response_model=BillOut)
async def create_bill(bill_in: BillCreate, current_user: dict = Depends(get_current_user_from_token)):
    new_id = f"bill-{uuid.uuid4().hex[:8]}"
    
    # Upload invoice to Cloudinary (handles image/PDF)
    photo_url = upload_to_cloudinary(bill_in.photoUrl, folder="bills")
    
    bill_doc = {
        "id": new_id,
        "managerId": current_user["id"],
        "managerName": current_user["name"],
        "siteId": bill_in.siteId,
        "siteName": bill_in.siteName,
        "photoUrl": photo_url,
        "description": bill_in.description,
        "amount": bill_in.amount,
        "status": "Pending",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "dateApproved": None
    }
    
    await bills_col.insert_one(bill_doc)
    return bill_doc

@app.put("/api/bills/{bill_id}/review", response_model=BillOut)
async def review_bill(bill_id: str, review: BillReview, current_user: dict = Depends(get_current_user_from_token)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only Admins can approve or reject bills")
        
    bill = await bills_col.find_one({"id": bill_id})
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
        
    today_str = datetime.date.today().isoformat()
    
    await bills_col.update_one(
        {"id": bill_id}, 
        {"$set": {"status": review.status, "dateApproved": today_str if review.status == "Approved" else None}}
    )
    
    updated_bill = await bills_col.find_one({"id": bill_id})
    
    # If approved, insert payout record to payments collection
    if review.status == "Approved":
        new_pay_id = f"pay-{uuid.uuid4().hex[:8]}"
        payment_doc = {
            "id": new_pay_id,
            "type": "Bill",
            "userId": bill["managerId"],
            "userName": bill["managerName"],
            "role": UserRole.MANAGER.value,
            "siteId": bill["siteId"],
            "siteName": bill["siteName"],
            "billId": bill["id"],
            "amount": bill["amount"],
            "status": "Pending",
            "description": f"Reimbursement: {bill['description']}",
            "dateUpdated": today_str
        }
        await payments_col.insert_one(payment_doc)
        
    return updated_bill

# --- PAYMENTS TRACKER ---

@app.get("/api/payments", response_model=List[PaymentOut])
async def get_payments(current_user: dict = Depends(get_current_user_from_token)):
    cursor = payments_col.find({}).sort("dateUpdated", -1)
    payments = []
    async for doc in cursor:
        payments.append(doc)
    return payments

@app.post("/api/payments", response_model=PaymentOut)
async def create_payment(pay_in: PaymentCreate, current_user: dict = Depends(get_current_user_from_token)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only Admins can record payments")
        
    new_id = f"pay-{uuid.uuid4().hex[:8]}"
    today_str = datetime.date.today().isoformat()
    
    pay_doc = pay_in.dict()
    pay_doc["id"] = new_id
    pay_doc["dateUpdated"] = today_str
    
    await payments_col.insert_one(pay_doc)
    return pay_doc

@app.put("/api/payments/{payment_id}", response_model=PaymentOut)
async def update_payment_status(payment_id: str, pay_in: PaymentUpdate, current_user: dict = Depends(get_current_user_from_token)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only Admins can change payment status")
        
    pay = await payments_col.find_one({"id": payment_id})
    if not pay:
        raise HTTPException(status_code=404, detail="Payment record not found")
        
    today_str = datetime.date.today().isoformat()
    await payments_col.update_one(
        {"id": payment_id},
        {"$set": {"status": pay_in.status, "dateUpdated": today_str}}
    )
    
    updated_pay = await payments_col.find_one({"id": payment_id})
    return updated_pay

# --- CHAT / INTERNAL MESSAGES ---

@app.get("/api/chat", response_model=List[ChatMessageOut])
async def get_chat_messages(current_user: dict = Depends(get_current_user_from_token)):
    cursor = chat_col.find({}).sort("timestamp", 1)
    messages = []
    async for doc in cursor:
        messages.append(doc)
    return messages

@app.post("/api/chat", response_model=ChatMessageOut)
async def create_chat_message(msg_in: ChatMessageCreate, current_user: dict = Depends(get_current_user_from_token)):
    new_id = f"msg-{uuid.uuid4().hex[:8]}"
    
    msg_doc = {
        "id": new_id,
        "senderId": current_user["id"],
        "senderName": current_user["name"],
        "senderRole": current_user["role"],
        "recipientId": msg_in.recipientId,
        "recipientName": msg_in.recipientName,
        "text": msg_in.text,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "isAdminOnly": msg_in.isAdminOnly
    }
    
    await chat_col.insert_one(msg_doc)
    return msg_doc

# --- CONTACT FORM ---

@app.post("/api/contact")
async def submit_contact(form: ContactFormCreate):
    new_id = f"contact-{uuid.uuid4().hex[:8]}"
    form_doc = {
        "id": new_id,
        "name": form.name,
        "email": form.email,
        "phone": form.phone,
        "message": form.message,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
    await contacts_col.insert_one(form_doc)
    # Return success response compatible with existing edge functions expectations
    return {"success": True, "id": new_id}
