pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UpdateProblemResponse {
    #[serde(rename = "problemVersion")]
    pub problem_version: i64,
}