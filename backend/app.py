from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

from config import Config
from rekognition_service import RekognitionService
from sorting_service import SortingService
from feedback_service import FeedbackService
from models import ImageStore
from s3_service import S3Service

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

app = Flask(__name__, template_folder="../frontend/templates", static_folder="../frontend/static")
CORS(app)

s3_service = S3Service(Config.S3_BUCKET)
rekognition_service = RekognitionService()
sorting_service = SortingService()
feedback_service = FeedbackService()
image_store = ImageStore()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_images():
    files = request.files.getlist("images")
    results = []

    for file in files:
        if not file or file.filename == "":
            continue

        if not allowed_file(file.filename):
            results.append({
                "filename": file.filename,
                "error": "Unsupported file type"
            })
            continue

        key = s3_service.upload_file(file)

        labels = rekognition_service.detect_labels_s3(
            Config.S3_BUCKET,
            key
        )

        image_store.add_image(key, labels)

        results.append({
            "filename": key,
            "labels": labels
        })

    return jsonify({
        "message": "Upload complete",
        "results": results
    })

@app.route("/images", methods=["GET"])
def get_images():
    return jsonify(image_store.get_all())

@app.route("/grouped", methods=["GET"])
def get_grouped():
    grouped = sorting_service.group_by_primary_label(image_store.get_all())
    return jsonify(grouped)

@app.route("/feedback", methods=["POST"])
def feedback():
    data = request.json
    feedback_service.record_feedback(
        data["image_id"],
        data["label"],
        data["accepted"]
    )
    return jsonify({"message": "Feedback recorded"})

if __name__ == "__main__":
    app.run(debug=True)