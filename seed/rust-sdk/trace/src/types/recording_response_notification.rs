use crate::submission_id::SubmissionId;
use crate::lightweight_stackframe_information::LightweightStackframeInformation;
use crate::traced_file::TracedFile;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct RecordingResponseNotification {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    #[serde(rename = "testCaseId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub test_case_id: Option<String>,
    #[serde(rename = "lineNumber")]
    pub line_number: i32,
    #[serde(rename = "lightweightStackInfo")]
    pub lightweight_stack_info: LightweightStackframeInformation,
    #[serde(rename = "tracedFile")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub traced_file: Option<TracedFile>,
}