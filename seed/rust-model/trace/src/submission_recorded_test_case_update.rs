pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionRecordedTestCaseUpdate {
    #[serde(rename = "testCaseId")]
    pub test_case_id: V2ProblemTestCaseId,
    #[serde(rename = "traceResponsesSize")]
    pub trace_responses_size: i64,
}