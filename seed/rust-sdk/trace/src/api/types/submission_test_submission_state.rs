pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionTestSubmissionState {
    #[serde(rename = "problemId")]
    pub problem_id: CommonsProblemId,
    #[serde(rename = "defaultTestCases")]
    pub default_test_cases: Vec<CommonsTestCase>,
    #[serde(rename = "customTestCases")]
    pub custom_test_cases: Vec<CommonsTestCase>,
    pub status: SubmissionTestSubmissionStatus,
}
