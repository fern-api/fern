pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum TestCaseImplementationDescriptionBoard {
    #[serde(rename = "html")]
    #[non_exhaustive]
    Html { value: String },

    #[serde(rename = "paramId")]
    #[non_exhaustive]
    ParamId { value: ParameterId },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl TestCaseImplementationDescriptionBoard {
    pub fn html(value: String) -> Self {
        Self::Html { value }
    }

    pub fn param_id(value: ParameterId) -> Self {
        Self::ParamId { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
