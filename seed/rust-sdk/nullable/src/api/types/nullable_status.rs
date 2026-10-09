pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum Status {
    #[serde(rename = "active")]
    #[non_exhaustive]
    Active {},

    #[serde(rename = "archived")]
    #[non_exhaustive]
    Archived {
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        value: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "soft-deleted")]
    #[non_exhaustive]
    SoftDeleted {
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        value: Option<DateTime<FixedOffset>>,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl Status {
    pub fn active() -> Self {
        Self::Active {}
    }

    pub fn archived(value: Option<DateTime<FixedOffset>>) -> Self {
        Self::Archived { value }
    }

    pub fn soft_deleted(value: Option<DateTime<FixedOffset>>) -> Self {
        Self::SoftDeleted { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
