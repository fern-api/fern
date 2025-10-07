pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestSubmissionStatusV2 {
    pub updates: Vec<TestSubmissionUpdate>,
    #[serde(rename = "problemId")]
    pub problem_id: ProblemId,
    #[serde(rename = "problemVersion")]
    pub problem_version: i64,
    #[serde(rename = "problemInfo")]
    pub problem_info: ProblemInfoV2,
}