use crate::submission_error_info::ErrorInfo;
use crate::submission_submission_id::SubmissionId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ErroredResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    #[serde(rename = "errorInfo")]
    pub error_info: ErrorInfo,
}
