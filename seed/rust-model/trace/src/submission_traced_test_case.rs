use crate::submission_test_case_result_with_stdout::TestCaseResultWithStdout;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TracedTestCase {
    pub result: TestCaseResultWithStdout,
    #[serde(rename = "traceResponsesSize")]
    pub trace_responses_size: i32,
}