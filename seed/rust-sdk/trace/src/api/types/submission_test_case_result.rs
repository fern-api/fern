pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionTestCaseResult {
    #[serde(rename = "expectedResult")]
    pub expected_result: CommonsVariableValue,
    #[serde(rename = "actualResult")]
    pub actual_result: SubmissionActualResult,
    pub passed: bool,
}
