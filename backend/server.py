from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from pymongo import MongoClient
from datetime import datetime, timedelta
import jwt
import bcrypt
import os
import uuid
from typing import Optional, List

# Environment variables
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-here')
JWT_ALGORITHM = "HS256"

app = FastAPI(title="AI Health Coach API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
try:
    client = MongoClient(MONGO_URL)
    db = client.health_coach
    users_collection = db.users
    profiles_collection = db.profiles
    workouts_collection = db.workouts
    nutrition_collection = db.nutrition
    print("✅ MongoDB connected successfully")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")

security = HTTPBearer()

# Pydantic models
class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    age: int
    gender: str

class UserLogin(BaseModel):
    email: str
    password: str

class HealthProfile(BaseModel):
    user_id: str
    height: float  # cm
    weight: float  # kg
    body_fat_percentage: Optional[float] = None
    health_conditions: List[str] = []
    medications: List[str] = []
    fitness_level: str  # beginner, intermediate, advanced
    fitness_goals: List[str] = []  # weight_loss, muscle_gain, endurance, etc.
    preferred_exercises: List[str] = []
    avoid_exercises: List[str] = []
    available_equipment: List[str] = []
    workout_environment: str  # home, gym, outdoor

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    age: int
    gender: str
    created_at: datetime

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user = users_collection.find_one({"id": user_id})
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# API Routes
@app.get("/api/")
async def root():
    return {"message": "AI Health Coach API", "version": "1.0.0"}

@app.post("/api/auth/register")
async def register(user_data: UserRegister):
    # Check if user already exists
    if users_collection.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="이미 등록된 이메일입니다")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    user_id = str(uuid.uuid4())
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hashed_password,
        "name": user_data.name,
        "age": user_data.age,
        "gender": user_data.gender,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    users_collection.insert_one(user_doc)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            age=user_data.age,
            gender=user_data.gender,
            created_at=user_doc["created_at"]
        )
    }

@app.post("/api/auth/login")
async def login(user_data: UserLogin):
    user = users_collection.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=400, detail="잘못된 이메일 또는 비밀번호입니다")
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            age=user["age"],
            gender=user["gender"],
            created_at=user["created_at"]
        )
    }

@app.get("/api/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        age=current_user["age"],
        gender=current_user["gender"],
        created_at=current_user["created_at"]
    )

@app.post("/api/profile/health")
async def create_health_profile(profile_data: HealthProfile, current_user: dict = Depends(get_current_user)):
    # Check if profile already exists
    existing_profile = profiles_collection.find_one({"user_id": current_user["id"]})
    
    profile_doc = {
        "user_id": current_user["id"],
        "height": profile_data.height,
        "weight": profile_data.weight,
        "body_fat_percentage": profile_data.body_fat_percentage,
        "health_conditions": profile_data.health_conditions,
        "medications": profile_data.medications,
        "fitness_level": profile_data.fitness_level,
        "fitness_goals": profile_data.fitness_goals,
        "preferred_exercises": profile_data.preferred_exercises,
        "avoid_exercises": profile_data.avoid_exercises,
        "available_equipment": profile_data.available_equipment,
        "workout_environment": profile_data.workout_environment,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    if existing_profile:
        profile_doc["updated_at"] = datetime.utcnow()
        profiles_collection.update_one(
            {"user_id": current_user["id"]}, 
            {"$set": profile_doc}
        )
        action = "updated"
    else:
        profiles_collection.insert_one(profile_doc)
        action = "created"
    
    return {"message": f"건강 프로필이 {action}되었습니다", "profile": profile_doc}

@app.get("/api/profile/health")
async def get_health_profile(current_user: dict = Depends(get_current_user)):
    profile = profiles_collection.find_one({"user_id": current_user["id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="건강 프로필을 찾을 수 없습니다")
    
    # Remove MongoDB ObjectId for JSON serialization
    profile.pop('_id', None)
    return profile

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)