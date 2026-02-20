class ImageStore:
    def __init__(self):
        self.images = []

    def add_image(self, filename, labels):
        self.images.append({
            "id": len(self.images),
            "filename": filename,
            "labels": labels
        })

    def get_all(self):
        return self.images