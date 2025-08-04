use crate::test_case_result_with_stdout::TestCaseResultWithStdout;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TracedTestCase {
    pub result: TestCaseResultWithStdout,
    #[serde(rename = "traceResponsesSize")]
    pub trace_responses_size: i32,
}