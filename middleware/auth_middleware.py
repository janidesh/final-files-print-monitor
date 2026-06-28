from fastapi import HTTPException, Header
from firebase_admin import auth
from firebase_config import db

async def get_current_user(authorization: str = Header(None)):
    """
    This is a Dependency for FastAPI. 
    It checks the Authorization header, validates the Firebase ID token,
    and returns the user profile from Firestore.
    """
    
    # 1. Check if Authorization header exists
    if not authorization:
        raise HTTPException(
            status_code=401, 
            detail="Authorization header missing"
        )
    
    # 2. Extract token from "Bearer <token>"
    try:
        parts = authorization.split(" ")
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(
                status_code=401, 
                detail="Invalid authorization format. Use 'Bearer <token>'"
            )
        token = parts[1]
        
        # 3. Verify the ID token with Firebase
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        
        # 4. Fetch the user profile from Firestore using the uid
        user_doc = db.collection("users").document(uid).get()
        if not user_doc.exists:
            raise HTTPException(
                status_code=404, 
                detail="User profile not found. Please contact administrator."
            )
            
        user_profile = user_doc.to_dict()
        
        # 5. Return the profile dict so FastAPI can inject it into route functions
        return user_profile
        
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=401, 
            detail="Invalid or expired token. Please log in again."
        )
    except Exception as e:
        # Catch any other unexpected errors and log them as 500
        raise HTTPException(
            status_code=500, 
            detail=f"Authentication error: {str(e)}"
        )