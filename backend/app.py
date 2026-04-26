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

        image_url = s3_service.generate_presigned_url(key)

        image_store.add_image(key, labels, image_url)
        stored = image_store.images[-1]

        results.append({
            "id": stored["id"],
            "filename": key,
            "labels": labels,
            "image_url": image_url
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
    grouped = sorting_service.group_by_primary_label(
        image_store.get_all(),
        feedback_service.get_feedback()
    )
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

@app.route("/delete/<int:image_id>", methods=["DELETE"])
def delete_image(image_id):
    image = image_store.delete_image(image_id)
    if not image:
        return jsonify({"error": "Image not found"}), 404

    s3_service.delete_file(image["filename"])
    return jsonify({"message": "Image deleted", "id": image_id})

@app.route("/reassign", methods=["POST"])
def reassign_image():
    data = request.json
    image_id = data.get("image_id")
    new_label = data.get("new_label", "").strip()

    if image_id is None or not new_label:
        return jsonify({"error": "image_id and new_label are required"}), 400

    updated = image_store.reassign_label(image_id, new_label)
    if not updated:
        return jsonify({"error": "Image not found"}), 404

    return jsonify({"message": "Label reassigned", "image": updated})

@app.route("/delete-all", methods=["DELETE"])
def delete_all_images():
    images = image_store.get_all().copy()
    for image in images:
        s3_service.delete_file(image["filename"])
    image_store.images.clear()
    return jsonify({"message": f"Deleted {len(images)} images"})

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
