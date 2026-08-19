pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum EventInfo {
    #[serde(rename = "metadata")]
    #[non_exhaustive]
    Metadata {
        #[serde(flatten)]
        data: Metadata,
    },

    #[serde(rename = "tag")]
    #[non_exhaustive]
    Tag { value: Tag },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl EventInfo {
    pub fn metadata(data: Metadata) -> Self {
        Self::Metadata { data }
    }

    pub fn tag(value: Tag) -> Self {
        Self::Tag { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
