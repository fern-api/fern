pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestSubmissionState {
    #[serde(rename = "problemId")]
    #[serde(default)]
    pub problem_id: ProblemId,
    #[serde(rename = "defaultTestCases")]
    #[serde(default)]
    pub default_test_cases: Vec<TestCase>,
    #[serde(rename = "customTestCases")]
    #[serde(default)]
    pub custom_test_cases: Vec<TestCase>,
    pub status: TestSubmissionStatus,
}
