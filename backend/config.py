import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    AWS_REGION = os.getenv("AWS_REGION", "us-east-2")
    UPLOAD_FOLDER = "uploads"