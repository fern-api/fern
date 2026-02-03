pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseResultWithStdout {
    pub result: TestCaseResult,
    pub stdout: String,
}