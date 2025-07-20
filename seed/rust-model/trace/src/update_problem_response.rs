use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UpdateProblemResponse {
    #[serde(rename = "problemVersion")]
    pub problem_version: i32,
}