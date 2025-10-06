pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum ProblemCreateProblemResponse {
    Success { value: CommonsProblemId },

    Error { value: ProblemCreateProblemError },
}
