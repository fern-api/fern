pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ProblemUpdateProblemResponse {
    #[serde(rename = "problemVersion")]
    pub problem_version: i64,
}
