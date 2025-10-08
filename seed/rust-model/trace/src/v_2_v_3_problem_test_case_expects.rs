pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TestCaseExpects2 {
    #[serde(rename = "expectedStdout")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expected_stdout: Option<String>,
}