pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionTestSubmissionStatusV2 {
    pub updates: Vec<SubmissionTestSubmissionUpdate>,
    #[serde(rename = "problemId")]
    pub problem_id: CommonsProblemId,
    #[serde(rename = "problemVersion")]
    pub problem_version: i64,
    #[serde(rename = "problemInfo")]
    pub problem_info: V2ProblemProblemInfoV2,
}