import boto3
from config import Config

class RekognitionService:
    def __init__(self):
        self.client = boto3.client(
            "rekognition",
            region_name=Config.AWS_REGION
        )

    def detect_labels(self, image_bytes):
        response = self.client.detect_labels(
            Image={'Bytes': image_bytes},
            MaxLabels=10,
            MinConfidence=75
        )

        labels = []
        for label in response['Labels']:
            labels.append({
                "name": label["Name"],
                "confidence": round(label["Confidence"], 2)
            })
            
        return labels