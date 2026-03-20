import boto3
import uuid
from config import Config

class S3Service:
    def __init__(self, bucket_name):
        self.s3 = boto3.client("s3", region_name=Config.AWS_REGION)
        self.bucket_name = bucket_name

    def upload_file(self, file):
        key = f"{uuid.uuid4()}_{file.filename}"

        self.s3.upload_fileobj(file, self.bucket_name, key)

        return key

