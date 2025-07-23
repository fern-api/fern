use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum Status {
        Active,

        Archived {
            value: Option<chrono::DateTime<chrono::Utc>>,
        },

        #[serde(rename = "soft-deleted")]
        SoftDeleted {
            value: Option<chrono::DateTime<chrono::Utc>>,
        },
}
