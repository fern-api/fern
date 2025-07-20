use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TracedTestCase {
    pub result: TestCaseResultWithStdout,
    #[serde(rename = "traceResponsesSize")]
    pub trace_responses_size: i32,
}