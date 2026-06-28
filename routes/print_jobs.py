import os
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from firebase_config import db
from middleware.auth_middleware import get_current_user

router = APIRouter()

# --- PYDANTIC MODEL ---
class PrintJobRequest(BaseModel):
    documentName: str
    pageCount: int
    copies: int
    classificationResult: str
    isApproved: bool

# --- ENDPOINT 1: POST /print/submit ---
@router.post("/submit")
async def submit_print_job(
    request: PrintJobRequest,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user["uid"]
    
    # 1. Calculate today's date range (start and end of day)
    now = datetime.now(timezone.utc)
    start_of_day = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    end_of_day = start_of_day + timedelta(days=1)

    # 2. Fetch user's total pages printed today
    today_jobs = db.collection("print_jobs") \
        .where("userId", "==", uid) \
        .where("timestamp", ">=", start_of_day) \
        .where("timestamp", "<", end_of_day) \
        .stream()
    
    today_total_pages = 0
    for job in today_jobs:
        data = job.to_dict()
        today_total_pages += (data.get("pageCount", 0) * data.get("copies", 0))

    # 3. Check daily limit
    new_job_pages = request.pageCount * request.copies
    daily_limit = int(os.getenv("DAILY_PRINT_LIMIT", 30))

    if today_total_pages + new_job_pages > daily_limit:
        raise HTTPException(
            status_code=403,
            detail=f"Daily print limit of {daily_limit} pages reached. You have used {today_total_pages} pages today. Please contact your administrator."
        )

    # 4. Determine status and prepare job data
    status = "flagged" if not request.isApproved else "approved"
    job_data = {
        "userId": uid,
        "userName": current_user.get("name", ""),
        "userEmail": current_user.get("email", ""),
        "documentName": request.documentName,
        "pageCount": request.pageCount,
        "copies": request.copies,
        "classificationResult": request.classificationResult,
        "status": status,
        "timestamp": now
    }

    # 5. Save to Firestore "print_jobs" collection
    job_ref = db.collection("print_jobs").add(job_data)
    new_job_id = job_ref[1].id

    # 6. If flagged, create a notification for the user
    if status == "flagged":
        notif_data = {
            "userId": uid,
            "message": f"⚠️ Your print job '{request.documentName}' was flagged as '{request.classificationResult}'. Please review our printing policy.",
            "type": "warning",
            "isRead": False,
            "timestamp": now
        }
        db.collection("notifications").add(notif_data)

    return {
        "success": True,
        "jobId": new_job_id,
        "status": status,
        "message": "Print job submitted successfully!"
    }


# --- ENDPOINT 2: GET /print/history ---
@router.get("/history")
async def get_user_history(
    current_user: dict = Depends(get_current_user)
):
    uid = current_user["uid"]
    
    # Query Firestore for this user's jobs, sorted by time
    jobs_query = db.collection("print_jobs") \
        .where("userId", "==", uid) \
        .order_by("timestamp", direction="DESCENDING") \
        .limit(50)
    
    jobs = []
    for doc in jobs_query.stream():
        data = doc.to_dict()
        data["jobId"] = doc.id
        # Convert datetime to ISO string so it's JSON serializable
        if "timestamp" in data:
            data["timestamp"] = data["timestamp"].isoformat()
        jobs.append(data)

    return jobs


# --- ENDPOINT 3: GET /print/admin/all ---
@router.get("/admin/all")
async def get_all_print_jobs(
    flagged: bool = Query(False),
    current_user: dict = Depends(get_current_user)
):
    # 1. Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")

    # 2. Build query
    jobs_query = db.collection("print_jobs")
    if flagged:
        jobs_query = jobs_query.where("status", "==", "flagged")
    
    jobs_query = jobs_query.order_by("timestamp", direction="DESCENDING").limit(100)
    
    # 3. Fetch data
    jobs = []
    for doc in jobs_query.stream():
        data = doc.to_dict()
        data["jobId"] = doc.id
        if "timestamp" in data:
            data["timestamp"] = data["timestamp"].isoformat()
        jobs.append(data)

    return jobs


# --- ENDPOINT 4: PATCH /print/admin/review/{job_id} ---
@router.patch("/admin/review/{job_id}")
async def review_flagged_job(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
    # 1. Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")

    # 2. Update the job status in Firestore
    job_ref = db.collection("print_jobs").document(job_id)
    if not job_ref.get().exists:
        raise HTTPException(status_code=404, detail="Print job not found.")

    job_ref.update({"status": "reviewed"})

    return {"success": True, "message": f"Job {job_id} marked as reviewed."}