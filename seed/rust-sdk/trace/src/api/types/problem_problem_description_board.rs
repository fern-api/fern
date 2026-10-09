pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum ProblemDescriptionBoard {
    #[serde(rename = "html")]
    #[non_exhaustive]
    Html { value: String },

    #[serde(rename = "variable")]
    #[non_exhaustive]
    Variable { value: VariableValue },

    #[serde(rename = "testCaseId")]
    #[non_exhaustive]
    TestCaseId { value: String },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl ProblemDescriptionBoard {
    pub fn html(value: String) -> Self {
        Self::Html { value }
    }

    pub fn variable(value: VariableValue) -> Self {
        Self::Variable { value }
    }

    pub fn test_case_id(value: String) -> Self {
        Self::TestCaseId { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
