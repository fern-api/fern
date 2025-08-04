use crate::submission_id::SubmissionId;
use crate::test_case_id::TestCaseId;
use crate::test_case_grade::TestCaseGrade;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GradedResponseV2 {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    #[serde(rename = "testCases")]
    pub test_cases: HashMap<TestCaseId, TestCaseGrade>,
}