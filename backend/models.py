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
