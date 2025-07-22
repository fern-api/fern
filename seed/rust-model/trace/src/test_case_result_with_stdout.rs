use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseResultWithStdout {
    pub result: TestCaseResult,
    pub stdout: String,
}