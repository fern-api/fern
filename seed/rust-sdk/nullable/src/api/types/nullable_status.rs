use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum Status {
    Active,

    Archived {
        value: Option<DateTime<Utc>>,
    },

    #[serde(rename = "soft-deleted")]
    SoftDeleted {
        value: Option<DateTime<Utc>>,
    },
}
