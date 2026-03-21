pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct RecordingResponseNotification {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
    #[serde(rename = "testCaseId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub test_case_id: Option<String>,
    #[serde(rename = "lineNumber")]
    #[serde(default)]
    pub line_number: i64,
    #[serde(rename = "lightweightStackInfo")]
    #[serde(default)]
    pub lightweight_stack_info: LightweightStackframeInformation,
    #[serde(rename = "tracedFile")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub traced_file: Option<TracedFile>,
}

impl RecordingResponseNotification {
    pub fn builder() -> RecordingResponseNotificationBuilder {
        RecordingResponseNotificationBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RecordingResponseNotificationBuilder {
    submission_id: Option<SubmissionId>,
    test_case_id: Option<String>,
    line_number: Option<i64>,
    lightweight_stack_info: Option<LightweightStackframeInformation>,
    traced_file: Option<TracedFile>,
}

impl RecordingResponseNotificationBuilder {
    pub fn submission_id(mut self, value: SubmissionId) -> Self {
        self.submission_id = Some(value);
        self
    }

    pub fn test_case_id(mut self, value: impl Into<String>) -> Self {
        self.test_case_id = Some(value.into());
        self
    }

    pub fn line_number(mut self, value: i64) -> Self {
        self.line_number = Some(value);
        self
    }

    pub fn lightweight_stack_info(mut self, value: LightweightStackframeInformation) -> Self {
        self.lightweight_stack_info = Some(value);
        self
    }

    pub fn traced_file(mut self, value: TracedFile) -> Self {
        self.traced_file = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`RecordingResponseNotification`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission_id`](RecordingResponseNotificationBuilder::submission_id)
    /// - [`line_number`](RecordingResponseNotificationBuilder::line_number)
    /// - [`lightweight_stack_info`](RecordingResponseNotificationBuilder::lightweight_stack_info)
    pub fn build(self) -> Result<RecordingResponseNotification, BuildError> {
        Ok(RecordingResponseNotification {
            submission_id: self
                .submission_id
                .ok_or_else(|| BuildError::missing_field("submission_id"))?,
            test_case_id: self.test_case_id,
            line_number: self
                .line_number
                .ok_or_else(|| BuildError::missing_field("line_number"))?,
            lightweight_stack_info: self
                .lightweight_stack_info
                .ok_or_else(|| BuildError::missing_field("lightweight_stack_info"))?,
            traced_file: self.traced_file,
        })
    }
}
