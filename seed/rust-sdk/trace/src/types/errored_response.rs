use crate::submission_id::SubmissionId;
use crate::error_info::ErrorInfo;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ErroredResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    #[serde(rename = "errorInfo")]
    pub error_info: ErrorInfo,
}