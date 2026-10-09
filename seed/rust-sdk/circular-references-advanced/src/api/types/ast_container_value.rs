pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum ContainerValue {
    #[serde(rename = "list")]
    #[non_exhaustive]
    List { value: Vec<Box<FieldValue>> },

    #[serde(rename = "optional")]
    #[non_exhaustive]
    Optional { value: Option<Box<FieldValue>> },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl ContainerValue {
    pub fn list(value: Vec<Box<FieldValue>>) -> Self {
        Self::List { value }
    }

    pub fn optional(value: Option<Box<FieldValue>>) -> Self {
        Self::Optional { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
