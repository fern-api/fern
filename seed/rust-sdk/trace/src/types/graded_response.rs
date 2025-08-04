use crate::submission_id::SubmissionId;
use crate::test_case_result_with_stdout::TestCaseResultWithStdout;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GradedResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    #[serde(rename = "testCases")]
    pub test_cases: HashMap<String, TestCaseResultWithStdout>,
}