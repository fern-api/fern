pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct RecordedTestCaseUpdate {
    #[serde(rename = "testCaseId")]
    #[serde(default)]
    pub test_case_id: TestCaseId,
    #[serde(rename = "traceResponsesSize")]
    #[serde(default)]
    pub trace_responses_size: i64,
}