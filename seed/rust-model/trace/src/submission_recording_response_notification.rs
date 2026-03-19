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