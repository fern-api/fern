pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum StreamEventDiscriminantInData {
    #[serde(rename = "group.created")]
    #[non_exhaustive]
    GroupCreated {
        #[serde(default)]
        offset: String,
        #[serde(default)]
        group_id: String,
    },

    #[serde(rename = "group.deleted")]
    #[non_exhaustive]
    GroupDeleted {
        #[serde(default)]
        offset: String,
        #[serde(default)]
        group_id: String,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl StreamEventDiscriminantInData {
    pub fn group_created(offset: String, group_id: String) -> Self {
        Self::GroupCreated { offset, group_id }
    }

    pub fn group_deleted(offset: String, group_id: String) -> Self {
        Self::GroupDeleted { offset, group_id }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
