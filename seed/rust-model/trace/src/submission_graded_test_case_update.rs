use crate::v_2_problem_test_case_id::TestCaseId;
use crate::submission_test_case_grade::TestCaseGrade;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GradedTestCaseUpdate {
    #[serde(rename = "testCaseId")]
    pub test_case_id: TestCaseId,
    pub grade: TestCaseGrade,
}