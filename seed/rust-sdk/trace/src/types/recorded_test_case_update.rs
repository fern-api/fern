use crate::test_case_id::TestCaseId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct RecordedTestCaseUpdate {
    #[serde(rename = "testCaseId")]
    pub test_case_id: TestCaseId,
    #[serde(rename = "traceResponsesSize")]
    pub trace_responses_size: i32,
}