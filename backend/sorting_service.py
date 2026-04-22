class SortingService:

    @staticmethod
    def group_by_primary_label(image_data, feedback_log=None):
        grouped = {}
        feedback_log = feedback_log or {}

        for image in image_data:
            primary = None
            for label in image["labels"]:
                image_feedback = feedback_log.get(image["id"], {})
                if image_feedback.get(label["name"]) is False:
                    continue  # skip rejected labels
                primary = label["name"]
                break

            if primary is None:
                primary = "Uncategorized"

            grouped.setdefault(primary, []).append(image)

        return grouped
