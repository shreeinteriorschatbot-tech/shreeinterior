from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "Admin"
    MANAGER = "Manager"
    STAFF = "Staff"

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole
    phone: str

class UserCreate(UserBase):
    password: str
    admin_key: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    role: Optional[UserRole] = None
    phone: Optional[str] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: str

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# Sites & Checklist
class ChecklistItem(BaseModel):
    id: str
    text: str
    completed: bool
    percentage: float
    description: str
    dateUpdated: Optional[str] = None

class SiteBase(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    gmapLink: str
    startDate: str
    status: str = "Active"  # "Active" or "Completed"
    managerId: str
    staffIds: List[str] = []
    checklist: List[ChecklistItem] = []

class SiteCreate(SiteBase):
    pass

class SiteUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    gmapLink: Optional[str] = None
    startDate: Optional[str] = None
    status: Optional[str] = None
    managerId: Optional[str] = None
    staffIds: Optional[List[str]] = None
    checklist: Optional[List[ChecklistItem]] = None

class SiteOut(SiteBase):
    id: str

    class Config:
        from_attributes = True

# Attendance
class AttendanceCreate(BaseModel):
    siteId: str
    siteName: str
    type: str  # "In" or "Out"
    latitude: float
    longitude: float
    isSimulated: bool
    distance: float

class AttendanceOut(BaseModel):
    id: str
    userId: str
    userName: str
    role: UserRole
    siteId: str
    siteName: str
    type: str
    timestamp: str
    latitude: float
    longitude: float
    isSimulated: bool
    distance: float

    class Config:
        from_attributes = True

# Work Done
class WorkDoneCreate(BaseModel):
    siteId: str
    siteName: str
    photoUrl: str  # base64 data URL or uploaded URL
    description: str

class WorkDoneReview(BaseModel):
    reviewText: str

class WorkDoneOut(BaseModel):
    id: str
    userId: str
    userName: str
    role: UserRole
    siteId: str
    siteName: str
    photoUrl: str
    description: str
    timestamp: str
    reviewText: Optional[str] = None

    class Config:
        from_attributes = True

# Bills
class BillCreate(BaseModel):
    siteId: str
    siteName: str
    amount: float
    description: str
    photoUrl: str  # base64 data URL or uploaded URL

class BillReview(BaseModel):
    status: str  # "Approved" or "Rejected"

class BillOut(BaseModel):
    id: str
    managerId: str
    managerName: str
    siteId: str
    siteName: str
    photoUrl: str
    description: str
    amount: float
    status: str  # "Pending", "Approved", "Rejected"
    timestamp: str
    dateApproved: Optional[str] = None

    class Config:
        from_attributes = True

# Payments
class PaymentCreate(BaseModel):
    type: str  # "Salary" or "Bill"
    userId: str
    userName: str
    role: UserRole
    siteId: Optional[str] = None
    siteName: Optional[str] = None
    billId: Optional[str] = None
    amount: float
    status: str = "Pending"  # "Pending" or "Paid"
    description: str

class PaymentUpdate(BaseModel):
    status: str  # "Pending" or "Paid"

class PaymentOut(BaseModel):
    id: str
    type: str
    userId: str
    userName: str
    role: UserRole
    siteId: Optional[str] = None
    siteName: Optional[str] = None
    billId: Optional[str] = None
    amount: float
    status: str
    description: str
    dateUpdated: str

    class Config:
        from_attributes = True

# Chat Message
class ChatMessageCreate(BaseModel):
    recipientId: str
    recipientName: str
    text: str
    isAdminOnly: bool = False

class ChatMessageOut(BaseModel):
    id: str
    senderId: str
    senderName: str
    senderRole: UserRole
    recipientId: str
    recipientName: str
    text: str
    timestamp: str
    isAdminOnly: bool

    class Config:
        from_attributes = True

# Contact Form
class ContactFormCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    message: str
