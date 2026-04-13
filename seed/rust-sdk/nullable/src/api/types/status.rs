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
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "soft-deleted")]
    #[non_exhaustive]
    SoftDeleted {
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<DateTime<FixedOffset>>,
    },
}

impl Status {
    pub fn active() -> Self {
        Self::Active {}
    }

    pub fn archived() -> Self {
        Self::Archived { value: None }
    }

    pub fn soft_deleted() -> Self {
        Self::SoftDeleted { value: None }
    }

    pub fn archived_with_value(value: DateTime<FixedOffset>) -> Self {
        Self::Archived { value: Some(value) }
    }

    pub fn soft_deleted_with_value(value: DateTime<FixedOffset>) -> Self {
        Self::SoftDeleted { value: Some(value) }
    }
}
