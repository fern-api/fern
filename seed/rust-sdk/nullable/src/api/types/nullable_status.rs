pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
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
}
