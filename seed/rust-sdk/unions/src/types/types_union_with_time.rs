use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum UnionWithTime {
        Value {
            value: i32,
        },

        Date {
            value: chrono::NaiveDate,
        },

        Datetime {
            value: chrono::DateTime<chrono::Utc>,
        },
}
