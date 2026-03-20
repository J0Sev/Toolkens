import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

class Config:
    AWS_REGION = os.getenv("AWS_REGION", "us-east-2")
    S3_BUCKET = os.getenv("S3_BUCKET", "toolkens-images-linj27")
    