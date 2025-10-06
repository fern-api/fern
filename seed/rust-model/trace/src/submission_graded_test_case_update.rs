pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionGradedTestCaseUpdate {
    #[serde(rename = "testCaseId")]
    pub test_case_id: V2ProblemTestCaseId,
    pub grade: SubmissionTestCaseGrade,
}