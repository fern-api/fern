pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum CreateProblemResponse {
    #[serde(rename = "success")]
    #[non_exhaustive]
    Success {
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<ProblemId>,
    },

    #[serde(rename = "error")]
    #[non_exhaustive]
    Error {
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<CreateProblemError>,
    },
}

impl CreateProblemResponse {
    pub fn success() -> Self {
        Self::Success { value: None }
    }

    pub fn error() -> Self {
        Self::Error { value: None }
    }

    pub fn success_with_value(value: ProblemId) -> Self {
        Self::Success { value: Some(value) }
    }

    pub fn error_with_value(value: CreateProblemError) -> Self {
        Self::Error { value: Some(value) }
    }
}
