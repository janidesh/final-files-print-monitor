import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables (GROQ_API_KEY)
load_dotenv()

class DocumentClassifier:
    def __init__(self):
        # Initialize Groq client with your API key from .env
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        # We use Llama 3.3 70B - it's fast, accurate, and on Groq's free tier
        self.model = "llama-3.3-70b-versatile"

    def classify(self, text: str):
        """
        Sends text to Groq for zero-shot classification.
        Returns: dict with classification, confidence, is_misuse, guidance_message
        """
        # Limit text length to avoid token limits (Groq has a generous context window)
        text_preview = text[:2000]

        # This system prompt forces Groq to act as a strict classifier and return JSON
        system_prompt = """
        You are an AI classifier for a university printer monitoring system.
        Analyze the provided document text and classify it into exactly one of these categories:
        1. "official university document" (academic papers, assignments, admin forms, study materials)
        2. "personal document" (CVs, private letters, personal photos, non-university content)
        3. "redundant copy" (same document being printed multiple times unnecessarily)

        Respond with ONLY a valid JSON object in this exact format. Do not include any other text, explanation, or markdown:
        {"classification": "category", "confidence": 0.95}
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text_preview}
                ],
                model=self.model,
                temperature=0.1,  # Low temperature = consistent, strict classifications
                response_format={"type": "json_object"}  # Forces Groq to output valid JSON
            )

            import json
            result = json.loads(chat_completion.choices[0].message.content)
            
            classification = result.get("classification", "unknown")
            confidence = result.get("confidence", 0.0)

            # Determine if it's a misuse
            is_misuse = classification in ["personal document", "redundant copy"]

            # Generate emotional / friendly guidance message for the user
            if classification == "personal document":
                guidance = "This appears to be a personal document. University printers are a shared resource for official use only. Please consider printing personal items elsewhere. Thank you for understanding! 😊"
            elif classification == "redundant copy":
                guidance = "This looks like a duplicate copy. Please consider if all copies are truly necessary to help reduce paper waste. 🌱"
            else:
                guidance = "✅ Great news! This document meets our university printing guidelines."

            return {
                "classification": classification,
                "confidence": round(confidence, 2),
                "is_misuse": is_misuse,
                "guidance_message": guidance
            }

        except Exception as e:
            print(f"❌ Groq API Error: {e}")
            # Fallback response if Groq fails
            return {
                "classification": "error",
                "confidence": 0.0,
                "is_misuse": False,
                "guidance_message": "An error occurred while analyzing the document. Please try again."
            }

# Create a global instance so other files can import it easily
classifier_service = DocumentClassifier()