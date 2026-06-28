import os
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
import PyPDF2
from services.classifier import classifier_service
from middleware.auth_middleware import get_current_user

router = APIRouter()

@router.post("/document")
async def classify_document(
    file: UploadFile = File(...),
    copies: int = Form(default=1),
    current_user: dict = Depends(get_current_user)  # Protects this route
):
    try:
        # 1. Read the uploaded file and extract text
        content = await file.read()
        text = ""

        if file.filename.endswith(".txt"):
            text = content.decode("utf-8")
        elif file.filename.endswith(".pdf"):
            # Save to a temp file because PyPDF2 needs a file path
            temp_path = f"temp_{file.filename}"
            with open(temp_path, "wb") as f:
                f.write(content)
            
            try:
                with open(temp_path, "rb") as f:
                    reader = PyPDF2.PdfReader(f)
                    for page in reader.pages:
                        text += page.extract_text() or ""
            finally:
                # Clean up the temp file
                if os.path.exists(temp_path):
                    os.remove(temp_path)
        else:
            raise HTTPException(status_code=400, detail="Only .pdf and .txt files are supported.")

        # 2. Send text to AI classifier
        result = classifier_service.classify(text)

        # 3. Return the response to frontend
        return {
            "filename": file.filename,
            "classification": result["classification"],
            "confidence": result["confidence"],
            "is_misuse": result["is_misuse"],
            "guidance_message": result["guidance_message"],
            "copies": copies
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")