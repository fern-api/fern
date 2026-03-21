pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct RecordedResponseNotification {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
    #[serde(rename = "traceResponsesSize")]
    #[serde(default)]
    pub trace_responses_size: i64,
    #[serde(rename = "testCaseId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub test_case_id: Option<String>,
}

impl RecordedResponseNotification {
    pub fn builder() -> RecordedResponseNotificationBuilder {
        RecordedResponseNotificationBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RecordedResponseNotificationBuilder {
    submission_id: Option<SubmissionId>,
    trace_responses_size: Option<i64>,
    test_case_id: Option<String>,
}

impl RecordedResponseNotificationBuilder {
    pub fn submission_id(mut self, value: SubmissionId) -> Self {
        self.submission_id = Some(value);
        self
    }

    pub fn trace_responses_size(mut self, value: i64) -> Self {
        self.trace_responses_size = Some(value);
        self
    }

    pub fn test_case_id(mut self, value: impl Into<String>) -> Self {
        self.test_case_id = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`RecordedResponseNotification`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission_id`](RecordedResponseNotificationBuilder::submission_id)
    /// - [`trace_responses_size`](RecordedResponseNotificationBuilder::trace_responses_size)
    pub fn build(self) -> Result<RecordedResponseNotification, BuildError> {
        Ok(RecordedResponseNotification {
            submission_id: self.submission_id.ok_or_else(|| BuildError::missing_field("submission_id"))?,
            trace_responses_size: self.trace_responses_size.ok_or_else(|| BuildError::missing_field("trace_responses_size"))?,
            test_case_id: self.test_case_id,
        })
    }
}
