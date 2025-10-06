pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct StoreTracedTestCaseRequest {
    pub result: SubmissionTestCaseResultWithStdout,
    #[serde(rename = "traceResponses")]
    pub trace_responses: Vec<SubmissionTraceResponse>,
}
