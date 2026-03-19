pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestSubmissionStatusV2 {
    #[serde(default)]
    pub updates: Vec<TestSubmissionUpdate>,
    #[serde(rename = "problemId")]
    #[serde(default)]
    pub problem_id: ProblemId,
    #[serde(rename = "problemVersion")]
    #[serde(default)]
    pub problem_version: i64,
    #[serde(rename = "problemInfo")]
    pub problem_info: ProblemInfoV2,
}