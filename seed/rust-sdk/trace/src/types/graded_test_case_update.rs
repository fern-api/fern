use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GradedTestCaseUpdate {
    #[serde(rename = "testCaseId")]
    pub test_case_id: TestCaseId,
    pub grade: TestCaseGrade,
}