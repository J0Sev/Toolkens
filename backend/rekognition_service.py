import boto3
from config import Config

class RekognitionService:
    def __init__(self):
        self.client = boto3.client(
            "rekognition",
            region_name=Config.AWS_REGION
        )

    def detect_labels_s3(self, bucket, key):
        response = self.client.detect_labels(
            Image={
                "S3Object": {
                    "Bucket": bucket,
                    "Name": key
                }
            },
            MaxLabels=10,
            MinConfidence=75
        )

        return [
            {
                "name": label["Name"],
                "confidence": round(label["Confidence"], 2)
            }
            for label in response["Labels"]
        ]
