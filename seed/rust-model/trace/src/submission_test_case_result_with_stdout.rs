pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionTestCaseResultWithStdout {
    pub result: SubmissionTestCaseResult,
    pub stdout: String,
}