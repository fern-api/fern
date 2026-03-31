pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum CreateProblemResponse {
        #[serde(rename = "success")]
        #[non_exhaustive]
        Success {
            value: ProblemId,
        },

        #[serde(rename = "error")]
        #[non_exhaustive]
        Error {
            value: CreateProblemError,
        },
}

impl CreateProblemResponse {
    pub fn success(value: ProblemId) -> Self {
        Self::Success { value }
    }

    pub fn error(value: CreateProblemError) -> Self {
        Self::Error { value }
    }
}
