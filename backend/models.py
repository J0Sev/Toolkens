class ImageStore:
    def __init__(self):
        self.images = []

    def add_image(self, filename, labels, image_url):
        self.images.append({
            "id": len(self.images),
            "filename": filename,
            "labels": labels,
            "image_url": image_url
        })

    def get_all(self):
        return self.images
    
    def delete_image(self, image_id):
        image = next((img for img in self.images if img["id"] == image_id), None)
        if image:
            self.images = [img for img in self.images if img["id"] != image_id]
            return image
        return None

    def reassign_label(self, image_id, new_label):
        for img in self.images:
            if img["id"] == image_id:
                other_labels = [l for l in img["labels"] if l["name"] != new_label]
                img["labels"] = [{"name": new_label, "confidence": 100.0}] + other_labels
                return img
        return None
    
    def add_label(self, image_id, new_label):
        for img in self.images:
            if img["id"] == image_id:
                existing = [l["name"] for l in img["labels"]]
                if new_label not in existing:
                    img["labels"].append({"name": new_label, "confidence": 100.0})
                return img
        return None
