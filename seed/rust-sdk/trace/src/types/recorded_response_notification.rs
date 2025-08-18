use crate::submission_id::SubmissionId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct RecordedResponseNotification {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    #[serde(rename = "traceResponsesSize")]
    pub trace_responses_size: i32,
    #[serde(rename = "testCaseId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub test_case_id: Option<String>,
}