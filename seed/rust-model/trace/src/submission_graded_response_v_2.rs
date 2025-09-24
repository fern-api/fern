use crate::submission_submission_id::SubmissionId;
use crate::v_2_problem_test_case_id::TestCaseId;
use crate::submission_test_case_grade::TestCaseGrade;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GradedResponseV2 {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    #[serde(rename = "testCases")]
    pub test_cases: HashMap<TestCaseId, TestCaseGrade>,
}