from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# LLM Configuration
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class Plant(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    botanical_name: str
    description: str
    sunlight: str
    water: str
    soil: str
    difficulty: str
    growing_time: str
    harvest_season: str
    care_tips: List[str]
    image_url: str
    category: str

class PlantIdentificationRequest(BaseModel):
    image_base64: str

class PlantIdentificationResponse(BaseModel):
    id: str
    plant_name: str
    botanical_name: Optional[str]
    confidence: str
    care_instructions: Dict[str, Any]
    identified_at: str

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str

class QuizGenerateResponse(BaseModel):
    questions: List[QuizQuestion]

class QuizSubmitRequest(BaseModel):
    answers: List[str]

class QuizSubmitResponse(BaseModel):
    score: int
    total_questions: int
    percentage: float
    correct_answers: List[str]
    attempt_id: str

class QuizAttemptHistory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    score: int
    total_questions: int
    percentage: float
    created_at: str

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    user_id = payload.get("user_id")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Seed plants data
async def seed_plants():
    count = await db.plants.count_documents({})
    if count > 0:
        return
    
    plants_data = [
        {
            "id": str(uuid.uuid4()),
            "name": "Tomato",
            "botanical_name": "Solanum lycopersicum",
            "description": "A popular vegetable that's easy to grow and produces abundant fruit. Perfect for beginners.",
            "sunlight": "High",
            "water": "Medium",
            "soil": "Well-draining, rich in organic matter",
            "difficulty": "Easy",
            "growing_time": "60-80 days",
            "harvest_season": "Summer to Fall",
            "care_tips": [
                "Stake or cage plants for support",
                "Water consistently to prevent blossom end rot",
                "Prune suckers for better fruit production",
                "Feed with balanced fertilizer every 2 weeks"
            ],
            "image_url": "https://images.unsplash.com/photo-1592921870789-04563d55041c?w=400",
            "category": "Vegetable"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Lettuce",
            "botanical_name": "Lactuca sativa",
            "description": "Quick-growing leafy green that thrives in cool weather. Harvest continuously for fresh salads.",
            "sunlight": "Medium",
            "water": "Medium",
            "soil": "Loose, well-draining with compost",
            "difficulty": "Easy",
            "growing_time": "30-45 days",
            "harvest_season": "Spring and Fall",
            "care_tips": [
                "Plant in succession for continuous harvest",
                "Keep soil consistently moist",
                "Harvest outer leaves first",
                "Provide shade in hot weather"
            ],
            "image_url": "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400",
            "category": "Vegetable"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bell Pepper",
            "botanical_name": "Capsicum annuum",
            "description": "Colorful, sweet peppers that add flavor to any dish. Grows well in warm conditions.",
            "sunlight": "High",
            "water": "Medium",
            "soil": "Well-draining, nutrient-rich",
            "difficulty": "Medium",
            "growing_time": "60-90 days",
            "harvest_season": "Summer to Fall",
            "care_tips": [
                "Start indoors 8-10 weeks before last frost",
                "Support plants with stakes",
                "Water deeply but infrequently",
                "Harvest when fruit reaches full size"
            ],
            "image_url": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400",
            "category": "Vegetable"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Basil",
            "botanical_name": "Ocimum basilicum",
            "description": "Aromatic herb essential for Italian cooking. Grows quickly and provides abundant leaves.",
            "sunlight": "High",
            "water": "Medium",
            "soil": "Well-draining, moist",
            "difficulty": "Easy",
            "growing_time": "30-40 days",
            "harvest_season": "Spring to Fall",
            "care_tips": [
                "Pinch off flowers to promote leaf growth",
                "Harvest regularly to encourage bushiness",
                "Water at the base to prevent mildew",
                "Bring indoors before first frost"
            ],
            "image_url": "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400",
            "category": "Herb"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Strawberry",
            "botanical_name": "Fragaria × ananassa",
            "description": "Sweet, juicy berries that are perfect for containers or garden beds. Produces runners for propagation.",
            "sunlight": "High",
            "water": "Medium",
            "soil": "Slightly acidic, well-draining",
            "difficulty": "Easy",
            "growing_time": "60-120 days",
            "harvest_season": "Late Spring to Early Summer",
            "care_tips": [
                "Mulch around plants to keep berries clean",
                "Remove runners for larger fruit",
                "Fertilize after first harvest",
                "Protect from birds with netting"
            ],
            "image_url": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400",
            "category": "Fruit"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Carrot",
            "botanical_name": "Daucus carota",
            "description": "Crunchy root vegetable that grows well in loose soil. Great for containers with deep pots.",
            "sunlight": "High",
            "water": "Low",
            "soil": "Loose, sandy, rock-free",
            "difficulty": "Medium",
            "growing_time": "70-80 days",
            "harvest_season": "Spring and Fall",
            "care_tips": [
                "Thin seedlings to 2-3 inches apart",
                "Keep soil consistently moist",
                "Avoid fresh manure in soil",
                "Harvest when shoulders emerge"
            ],
            "image_url": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400",
            "category": "Vegetable"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mint",
            "botanical_name": "Mentha",
            "description": "Vigorous herb with refreshing aroma. Grows aggressively and is best contained.",
            "sunlight": "Medium",
            "water": "High",
            "soil": "Moist, well-draining",
            "difficulty": "Easy",
            "growing_time": "40-50 days",
            "harvest_season": "Spring to Fall",
            "care_tips": [
                "Grow in containers to control spread",
                "Harvest regularly to prevent flowering",
                "Water frequently",
                "Divide plants every 2-3 years"
            ],
            "image_url": "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400",
            "category": "Herb"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Cucumber",
            "botanical_name": "Cucumis sativus",
            "description": "Refreshing vegetable that grows on vines. Produces abundantly with proper care.",
            "sunlight": "High",
            "water": "High",
            "soil": "Rich, well-draining",
            "difficulty": "Easy",
            "growing_time": "50-70 days",
            "harvest_season": "Summer",
            "care_tips": [
                "Provide trellis for vertical growth",
                "Water deeply and consistently",
                "Harvest frequently for more production",
                "Mulch to retain moisture"
            ],
            "image_url": "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400",
            "category": "Vegetable"
        }
    ]
    
    await db.plants.insert_many(plants_data)
    logging.info("Plants seeded successfully")

# Auth endpoints
@api_router.post("/auth/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Generate token
    token = create_access_token(user_id)
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user_id,
            name=user_data.name,
            email=user_data.email,
            created_at=user_doc["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token(user["id"])
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        created_at=current_user["created_at"]
    )

# Plants endpoints
@api_router.get("/plants", response_model=List[Plant])
async def get_plants(category: Optional[str] = None, difficulty: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if difficulty:
        query["difficulty"] = difficulty
    
    plants = await db.plants.find(query, {"_id": 0}).to_list(1000)
    return plants

@api_router.get("/plants/{plant_id}", response_model=Plant)
async def get_plant(plant_id: str):
    plant = await db.plants.find_one({"id": plant_id}, {"_id": 0})
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant

# Plant identification endpoint
@api_router.post("/identify-plant", response_model=PlantIdentificationResponse)
async def identify_plant(
    request: PlantIdentificationRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Initialize LLM chat
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are a plant identification expert. Analyze plant images and provide detailed identification and care instructions. Respond in JSON format."
        ).with_model("openai", "gpt-5.1")
        
        # Create message with image
        image_content = ImageContent(image_base64=request.image_base64)
        user_message = UserMessage(
            text="""Identify this plant and provide care instructions. Respond in this exact JSON format:
{
  "plant_name": "common name",
  "botanical_name": "scientific name",
  "confidence": "high/medium/low",
  "care_instructions": {
    "sunlight": "detailed sunlight requirements",
    "water": "detailed watering requirements",
    "soil": "soil type and requirements",
    "temperature": "ideal temperature range",
    "tips": ["tip1", "tip2", "tip3"]
  }
}""",
            file_contents=[image_content]
        )
        
        # Get AI response
        response = await chat.send_message(user_message)
        
        # Parse response
        import json
        try:
            result = json.loads(response)
        except:
            # If response is not JSON, create a structured response
            result = {
                "plant_name": "Unknown Plant",
                "botanical_name": "Analysis in progress",
                "confidence": "medium",
                "care_instructions": {
                    "sunlight": response[:100] if len(response) > 100 else response,
                    "water": "Keep soil moderately moist",
                    "soil": "Well-draining potting mix",
                    "temperature": "65-75°F (18-24°C)",
                    "tips": ["Monitor plant health regularly", "Adjust care based on plant response"]
                }
            }
        
        # Save identification
        identification_id = str(uuid.uuid4())
        identification_doc = {
            "id": identification_id,
            "user_id": current_user["id"],
            "plant_name": result.get("plant_name", "Unknown"),
            "botanical_name": result.get("botanical_name", "N/A"),
            "confidence": result.get("confidence", "medium"),
            "care_instructions": result.get("care_instructions", {}),
            "identified_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.plant_identifications.insert_one(identification_doc)
        
        return PlantIdentificationResponse(
            id=identification_id,
            plant_name=result.get("plant_name", "Unknown"),
            botanical_name=result.get("botanical_name"),
            confidence=result.get("confidence", "medium"),
            care_instructions=result.get("care_instructions", {}),
            identified_at=identification_doc["identified_at"]
        )
        
    except Exception as e:
        logging.error(f"Plant identification error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to identify plant: {str(e)}")

# Quiz endpoints
@api_router.get("/quiz/generate", response_model=QuizGenerateResponse)
async def generate_quiz(current_user: dict = Depends(get_current_user)):
    try:
        # Initialize LLM chat
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are a gardening education expert. Generate quiz questions about soil types, plant care, and general gardening knowledge. Respond only in valid JSON format."
        ).with_model("openai", "gpt-5.1")
        
        user_message = UserMessage(
            text="""Generate 5 multiple-choice questions about gardening, focusing on soil types and general plant care. 
Respond in this exact JSON format:
{
  "questions": [
    {
      "question": "question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correct_answer": "correct option"
    }
  ]
}"""
        )
        
        response = await chat.send_message(user_message)
        
        # Parse response
        import json
        result = json.loads(response)
        
        # Store quiz questions in session for later verification
        quiz_session_id = str(uuid.uuid4())
        await db.quiz_sessions.insert_one({
            "id": quiz_session_id,
            "user_id": current_user["id"],
            "questions": result["questions"],
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Store quiz session ID in a temporary collection
        await db.active_quiz_sessions.delete_many({"user_id": current_user["id"]})
        await db.active_quiz_sessions.insert_one({
            "user_id": current_user["id"],
            "session_id": quiz_session_id
        })
        
        # Return questions without correct answers
        questions_without_answers = [
            {
                "question": q["question"],
                "options": q["options"],
                "correct_answer": ""  # Hide correct answer from client
            }
            for q in result["questions"]
        ]
        
        return QuizGenerateResponse(questions=questions_without_answers)
        
    except Exception as e:
        logging.error(f"Quiz generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")

@api_router.post("/quiz/submit", response_model=QuizSubmitResponse)
async def submit_quiz(
    submission: QuizSubmitRequest,
    current_user: dict = Depends(get_current_user)
):
    # Get active quiz session
    active_session = await db.active_quiz_sessions.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not active_session:
        raise HTTPException(status_code=400, detail="No active quiz session found")
    
    # Get quiz questions
    quiz_session = await db.quiz_sessions.find_one({"id": active_session["session_id"]}, {"_id": 0})
    if not quiz_session:
        raise HTTPException(status_code=400, detail="Quiz session not found")
    
    # Calculate score
    questions = quiz_session["questions"]
    correct_answers = [q["correct_answer"] for q in questions]
    score = sum(1 for i, answer in enumerate(submission.answers) if i < len(correct_answers) and answer == correct_answers[i])
    total_questions = len(questions)
    percentage = (score / total_questions * 100) if total_questions > 0 else 0
    
    # Save attempt
    attempt_id = str(uuid.uuid4())
    attempt_doc = {
        "id": attempt_id,
        "user_id": current_user["id"],
        "score": score,
        "total_questions": total_questions,
        "percentage": percentage,
        "answers": submission.answers,
        "correct_answers": correct_answers,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.quiz_attempts.insert_one(attempt_doc)
    
    # Clean up active session
    await db.active_quiz_sessions.delete_one({"user_id": current_user["id"]})
    
    return QuizSubmitResponse(
        score=score,
        total_questions=total_questions,
        percentage=percentage,
        correct_answers=correct_answers,
        attempt_id=attempt_id
    )

@api_router.get("/quiz/history", response_model=List[QuizAttemptHistory])
async def get_quiz_history(current_user: dict = Depends(get_current_user)):
    attempts = await db.quiz_attempts.find(
        {"user_id": current_user["id"]},
        {"_id": 0, "id": 1, "score": 1, "total_questions": 1, "percentage": 1, "created_at": 1}
    ).sort("created_at", -1).to_list(100)
    
    return attempts

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Verdant API - Home Gardening Management System"}

# Include the router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await seed_plants()
    logger.info("Application started successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
