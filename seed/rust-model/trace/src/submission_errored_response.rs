pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ErroredResponse {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
    #[serde(rename = "errorInfo")]
    pub error_info: ErrorInfo,
}

impl ErroredResponse {
    pub fn builder() -> ErroredResponseBuilder {
        ErroredResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ErroredResponseBuilder {
    submission_id: Option<SubmissionId>,
    error_info: Option<ErrorInfo>,
}

impl ErroredResponseBuilder {
    pub fn submission_id(mut self, value: SubmissionId) -> Self {
        self.submission_id = Some(value);
        self
    }

    pub fn error_info(mut self, value: ErrorInfo) -> Self {
        self.error_info = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ErroredResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`submission_id`](ErroredResponseBuilder::submission_id)
    /// - [`error_info`](ErroredResponseBuilder::error_info)
    pub fn build(self) -> Result<ErroredResponse, BuildError> {
        Ok(ErroredResponse {
            submission_id: self.submission_id.ok_or_else(|| BuildError::missing_field("submission_id"))?,
            error_info: self.error_info.ok_or_else(|| BuildError::missing_field("error_info"))?,
        })
    }
}
