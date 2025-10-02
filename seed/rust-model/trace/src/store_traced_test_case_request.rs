pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct StoreTracedTestCaseRequest {
    pub result: TestCaseResultWithStdout,
    #[serde(rename = "traceResponses")]
    pub trace_responses: Vec<TraceResponse>,
}