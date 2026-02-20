class FeedbackService:

    def __init__(self):
        self.feedback_log = {}

    def record_feedback(self, image_id, label, accepted=True):
        if image_id not in self.feedback_log:
            self.feedback_log[image_id] = {}

        self.feedback_log[image_id][label] = accepted

    def get_feedback(self):
        return self.feedback_log