pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum UnionWithSameStringTypes {
    #[serde(rename = "customFormat")]
    #[non_exhaustive]
    CustomFormat { value: String },

    #[serde(rename = "regularString")]
    #[non_exhaustive]
    RegularString { value: String },

    #[serde(rename = "patternString")]
    #[non_exhaustive]
    PatternString { value: String },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl UnionWithSameStringTypes {
    pub fn custom_format(value: String) -> Self {
        Self::CustomFormat { value }
    }

    pub fn regular_string(value: String) -> Self {
        Self::RegularString { value }
    }

    pub fn pattern_string(value: String) -> Self {
        Self::PatternString { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
