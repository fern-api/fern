pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionTestCaseNonHiddenGrade {
    pub passed: bool,
    #[serde(rename = "actualResult")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub actual_result: Option<CommonsVariableValue>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exception: Option<SubmissionExceptionV2>,
    pub stdout: String,
}
