pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TracedTestCase {
    pub result: TestCaseResultWithStdout,
    #[serde(rename = "traceResponsesSize")]
    #[serde(default)]
    pub trace_responses_size: i64,
}