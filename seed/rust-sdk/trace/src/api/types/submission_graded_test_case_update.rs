pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GradedTestCaseUpdate {
    #[serde(rename = "testCaseId")]
    #[serde(default)]
    pub test_case_id: TestCaseId,
    pub grade: TestCaseGrade,
}
