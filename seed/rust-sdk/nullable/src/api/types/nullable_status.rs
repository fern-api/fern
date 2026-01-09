pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum Status {
    Active,

    Archived {
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        value: Option<DateTime<FixedOffset>>,
    },

    #[serde(rename = "soft-deleted")]
    SoftDeleted {
        #[serde(default)]
        #[serde(with = "crate::core::flexible_datetime::offset::option")]
        value: Option<DateTime<FixedOffset>>,
    },
}
