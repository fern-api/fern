use crate::submission_test_case_result_with_stdout::TestCaseResultWithStdout;
use crate::submission_trace_response::TraceResponse;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoreTracedTestCaseRequest {
    pub result: TestCaseResultWithStdout,
    #[serde(rename = "traceResponses")]
    pub trace_responses: Vec<TraceResponse>,
}