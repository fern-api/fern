use crate::submission_submission_id::SubmissionId;
use crate::submission_test_case_grade::TestCaseGrade;
use crate::v_2_problem_test_case_id::TestCaseId;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GradedResponseV2 {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    #[serde(rename = "testCases")]
    pub test_cases: HashMap<TestCaseId, TestCaseGrade>,
}
