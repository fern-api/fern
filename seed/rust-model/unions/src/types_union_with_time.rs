use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithTime {
        Value {
            value: i64,
        },

        Date {
            value: NaiveDate,
        },

        Datetime {
            value: DateTime<Utc>,
        },
}
