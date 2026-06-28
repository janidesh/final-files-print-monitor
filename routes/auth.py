from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
import firebase_admin
from firebase_admin import auth, firestore
from firebase_config import db
from middleware.auth_middleware import get_current_user

router = APIRouter()

# Pydantic models for request validation
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str
    department: str

class LoginRequest(BaseModel):
    idToken: str

# --- ENDPOINT 1: POST /auth/register ---
@router.post("/register")
async def register_user(data: RegisterRequest):
    # Validate role
    if data.role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'user' or 'admin'.")
    
    try:
        # 1. Create user in Firebase Auth
        user = auth.create_user(
            email=data.email,
            password=data.password,
            display_name=data.name
        )
        
        # 2. Save user profile to Firestore
        user_data = {
            "uid": user.uid,
            "name": data.name,
            "email": data.email,
            "role": data.role,
            "department": data.department,
            "createdAt": datetime.now()
        }
        db.collection("users").document(user.uid).set(user_data)
        
        return {"message": "Account created successfully", "uid": user.uid}
        
    except auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=400, detail="This email is already registered.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


# --- ENDPOINT 2: POST /auth/login ---
@router.post("/login")
async def login_user(data: LoginRequest):
    try:
        # 1. Verify the ID token from the frontend
        decoded_token = auth.verify_id_token(data.idToken)
        uid = decoded_token["uid"]
        
        # 2. Fetch user profile from Firestore
        user_doc = db.collection("users").document(uid).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="Profile not found. Please contact admin.")
        
        profile = user_doc.to_dict()
        
        # 3. Return the profile data
        return {
            "uid": uid,
            "name": profile.get("name"),
            "email": profile.get("email"),
            "role": profile.get("role"),
            "department": profile.get("department")
        }
        
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired ID token.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


# --- ENDPOINT 3: GET /auth/me ---
@router.get("/me")
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    # This endpoint is protected by the middleware
    return current_user