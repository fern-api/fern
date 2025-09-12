use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UpdateProblemResponse {
    #[serde(rename = "problemVersion")]
    pub problem_version: i32,
}