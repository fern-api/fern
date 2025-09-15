use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum UnionWithOptionalTime {
        Date {
            value: Option<chrono::NaiveDate>,
        },

        Datetime {
            value: Option<chrono::DateTime<chrono::Utc>>,
        },
}
