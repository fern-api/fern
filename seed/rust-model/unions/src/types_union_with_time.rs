use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum UnionWithTime {
        Value {
            value: i32,
        },

        Date {
            value: NaiveDate,
        },

        Datetime {
            value: DateTime<Utc>,
        },
}
