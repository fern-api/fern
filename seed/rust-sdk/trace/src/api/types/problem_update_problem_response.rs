pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UpdateProblemResponse {
    #[serde(rename = "problemVersion")]
    #[serde(default)]
    pub problem_version: i64,
}
