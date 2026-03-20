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
