pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionWorkspaceRunDetails {
    #[serde(rename = "exceptionV2")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exception_v_2: Option<SubmissionExceptionV2>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exception: Option<SubmissionExceptionInfo>,
    pub stdout: String,
}