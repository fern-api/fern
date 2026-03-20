pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TestCaseNonHiddenGrade {
    #[serde(default)]
    pub passed: bool,
    #[serde(rename = "actualResult")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub actual_result: Option<VariableValue>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exception: Option<ExceptionV2>,
    #[serde(default)]
    pub stdout: String,
}