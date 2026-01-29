pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct RecordedTestCaseUpdate {
    #[serde(rename = "testCaseId")]
    pub test_case_id: TestCaseId,
    #[serde(rename = "traceResponsesSize")]
    pub trace_responses_size: i64,
}