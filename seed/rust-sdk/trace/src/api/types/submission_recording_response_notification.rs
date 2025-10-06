pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionRecordingResponseNotification {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionSubmissionId,
    #[serde(rename = "testCaseId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub test_case_id: Option<String>,
    #[serde(rename = "lineNumber")]
    pub line_number: i64,
    #[serde(rename = "lightweightStackInfo")]
    pub lightweight_stack_info: SubmissionLightweightStackframeInformation,
    #[serde(rename = "tracedFile")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub traced_file: Option<SubmissionTracedFile>,
}
