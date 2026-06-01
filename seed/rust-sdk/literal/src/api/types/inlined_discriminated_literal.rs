pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum DiscriminatedLiteral {
    #[serde(rename = "customName")]
    #[non_exhaustive]
    CustomName { value: String },

    #[serde(rename = "defaultName")]
    #[non_exhaustive]
    DefaultName { value: String },

    #[serde(rename = "george")]
    #[non_exhaustive]
    George { value: bool },

    #[serde(rename = "literalGeorge")]
    #[non_exhaustive]
    LiteralGeorge { value: bool },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl DiscriminatedLiteral {
    pub fn custom_name(value: String) -> Self {
        Self::CustomName { value }
    }

    pub fn default_name(value: String) -> Self {
        Self::DefaultName { value }
    }

    pub fn george(value: bool) -> Self {
        Self::George { value }
    }

    pub fn literal_george(value: bool) -> Self {
        Self::LiteralGeorge { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
