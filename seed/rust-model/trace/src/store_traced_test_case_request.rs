pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct StoreTracedTestCaseRequest {
    pub result: TestCaseResultWithStdout,
    #[serde(rename = "traceResponses")]
    pub trace_responses: Vec<TraceResponse>,
}
