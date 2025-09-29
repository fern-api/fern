use crate::submission_test_case_result::TestCaseResult;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseResultWithStdout {
    pub result: TestCaseResult,
    pub stdout: String,
}
