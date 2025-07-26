use crate::problem_id::ProblemId;
use crate::test_case::TestCase;
use crate::test_submission_status::TestSubmissionStatus;
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