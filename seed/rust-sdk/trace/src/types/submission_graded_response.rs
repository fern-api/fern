use crate::submission_submission_id::SubmissionId;
use crate::submission_test_case_result_with_stdout::TestCaseResultWithStdout;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GradedResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    #[serde(rename = "testCases")]
    pub test_cases: HashMap<String, TestCaseResultWithStdout>,
}
