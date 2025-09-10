use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestSubmissionState {
    #[serde(rename = "problemId")]
    pub problem_id: ProblemId,
    #[serde(rename = "defaultTestCases")]
    pub default_test_cases: Vec<TestCase>,
    #[serde(rename = "customTestCases")]
    pub custom_test_cases: Vec<TestCase>,
    pub status: TestSubmissionStatus,
}