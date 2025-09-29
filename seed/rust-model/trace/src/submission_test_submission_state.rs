use crate::commons_problem_id::ProblemId;
use crate::commons_test_case::TestCase;
use crate::submission_test_submission_status::TestSubmissionStatus;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestSubmissionState {
    #[serde(rename = "problemId")]
    pub problem_id: ProblemId,
    #[serde(rename = "defaultTestCases")]
    pub default_test_cases: Vec<TestCase>,
    #[serde(rename = "customTestCases")]
    pub custom_test_cases: Vec<TestCase>,
    pub status: TestSubmissionStatus,
}