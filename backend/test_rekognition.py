from rekognition_service import RekognitionService

service = RekognitionService()

with open("../uploads/sample.jpg", "rb") as f:
    labels = service.detect_labels(f.read())

print(labels)
