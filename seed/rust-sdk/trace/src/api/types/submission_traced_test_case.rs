pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionTracedTestCase {
    pub result: SubmissionTestCaseResultWithStdout,
    #[serde(rename = "traceResponsesSize")]
    pub trace_responses_size: i64,
}
