class SortingService:

    @staticmethod
    def group_by_primary_label(image_data):
        """
        image_data format:
        [
            {"filename": "...", "labels": ["Person", "Beach"]},
            ...
        ]
        """

        grouped = {}

        for image in image_data:
            if image["labels"]:
                primary = image["labels"][0]
            else:
                primary = "Uncategorized"

            grouped.setdefault(primary, []).append(image)
            
        return grouped