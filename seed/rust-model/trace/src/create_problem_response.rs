use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum CreateProblemResponse {
        Success {
            value: ProblemId,
        },

        Error {
            value: CreateProblemError,
        },
}
