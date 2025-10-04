pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GradedTestCaseUpdate {
    #[serde(rename = "testCaseId")]
    pub test_case_id: V2ProblemTestCaseId,
    pub grade: TestCaseGrade,
}
