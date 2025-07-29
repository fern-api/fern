use crate::test_submission_update::TestSubmissionUpdate;
use crate::problem_id::ProblemId;
use crate::problem_info_v_2::ProblemInfoV2;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestSubmissionStatusV2 {
    pub updates: Vec<TestSubmissionUpdate>,
    #[serde(rename = "problemId")]
    pub problem_id: ProblemId,
    #[serde(rename = "problemVersion")]
    pub problem_version: i32,
    #[serde(rename = "problemInfo")]
    pub problem_info: ProblemInfoV2,
}