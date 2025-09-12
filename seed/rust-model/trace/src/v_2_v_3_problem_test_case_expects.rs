use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TestCaseExpects {
    #[serde(rename = "expectedStdout")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expected_stdout: Option<String>,
}