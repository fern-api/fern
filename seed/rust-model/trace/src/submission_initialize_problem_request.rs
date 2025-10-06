pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct InitializeProblemRequest {
    #[serde(rename = "problemId")]
    pub problem_id: ProblemId,
    #[serde(rename = "problemVersion")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub problem_version: Option<i64>,
}