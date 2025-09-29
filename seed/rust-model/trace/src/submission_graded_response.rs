use crate::submission_submission_id::SubmissionId;
use crate::submission_test_case_result_with_stdout::TestCaseResultWithStdout;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GradedResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    #[serde(rename = "testCases")]
    pub test_cases: HashMap<String, TestCaseResultWithStdout>,
}