import boto3

client = boto3.client("rekognition")

with open("test.jpg", "rb") as img:
    response = client.detect_labels(
        Image={"Bytes": img.read()},
        MaxLabels=5
    )

print(response["Labels"])