pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum CreateProblemResponse {
        #[serde(rename = "success")]
        Success {
            value: ProblemId,
        },

        #[serde(rename = "error")]
        Error {
            value: CreateProblemError,
        },
}
